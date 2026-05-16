#!/usr/bin/env node
import { randomUUID } from 'node:crypto';

const PRIMARY_PROJECT_REF = process.env.PRIMARY_PROJECT_REF || 'ovxttubotjebnaoedllu';
const LEGACY_PROJECT_REFS = (process.env.LEGACY_PROJECT_REFS || 'bujsbcebtwooqfqkiqla,ycmwimpznfjxvayjiejk')
  .split(',')
  .map((ref) => ref.trim())
  .filter(Boolean);

const DEFAULT_EXPORT_TABLES = ['jobs', 'candidates', 'applications', 'website_applications'];
const EXPORT_TABLES = (process.env.LEGACY_EXPORT_TABLES || DEFAULT_EXPORT_TABLES.join(','))
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

const DEFAULT_IMPORT_TABLE_MAP = {
  jobs: 'import_jobs',
  candidates: 'import_candidates',
  applications: 'import_applications',
  website_applications: 'import_website_applications',
};
const IMPORT_TABLE_MAP = {
  ...DEFAULT_IMPORT_TABLE_MAP,
  ...parseJsonEnv('LEGACY_IMPORT_TABLE_MAP', {}),
};

const PAGE_SIZE = Number.parseInt(process.env.LEGACY_EXPORT_PAGE_SIZE || '1000', 10);
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const IMPORT_SCHEMA = process.env.LEGACY_IMPORT_SCHEMA || 'legacy_import';
const LEGACY_KEYS = parseJsonEnv('LEGACY_SUPABASE_SERVICE_ROLE_KEYS', {});
const LEGACY_URLS = parseJsonEnv('LEGACY_SUPABASE_URLS', {});

const SECRET_KEY_PATTERN = /(instantly.*(api|key|token|secret)|api[_-]?key|secret|password)/i;
const SECRET_VALUE_PATTERN = /(instantly\.(ai|com)|instantly[_-]?(api|key|token))/i;

function parseJsonEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${name} must be valid JSON: ${error.message}`);
  }
}

function envName(prefix, projectRef, suffix) {
  return `${prefix}_${projectRef.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_${suffix}`;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function supabaseUrl(projectRef, kind) {
  if (kind === 'primary') {
    return process.env.PRIMARY_SUPABASE_URL || `https://${projectRef}.supabase.co`;
  }
  return LEGACY_URLS[projectRef] || process.env[envName('LEGACY', projectRef, 'SUPABASE_URL')] || `https://${projectRef}.supabase.co`;
}

function legacyServiceKey(projectRef) {
  return LEGACY_KEYS[projectRef] || process.env[envName('LEGACY', projectRef, 'SUPABASE_SERVICE_ROLE_KEY')];
}

function sanitize(value) {
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (!value || typeof value !== 'object') return value;

  const sanitized = {};
  for (const [key, nested] of Object.entries(value)) {
    if (SECRET_KEY_PATTERN.test(key) || (typeof nested === 'string' && SECRET_VALUE_PATTERN.test(nested))) {
      sanitized[key] = '[withheld: not migrated by Supabase consolidation]';
      continue;
    }
    sanitized[key] = sanitize(nested);
  }
  return sanitized;
}

function legacyIdFor(record) {
  return String(record.id ?? record.uuid ?? record.application_id ?? record.candidate_id ?? record.job_id ?? randomUUID());
}

async function supabaseRestRequest({ baseUrl, key, tableName, schema = 'public', query = '', method = 'GET', body, headers = {} }) {
  const url = `${baseUrl.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(tableName)}${query}`;
  const response = await fetch(url, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(schema === 'public' ? {} : { 'Accept-Profile': schema, 'Content-Profile': schema }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${url} failed with ${response.status}: ${text}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function fetchAll(client, tableName) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const data = await supabaseRestRequest({
      ...client,
      tableName,
      query: '?select=*',
      headers: { Range: `${from}-${to}`, Prefer: 'count=none' },
    });
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

async function insertRows(primary, importTable, rows) {
  for (let index = 0; index < rows.length; index += PAGE_SIZE) {
    const batch = rows.slice(index, index + PAGE_SIZE);
    await supabaseRestRequest({
      ...primary,
      schema: IMPORT_SCHEMA,
      tableName: importTable,
      query: '?on_conflict=source_project_ref,legacy_table,legacy_id',
      method: 'POST',
      body: batch,
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    });
  }
}

async function main() {
  const primaryKey = requiredEnv('PRIMARY_SUPABASE_SERVICE_ROLE_KEY');
  const primary = { baseUrl: supabaseUrl(PRIMARY_PROJECT_REF, 'primary'), key: primaryKey };

  const summary = [];
  for (const projectRef of LEGACY_PROJECT_REFS) {
    const key = legacyServiceKey(projectRef);
    if (!key) throw new Error(`Missing service-role key for ${projectRef}. Set ${envName('LEGACY', projectRef, 'SUPABASE_SERVICE_ROLE_KEY')} or LEGACY_SUPABASE_SERVICE_ROLE_KEYS.`);

    const legacy = { baseUrl: supabaseUrl(projectRef, 'legacy'), key };

    for (const tableName of EXPORT_TABLES) {
      const importTable = IMPORT_TABLE_MAP[tableName];
      if (!importTable) throw new Error(`No import table mapped for legacy table ${tableName}. Set LEGACY_IMPORT_TABLE_MAP.`);

      const exportedRows = await fetchAll(legacy, tableName);
      const importRows = exportedRows.map((row) => ({
        source_project_ref: projectRef,
        legacy_table: tableName,
        legacy_id: legacyIdFor(row),
        payload: sanitize(row),
        raw_record: sanitize(row),
        exported_at: new Date().toISOString(),
      }));

      if (!DRY_RUN && importRows.length > 0) await insertRows(primary, importTable, importRows);
      summary.push({ projectRef, tableName, importTable, rows: importRows.length, mode: DRY_RUN ? 'dry-run' : 'inserted' });
    }
  }

  console.table(summary);
  console.log('Export/import complete. Next run the legacy_import SQL mapping into public.roles, public.candidates, and public.candidate_role_matches, then validate apps before changing Vercel env vars or pausing legacy projects.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
