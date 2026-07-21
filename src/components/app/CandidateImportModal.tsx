import { useRef, useState } from 'react';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

/**
 * Bulk CSV candidate import for a role. Parses client-side, previews,
 * inserts candidates (skipping rows whose email already exists on the
 * role), and records a candidate_import_batches row with counts.
 *
 * Expected headers (case-insensitive; only full_name required):
 * full_name, email, phone, current_title, current_company, location,
 * experience_years, skills (semicolon-separated)
 */

interface ImportRow {
  full_name: string;
  email: string | null;
  phone: string | null;
  current_title: string | null;
  current_company: string | null;
  location: string | null;
  experience_years: number | null;
  skills: string[];
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
}

function toImportRows(csv: string[][]): { rows: ImportRow[]; errors: string[] } {
  if (csv.length < 2) return { rows: [], errors: ['File needs a header row and at least one data row.'] };
  const headers = csv[0].map((header) => header.trim().toLowerCase().replace(/\s+/g, '_'));
  const nameIdx = headers.indexOf('full_name');
  if (nameIdx === -1) return { rows: [], errors: ['Missing required "full_name" column.'] };
  const idx = (key: string) => headers.indexOf(key);
  const errors: string[] = [];
  const rows: ImportRow[] = [];
  csv.slice(1).forEach((cells, rowIndex) => {
    const get = (key: string) => {
      const i = idx(key);
      return i === -1 ? '' : (cells[i] ?? '').trim();
    };
    const fullName = (cells[nameIdx] ?? '').trim();
    if (!fullName) {
      errors.push(`Row ${rowIndex + 2}: missing full_name — skipped.`);
      return;
    }
    const yearsRaw = get('experience_years');
    rows.push({
      full_name: fullName,
      email: get('email') || null,
      phone: get('phone') || null,
      current_title: get('current_title') || null,
      current_company: get('current_company') || null,
      location: get('location') || null,
      experience_years: yearsRaw && !Number.isNaN(Number(yearsRaw)) ? Number(yearsRaw) : null,
      skills: get('skills') ? get('skills').split(';').map((skill) => skill.trim()).filter(Boolean) : [],
    });
  });
  return { rows, errors };
}

export default function CandidateImportModal({
  roleId,
  isOpen,
  onClose,
  onImported,
}: {
  roleId: string;
  isOpen: boolean;
  onClose: () => void;
  onImported: (createdCount: number) => void;
}) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFileName(null);
    setRows([]);
    setParseErrors([]);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleFile(file: File) {
    const text = await file.text();
    const { rows: parsed, errors } = toImportRows(parseCsv(text));
    setFileName(file.name);
    setRows(parsed);
    setParseErrors(errors);
    setError(null);
  }

  async function runImport() {
    if (!user?.org_id || rows.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      const { data: existing, error: existingError } = await supabase
        .from('candidates')
        .select('email')
        .eq('role_id', roleId);
      if (existingError) throw existingError;
      const existingEmails = new Set(
        ((existing ?? []) as Array<{ email: string | null }>)
          .map((candidate) => candidate.email?.toLowerCase())
          .filter(Boolean) as string[],
      );

      const fresh = rows.filter((row) => !row.email || !existingEmails.has(row.email.toLowerCase()));
      const skipped = rows.length - fresh.length;

      let created = 0;
      if (fresh.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from('candidates')
          .insert(
            fresh.map((row) => ({
              org_id: user.org_id,
              role_id: roleId,
              full_name: row.full_name,
              email: row.email,
              phone: row.phone,
              current_title: row.current_title,
              current_company: row.current_company,
              location: row.location,
              experience_years: row.experience_years,
              skills: row.skills,
              source: 'csv_import',
              pipeline_stage: 'discovered',
            })),
          )
          .select('id');
        if (insertError) throw insertError;
        created = inserted?.length ?? 0;
      }

      const { error: batchError } = await supabase.from('candidate_import_batches').insert({
        org_id: user.org_id,
        role_id: roleId,
        source: 'csv',
        status: 'completed',
        total_rows: rows.length,
        created_count: created,
        updated_count: 0,
        skipped_count: skipped,
        errors: parseErrors,
        created_by: user.id,
      });
      if (batchError) throw batchError;

      onImported(created);
      reset();
      onClose();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(9,9,11,0.45)' }}>
      <div className="card w-full max-w-2xl" style={{ padding: 20, maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Import candidates from CSV</h2>
          <button className="btn-ghost" type="button" aria-label="Close import modal" onClick={() => { reset(); onClose(); }}>
            <X size={14} />
          </button>
        </div>

        <div
          className="rounded-lg border border-dashed p-6 text-center"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
        >
          <FileSpreadsheet size={26} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
            {fileName ?? 'Columns: full_name (required), email, phone, current_title, current_company, location, experience_years, skills (a;b;c)'}
          </p>
          <button className="btn-secondary" type="button" onClick={() => fileRef.current?.click()}>
            <Upload size={14} style={{ marginRight: 6 }} /> Choose CSV file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>

        {parseErrors.length > 0 ? (
          <div className="mt-3 rounded-lg p-3" style={{ backgroundColor: 'var(--warning-subtle)' }}>
            {parseErrors.slice(0, 5).map((message) => (
              <p key={message} style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>{message}</p>
            ))}
            {parseErrors.length > 5 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>…and {parseErrors.length - 5} more.</p>
            ) : null}
          </div>
        ) : null}

        {rows.length > 0 ? (
          <div className="mt-4">
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              Preview — {rows.length} candidate{rows.length === 1 ? '' : 's'} ready
            </p>
            <div className="rounded-lg border overflow-x-auto" style={{ borderColor: 'var(--border)', maxHeight: 220, overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: 8 }}>Name</th>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Title</th>
                    <th style={{ padding: 8 }}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 30).map((row, index) => (
                    <tr key={`${row.full_name}-${index}`} style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      <td style={{ padding: 8, color: 'var(--text-primary)', fontWeight: 600 }}>{row.full_name}</td>
                      <td style={{ padding: 8 }}>{row.email ?? '—'}</td>
                      <td style={{ padding: 8 }}>{row.current_title ?? '—'}</td>
                      <td style={{ padding: 8 }}>{row.location ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-3" style={{ color: 'var(--error)', fontSize: '0.8125rem' }}>{error}</p> : null}

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-secondary" type="button" onClick={() => { reset(); onClose(); }}>Cancel</button>
          <button className="btn-primary" type="button" disabled={rows.length === 0 || importing} onClick={() => void runImport()}>
            {importing ? 'Importing…' : `Import ${rows.length || ''} candidates`}
          </button>
        </div>
      </div>
    </div>
  );
}
