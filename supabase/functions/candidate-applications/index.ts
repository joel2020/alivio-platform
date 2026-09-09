import { requireAuth } from '../_shared/auth.ts';
import { ApplicationError, RESUME_BUCKET, UUID, boundedText, readBoundedBody } from '../_shared/application-validation.ts';
import { adminClient, emailReady, failure, followupsReady, json, rpcError, enqueueWorker } from '../_shared/application-runtime.ts';
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return json(req, { ok: true });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed.' }, 405);
  try {
    const user = await requireAuth(req), db = adminClient();
    let body: Record<string, unknown>;
    try { body = JSON.parse(new TextDecoder().decode(await readBoundedBody(req, 40000))); } catch (e) { if (e instanceof ApplicationError) throw e; throw new ApplicationError('Invalid request.'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApplicationError('Invalid request.');
    const allowed = ['list', 'detail', 'update', 'resume', 'map-job', 'message', 'stop-messages', 'record-reply'];
    if (!allowed.includes(String(body.action))) throw new ApplicationError('Invalid action.');
    if (!['list', 'map-job'].includes(String(body.action)) && (!Number.isSafeInteger(body.id) || Number(body.id) < 1)) throw new ApplicationError('Invalid application.');
    if (body.action === 'map-job' && (!Number.isSafeInteger(body.job_id) || Number(body.job_id) < 1 || typeof body.role_id !== 'string' || !UUID.test(body.role_id))) throw new ApplicationError('Invalid job mapping.');
    if (body.action === 'message') {
      if (typeof body.request_id !== 'string' || !UUID.test(body.request_id)) throw new ApplicationError('Invalid message request reference.');
      if (!emailReady()) throw new ApplicationError('Email delivery is not configured.', 503);
      body.subject = boundedText(body.subject, 'subject', 200); body.body = boundedText(body.body, 'message', 20000);
      if (/[\r\n]/.test(String(body.subject))) throw new ApplicationError('Subject must be one line.');
      if (body.scheduled_at != null) {
        const time = Date.parse(String(body.scheduled_at));
        if (!Number.isFinite(time)) throw new ApplicationError('Enter a valid scheduled date.');
      }
    }
    if (body.action === 'update') {
      for (const key of ['note', 'next_action']) if (body[key] != null) body[key] = boundedText(body[key], key, key === 'note' ? 10000 : 1000, false);
      if (body.assigned_to != null && (typeof body.assigned_to !== 'string' || !UUID.test(body.assigned_to))) throw new ApplicationError('Invalid reviewer.');
      if (body.next_action_at != null && !Number.isFinite(Date.parse(String(body.next_action_at)))) throw new ApplicationError('Invalid task date.');
    }
    const result = await db.rpc('ats_recruiter', { p_actor: user.id, p_body: body, p_followups: followupsReady() }); rpcError(result.error);
    if (body.action === 'resume') {
      if (!result.data?.path) throw new ApplicationError('No private résumé is available for this application.', 404);
      const signed = await db.storage.from(RESUME_BUCKET).createSignedUrl(result.data.path, 60, { download: result.data.filename || 'resume' }); rpcError(signed.error);
      return json(req, { data: { url: signed.data?.signedUrl } });
    }
    if (body.action === 'list') return json(req, { data: { ...result.data, email_ready: emailReady(), followups_ready: followupsReady() } });
    if (body.action === 'detail') return json(req, { data: result.data });
    if (body.action === 'message') enqueueWorker();
    return json(req, { ok: true });
  } catch (error) { return failure(req, error); }
});
