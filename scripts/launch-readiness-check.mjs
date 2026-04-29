#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const ENV_REF_PATTERNS = [
  /Deno\.env\.get\(\s*['"]([A-Z0-9_]+)['"]\s*\)/g,
  /process\.env\.([A-Z0-9_]+)/g,
  /import\.meta\.env\.([A-Z0-9_]+)/g,
];

const ENV_ALLOWLIST = new Set([
  'npm_package_version',
]);

const REQUIRED_FRONTEND_ENV_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

const REQUIRED_EDGE_FUNCTIONS = [
  'health-check',
  'generate-outreach',
  'ai-completion',
  'ai-parse-resume',
  'ai-score-candidates',
  'ai-match-candidates',
  'ai-source-candidates',
  'ai-process-email',
];

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function walk(dir, filter = () => true, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, filter, out);
      continue;
    }
    if (filter(full)) out.push(full);
  }
  return out;
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function collectEnvFromCode(files) {
  const keys = new Set();
  for (const file of files) {
    const text = readFileSafe(file);
    for (const pattern of ENV_REF_PATTERNS) {
      for (const match of text.matchAll(pattern)) {
        const key = match[1];
        if (key && !ENV_ALLOWLIST.has(key)) keys.add(key);
      }
    }
  }
  return keys;
}

function collectEnvFromExample(filePath) {
  const keys = new Set();
  const text = readFileSafe(filePath);
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)=/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

function checkFunctionAuthCoverage() {
  const base = path.join(repoRoot, 'supabase/functions');
  if (!fs.existsSync(base)) return [];
  const dirs = fs.readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== '_shared')
    .map((d) => d.name);

  const missing = [];
  for (const name of dirs) {
    const entryFile = path.join(base, name, 'index.ts');
    if (!fs.existsSync(entryFile)) continue;
    const text = readFileSafe(entryFile);
    const hasAuth = text.includes('requireFunctionAuth(') || text.includes('requireAuth(');
    if (!hasAuth) {
      missing.push(relative(entryFile));
    }
  }
  return missing;
}

function checkOnboardingRedirect() {
  const appLayout = path.join(repoRoot, 'src/components/app/AppLayout.tsx');
  const text = readFileSafe(appLayout);
  if (!text) return 'missing_app_layout';
  if (text.includes("withNextParam('/onboarding',")) return 'dead_onboarding_route';
  return null;
}

function checkRequiredRuntimeEnv() {
  return REQUIRED_FRONTEND_ENV_KEYS.filter((key) => !process.env[key]);
}

function collectSupabaseFunctionNames() {
  const base = path.join(repoRoot, 'supabase/functions');
  if (!fs.existsSync(base)) return new Set();
  return new Set(
    fs.readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== '_shared')
      .map((d) => d.name),
  );
}

function main() {
  const tsJsFiles = walk(repoRoot, (file) => /\.(ts|tsx|js|mjs|cjs)$/.test(file) && !file.includes('/node_modules/') && !file.includes('/.git/'));
  const codeEnv = collectEnvFromCode(tsJsFiles);
  const envExampleKeys = collectEnvFromExample(path.join(repoRoot, '.env.example'));

  const missingEnv = [...codeEnv].filter((k) => !envExampleKeys.has(k)).sort();
  const missingAuthFiles = checkFunctionAuthCoverage();
  const onboardingIssue = checkOnboardingRedirect();
  const missingRuntimeEnv = checkRequiredRuntimeEnv();
  const availableFunctions = collectSupabaseFunctionNames();
  const missingFunctions = REQUIRED_EDGE_FUNCTIONS.filter((name) => !availableFunctions.has(name));

  let failed = false;

  if (missingEnv.length > 0) {
    failed = true;
    console.error('❌ Missing .env.example keys referenced in code:');
    for (const key of missingEnv) console.error(`  - ${key}`);
  } else {
    console.log('✅ .env.example covers all env keys referenced in code.');
  }

  if (missingAuthFiles.length > 0) {
    failed = true;
    console.error('❌ Edge function auth coverage missing in:');
    for (const file of missingAuthFiles) console.error(`  - ${file}`);
  } else {
    console.log('✅ All edge function entrypoints reference auth guards.');
  }

  if (missingRuntimeEnv.length > 0) {
    failed = true;
    console.error('❌ Missing required runtime environment variables (values hidden):');
    for (const key of missingRuntimeEnv) console.error(`  - ${key}`);
  } else {
    console.log('✅ Required frontend environment variables are present.');
  }

  if (missingFunctions.length > 0) {
    failed = true;
    console.error('❌ Missing required Supabase Edge Functions:');
    for (const name of missingFunctions) console.error(`  - ${name}`);
  } else {
    console.log('✅ Required Supabase Edge Functions are present.');
  }

  if (onboardingIssue) {
    failed = true;
    console.error('❌ Onboarding redirect check failed:', onboardingIssue);
  } else {
    console.log('✅ Onboarding redirect path check passed.');
  }

  if (failed) {
    process.exitCode = 1;
    return;
  }

  console.log('\nLaunch readiness static checks passed.');
}

main();
