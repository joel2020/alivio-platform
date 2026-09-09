export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_REQUEST_BYTES = MAX_RESUME_BYTES + 64 * 1024;
export const RESUME_BUCKET = 'application-resumes';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const STAGES = ['new', 'reviewing', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];
export class ApplicationError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
// Control characters other than tab/newline/CR are invalid user text.
export function boundedText(value: unknown, name: string, max: number, required = true): string {
  if (value == null && !required) return '';
  if (typeof value !== 'string' || value.length > max || Array.from(value).some(c => c.charCodeAt(0) < 32 && ![9, 10, 13].includes(c.charCodeAt(0)))) throw new ApplicationError(`Invalid ${name}.`);
  const clean = value.trim();
  if (required && !clean) throw new ApplicationError(`${name} is required.`);
  return clean;
}
export function validatePayload(raw: unknown) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new ApplicationError('Invalid application.');
  const p = raw as Record<string, unknown>;
  if (typeof p.submission_id !== 'string' || !UUID.test(p.submission_id)) throw new ApplicationError('Invalid submission reference.');
  if (!Number.isSafeInteger(p.job_id) || Number(p.job_id) <= 0) throw new ApplicationError('Invalid job.');
  if (p.privacy_consent !== true) throw new ApplicationError('Please agree to the privacy notice.');
  if (p.website) throw new ApplicationError('Unable to accept application.');
  const email = boundedText(p.email, 'email', 254).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new ApplicationError('Enter a valid email address.');
  const linkedin = boundedText(p.linkedin_url, 'LinkedIn URL', 500, false);
  if (linkedin) {
    let url: URL;
    try { url = new URL(linkedin); } catch { throw new ApplicationError('Enter a valid LinkedIn URL.'); }
    if (url.protocol !== 'https:' || !/^(www\.)?linkedin\.com$/i.test(url.hostname) || url.username || url.password) throw new ApplicationError('Enter a valid LinkedIn URL.');
  }
  if (!p.questionnaire || typeof p.questionnaire !== 'object' || Array.isArray(p.questionnaire)) throw new ApplicationError('Complete the questionnaire.');
  const answers = p.questionnaire as Record<string, unknown>;
  const questionnaire = Object.fromEntries(['location', 'experience', 'skills', 'availability', 'interest'].map(key => [key, boundedText(answers[key], key, 2000)]));
  return { submission_id: p.submission_id.toLowerCase(), job_id: Number(p.job_id), first_name: boundedText(p.first_name, 'first name', 100), last_name: boundedText(p.last_name, 'last name', 100), email, phone: boundedText(p.phone, 'phone', 50, false), linkedin_url: linkedin, privacy_consent: true, questionnaire };
}
// Validate ZIP central directory rather than trusting a PK prefix or embedded filename strings.
export function isDocx(bytes: Uint8Array): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 22 || view.getUint32(0, true) !== 0x04034b50) return false;
  let end = -1;
  for (let n = bytes.length - 22; n >= Math.max(0, bytes.length - 65557); n--) {
    if (view.getUint32(n, true) === 0x06054b50 && n + 22 + view.getUint16(n + 20, true) === bytes.length) { end = n; break; }
  }
  if (end < 0 || view.getUint16(end + 4, true) || view.getUint16(end + 6, true)) return false;
  const count = view.getUint16(end + 10, true), size = view.getUint32(end + 12, true), start = view.getUint32(end + 16, true);
  if (!count || count > 1000 || start + size !== end || view.getUint16(end + 8, true) !== count) return false;
  let at = start, expanded = 0;
  const names = new Set<string>();
  for (let n = 0; n < count; n++) {
    if (at + 46 > end || view.getUint32(at, true) !== 0x02014b50) return false;
    const flags = view.getUint16(at + 8, true), method = view.getUint16(at + 10, true);
    const length = view.getUint16(at + 28, true), extra = view.getUint16(at + 30, true), comment = view.getUint16(at + 32, true);
    const local = view.getUint32(at + 42, true), packed = view.getUint32(at + 20, true);
    expanded += view.getUint32(at + 24, true);
    if (flags & 1 || ![0, 8].includes(method) || expanded > 25 * 1024 * 1024 || at + 46 + length + extra + comment > end || local + 30 > start) return false;
    const name = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + length));
    if (names.has(name) || name.startsWith('/') || name.includes('..') || name.includes('\\') || /vbaProject|\.(exe|js|vbs|dll)$/i.test(name)) return false;
    if (view.getUint32(local, true) !== 0x04034b50 || view.getUint16(local + 8, true) !== method) return false;
    const localNameLength = view.getUint16(local + 26, true), localExtraLength = view.getUint16(local + 28, true);
    if (local + 30 + localNameLength + localExtraLength + packed > start || new TextDecoder().decode(bytes.subarray(local + 30, local + 30 + localNameLength)) !== name) return false;
    names.add(name); at += 46 + length + extra + comment;
  }
  return at === end && names.has('[Content_Types].xml') && names.has('word/document.xml');
}
export function validateResume(name: string, mime: string, bytes: Uint8Array) {
  if (!bytes.length || bytes.length > MAX_RESUME_BYTES) throw new ApplicationError('Upload a PDF or DOCX résumé up to 5 MB.');
  const extension = name.toLowerCase().split('.').pop();
  const text = new TextDecoder();
  const pdf = extension === 'pdf' && mime === 'application/pdf' && /^%PDF-1\.[0-9]|^%PDF-2\.0/.test(text.decode(bytes.subarray(0, 8))) && /%%EOF\s*$/.test(text.decode(bytes.subarray(-1024)));
  const docx = extension === 'docx' && mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && isDocx(bytes);
  if (!pdf && !docx) throw new ApplicationError('The résumé must be a valid PDF or DOCX file.');
  return { extension: extension!, contentType: mime, filename: name.replace(/[^a-zA-Z0-9 ._()-]/g, '_').slice(-180) };
}
export async function readBoundedBody(req: Request, max: number): Promise<Uint8Array> {
  if (Number(req.headers.get('content-length')) > max) throw new ApplicationError('Request is too large.', 413);
  const reader = req.body?.getReader();
  if (!reader) throw new ApplicationError('Request body is required.');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > max) { await reader.cancel(); throw new ApplicationError('Request is too large.', 413); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let at = 0;
  for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length; }
  return bytes;
}
export async function sha256(value: Uint8Array | string) {
  const data = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(data)))).map(x => x.toString(16).padStart(2, '0')).join('');
}
