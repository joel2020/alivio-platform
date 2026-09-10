import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { validateHistoricalResume, type HistoricalResume } from '../../../supabase/functions/_shared/historical-resume.ts';
import { sha256, validateResume } from '../../../supabase/functions/_shared/application-validation.ts';

type Row = { name: string; hash: string; payload?: HistoricalResume; file?: File; reason?: string };
type Receipt = { name: string; sha256: string; status: string; id?: number; error?: string };

export default function HistoricalResumeImport({ onImported }: { onImported: () => void }) {
  const [manifest, setManifest] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const stopped = useRef(false);
  const ready = rows.filter(row => row.payload && row.file && !row.reason);

  async function review() {
    setBusy(true); setRows([]); setReceipts([]); setStatus('Checking files and reviewed checksums…');
    try {
      if (!manifest || manifest.size > 20 * 1024 * 1024) throw new Error('Choose a reviewed manifest smaller than 20 MB.');
      const data = JSON.parse(await manifest.text());
      if (!Array.isArray(data.records) || data.records.length > 10000) throw new Error('The manifest must contain reviewed records.');
      const byHash = new Map<string, File>();
      for (const file of files) {
        if (file.size <= 5 * 1024 * 1024 && /\.(pdf|docx)$/i.test(file.name)) byHash.set(await sha256(new Uint8Array(await file.arrayBuffer())), file);
      }
      const seen = new Set<string>();
      const reviewed: Row[] = [];
      for (const record of data.records) {
        const hash = String(record.upload_sha256 || '');
        const row: Row = { name: String(record.name || record.first_name || 'Unnamed record'), hash };
        try {
          if (seen.has(hash)) throw new Error('Repeated checksum in manifest; consolidate its sources before import.');
          seen.add(hash);
          row.payload = validateHistoricalResume({ first_name: record.first_name, last_name: record.last_name, email: record.email,
            upload_sha256: hash, original_sha256: record.original_sha256, batch: data.batch,
            sources: record.sources, notes: record.notes || [], flags: record.flags || [] });
          row.file = byHash.get(hash);
          if (!row.file) throw new Error('Matching résumé file not selected.');
          validateResume(row.file.name, row.file.type, new Uint8Array(await row.file.arrayBuffer()));
        } catch (error) { row.reason = error instanceof Error ? error.message : 'Review required.'; }
        reviewed.push(row);
      }
      setRows(reviewed); setStatus('Review complete. No records have been uploaded.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to review this manifest.'); }
    finally { setBusy(false); }
  }

  async function importReady() {
    stopped.current = false; setBusy(true); setReceipts([]);
    const journal: Receipt[] = [];
    for (const row of ready) {
      if (stopped.current) break;
      setStatus(`Importing ${journal.length + 1} of ${ready.length} résumé files…`);
      const receipt: Receipt = { name: row.name, sha256: row.hash, status: 'failed' };
      try {
        const body = new FormData(); body.set('metadata', JSON.stringify(row.payload)); body.set('resume', row.file!);
        const { data, error } = await supabase.functions.invoke('import-historical-resume', { body });
        if (error || data?.error) {
          let message = data?.error || 'Import failed. Retry this file.';
          if (error && 'context' in error && error.context instanceof Response) message = (await error.context.clone().json().catch(() => null))?.error || message;
          throw new Error(message);
        }
        if (!data?.data?.id || !['imported', 'existing'].includes(data.data.status) || data.data.sha256 !== row.hash) throw new Error('Import response could not be verified. Retry to confirm its status.');
        receipt.id = data.data.id; receipt.status = data.data.status;
      } catch (error) { receipt.error = error instanceof Error ? error.message : 'Import failed.'; }
      journal.push(receipt); setReceipts([...journal]);
    }
    setStatus(stopped.current ? 'Paused. You can safely retry the batch.' : 'Import run complete. Save the results below.');
    setBusy(false); onImported();
  }
  function downloadJournal() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ completed_at: new Date().toISOString(), records: receipts,
      held: rows.filter(row => row.reason).map(({ name, hash, reason }) => ({ name, hash, reason })) }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'historical-import-results.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <details className="ats-mapping"><summary>Import historical résumés</summary>
    <p>Import reviewed résumé versions into your organization. No emails are sent. Job matches, screening answers, and consent remain unrecorded. Uncertain identities stay held for review.</p>
    <div className="ats-form-grid"><label>Reviewed import manifest<input type="file" accept=".json" disabled={busy} onChange={event => { setManifest(event.target.files?.[0] || null); setRows([]); }} /></label>
      <label>Reviewed résumé files<input type="file" accept=".pdf,.docx" multiple disabled={busy} onChange={event => { setFiles(Array.from(event.target.files || [])); setRows([]); }} /></label>
      <label>Or choose a reviewed résumé folder<input type="file" {...{ webkitdirectory: '' }} multiple disabled={busy} onChange={event => { setFiles(Array.from(event.target.files || [])); setRows([]); }} /></label></div>
    <div className="ats-toolbar"><button disabled={busy || !manifest || !files.length} onClick={() => void review()}>Review selected files</button>
      <button className="ats-primary" disabled={busy || !ready.length} onClick={() => void importReady()}>Import {ready.length} ready résumés</button>
      {busy && receipts.length > 0 && <button onClick={() => { stopped.current = true; }}>Pause after current file</button>}
      {receipts.length > 0 && <button onClick={downloadJournal}>Save import results</button>}</div>
    <p role="status">{status}</p>
    {rows.length > 0 && <p>{rows.length} reviewed files · {ready.length} ready · {rows.length - ready.length} held or missing. These counts represent résumé versions, not unique people.</p>}
    {receipts.length > 0 && <p>{receipts.filter(item => item.status === 'imported').length} newly imported · {receipts.filter(item => item.status === 'existing').length} already saved · {receipts.filter(item => item.status === 'failed').length} failed.</p>}
    {(rows.some(row => row.reason) || receipts.some(item => item.error)) && <details><summary>Review holds and errors</summary><ul>{rows.filter(row => row.reason).map((row, index) => <li key={index}>{row.name}: {row.reason}</li>)}{receipts.filter(item => item.error).map(item => <li key={item.sha256}>{item.name}: {item.error}</li>)}</ul></details>}
  </details>;
}
