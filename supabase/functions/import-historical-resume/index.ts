import { requireAuth } from '../_shared/auth.ts';
import { adminClient, failure, json, rpcError } from '../_shared/application-runtime.ts';
import { ApplicationError, MAX_REQUEST_BYTES, RESUME_BUCKET, readBoundedBody, sha256, validateResume } from '../_shared/application-validation.ts';
import { validateHistoricalResume } from '../_shared/historical-resume.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return json(req, { ok: true });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed.' }, 405);
  try {
    const user = await requireAuth(req);
    const db = adminClient();
    const scope = await db.rpc('ats_import_scope', { p_actor: user.id });
    rpcError(scope.error);
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data;')) throw new ApplicationError('Choose an import manifest and résumé files.');
    const body = await readBoundedBody(req, MAX_REQUEST_BYTES);
    const form = await new Request(req.url, { method: 'POST', headers: { 'content-type': contentType }, body: new Uint8Array(body).buffer }).formData();
    const raw = form.get('metadata');
    if (typeof raw !== 'string' || raw.length > 60000) throw new ApplicationError('Invalid import metadata.');
    let metadata;
    try { metadata = JSON.parse(raw); } catch { throw new ApplicationError('Invalid import metadata.'); }
    const payload = validateHistoricalResume(metadata);
    const file = form.get('resume');
    if (!(file instanceof File)) throw new ApplicationError('Choose a résumé file.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const resume = validateResume(file.name, file.type, bytes);
    const hash = await sha256(bytes);
    if (hash !== payload.upload_sha256) throw new ApplicationError('The résumé does not match the reviewed checksum.', 422);
    const path = `historical/${scope.data}/${hash}.${resume.extension}`;
    const bucket = db.storage.from(RESUME_BUCKET);
    const upload = await bucket.upload(path, bytes, { contentType: resume.contentType, upsert: false });
    if (upload.error) {
      // A retry may find an existing object. Verify its bytes; never overwrite it.
      const existing = await bucket.download(path);
      if (existing.error || !existing.data || await sha256(new Uint8Array(await existing.data.arrayBuffer())) !== hash) throw new ApplicationError('Unable to verify the stored résumé. Retry this file.', 409);
    }
    const result = await db.rpc('ats_import_resume', { p_actor: user.id, p_payload: payload, p_path: path, p_filename: resume.filename });
    if (result.error?.message === 'import_identity_conflict') throw new ApplicationError('This checksum already belongs to a different reviewed identity. Review it before retrying.', 409);
    rpcError(result.error);
    return json(req, { data: result.data });
  } catch (error) { return failure(req, error); }
});
