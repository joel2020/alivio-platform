import { ApplicationError, boundedText } from './application-validation.ts';

export interface HistoricalResume {
  first_name: string;
  last_name: string | null;
  email: string | null;
  upload_sha256: string;
  original_sha256: string;
  batch: string;
  sources: Record<string, unknown>[];
  notes: string[];
  flags: string[];
}
const keys = new Set(['first_name', 'last_name', 'email', 'upload_sha256', 'original_sha256', 'batch', 'sources', 'notes', 'flags']);
const hashPattern = /^[a-f0-9]{64}$/;
export const heldFlags = new Set(['identity_requires_review', 'email_requires_review', 'unsupported_upload_format']);

export function validateHistoricalResume(raw: unknown): HistoricalResume {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new ApplicationError('Invalid import metadata.');
  const p = raw as Record<string, unknown>;
  if (Object.keys(p).some(key => !keys.has(key))) throw new ApplicationError('Unexpected import field.');
  const strings = (value: unknown, name: string) => {
    if (!Array.isArray(value) || value.length > 100) throw new ApplicationError(`Invalid ${name}.`);
    return [...new Set(value.map(item => boundedText(item, name, 4000)))];
  };
  const flags = strings(p.flags, 'review flags');
  if (flags.some(flag => heldFlags.has(flag))) throw new ApplicationError('Resolve identity, contact, or file review before importing this résumé.', 422);
  const email = boundedText(p.email, 'email', 254, false) || null;
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new ApplicationError('Invalid candidate email.');
  if (!email && !flags.includes('missing_candidate_email')) flags.push('missing_candidate_email');
  if (!hashPattern.test(String(p.upload_sha256)) || !hashPattern.test(String(p.original_sha256))) throw new ApplicationError('Invalid résumé checksum.');
  if (!Array.isArray(p.sources) || p.sources.length < 1 || p.sources.length > 100) throw new ApplicationError('Provide the résumé source.');
  for (const source of p.sources) {
    if (!source || typeof source !== 'object' || Array.isArray(source) || JSON.stringify(source).length > 12000) throw new ApplicationError('Invalid résumé source.');
    try { if (new URL(source.url).protocol !== 'https:') throw new Error(); }
    catch { throw new ApplicationError('Provide a secure source email or Drive link.'); }
  }
  return {
    first_name: boundedText(p.first_name, 'candidate name', 150),
    last_name: boundedText(p.last_name, 'last name', 150, false) || null,
    email, upload_sha256: String(p.upload_sha256), original_sha256: String(p.original_sha256),
    batch: boundedText(p.batch, 'import batch', 150), sources: p.sources,
    notes: strings(p.notes, 'review notes'), flags,
  };
}
