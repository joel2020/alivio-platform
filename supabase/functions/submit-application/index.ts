import { ApplicationError, MAX_REQUEST_BYTES, RESUME_BUCKET, readBoundedBody, sha256, validatePayload, validateResume } from '../_shared/application-validation.ts';
import { adminClient, failure, json, rpcError, enqueueWorker } from '../_shared/application-runtime.ts';
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return json(req, { ok: true });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed.' }, 405);
  const db = adminClient(); let path: string | null = null;
  try {
    if (!req.headers.get('content-type')?.startsWith('multipart/form-data;')) throw new ApplicationError('A résumé upload is required.');
    // Hash the gateway-provided address; do not store raw IP addresses. Global bucket bounds header spoofing.
    const address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipHash = await sha256(`${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}:${address}`);
    const global = await db.rpc('ats_rate_limit', { p_key: 'application:global', p_limit: 300, p_seconds: 3600 }); rpcError(global.error);
    const rate = await db.rpc('ats_rate_limit', { p_key: `application:ip:${ipHash}`, p_limit: 20, p_seconds: 3600 }); rpcError(rate.error);
    if (!global.data || !rate.data) throw new ApplicationError('Too many attempts. Please try again later.', 429);
    const bytes = await readBoundedBody(req, MAX_REQUEST_BYTES);
    let form: FormData;
    try { form = await new Response(new Uint8Array(bytes), { headers: { 'Content-Type': req.headers.get('content-type')! } }).formData(); } catch { throw new ApplicationError('Invalid upload.'); }
    if (form.getAll('resume').length !== 1 || form.getAll('payload').length !== 1) throw new ApplicationError('Invalid application upload.');
    const file = form.get('resume'), raw = form.get('payload');
    if (!(file instanceof File) || typeof raw !== 'string' || raw.length > 16000) throw new ApplicationError('A résumé and application are required.');
    let parsed: unknown; try { parsed = JSON.parse(raw); } catch { throw new ApplicationError('Invalid application.'); }
    const payload = validatePayload(parsed);
    const fileBytes = new Uint8Array(await file.arrayBuffer()), resume = validateResume(file.name, file.type, fileBytes);
    const hash = await sha256(JSON.stringify({ payload, file_hash: await sha256(fileBytes), filename: resume.filename }));
    // Retry lookup does not disclose a reference unless the caller proves the complete matching payload + file.
    const prior = await db.from('applications').select('public_reference,submission_hash').eq('submission_id', payload.submission_id).maybeSingle(); rpcError(prior.error);
    if (prior.data) {
      if (prior.data.submission_hash !== hash) throw new ApplicationError('This submission reference has already been used. Refresh the page to start a new application.', 409);
      return json(req, { ok: true, reference: prior.data.public_reference });
    }
    const emailLimit = await db.rpc('ats_rate_limit', { p_key: `application:email:${await sha256(payload.email)}`, p_limit: 5, p_seconds: 3600 }); rpcError(emailLimit.error);
    if (!emailLimit.data) throw new ApplicationError('Too many applications. Please try again later.', 429);
    const job = await db.from('jobs').select('id,accepting_applications').eq('id', payload.job_id).maybeSingle(); rpcError(job.error);
    if (!job.data?.accepting_applications) throw new ApplicationError('This opportunity is no longer accepting applications.', 409);
    path = `${crypto.randomUUID()}/${crypto.randomUUID()}.${resume.extension}`;
    const tracked = await db.from('application_uploads').insert({ path }); rpcError(tracked.error);
    const uploaded = await db.storage.from(RESUME_BUCKET).upload(path, fileBytes, { contentType: resume.contentType, upsert: false }); rpcError(uploaded.error);
    const saved = await db.rpc('ats_submit', { p_payload: payload, p_hash: hash, p_path: path, p_filename: resume.filename }); rpcError(saved.error);
    // A concurrent identical request may have committed a different upload; remove only uncommitted staging files.
    const stage = await db.from('application_uploads').select('committed').eq('path', path).single();
    if (stage.data?.committed === false) { await db.storage.from(RESUME_BUCKET).remove([path]); await db.from('application_uploads').delete().eq('path', path).eq('committed', false); }
    path = null;
    enqueueWorker();
    return json(req, { ok: true, reference: saved.data });
  } catch (error) {
    // Do not delete on an uncertain commit: the cleanup worker checks committed state after a bounded interval.
    if (path) console.warn('application_upload_pending_cleanup');
    return failure(req, error);
  }
});
