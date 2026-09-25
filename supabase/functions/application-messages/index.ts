import { processInterviewAssessments, cleanInterviewRecordings } from '../_shared/interview-worker.ts';
import { ApplicationError, RESUME_BUCKET, readBoundedBody } from '../_shared/application-validation.ts';
import { retryDecision, sendApplicationEmail, verifyWebhook } from '../_shared/application-delivery.ts';
import { adminClient, emailReady, failure, followupsReady, json, rpcError } from '../_shared/application-runtime.ts';
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed.' }, 405);
  try {
    const db = adminClient();
    if (new URL(req.url).searchParams.get('webhook') === '1') {
      const secret = Deno.env.get('APPLICATION_WEBHOOK_SECRET');
      const body = new TextDecoder().decode(await readBoundedBody(req, 100000));
      if (!secret || !await verifyWebhook(body, req.headers, secret)) throw new ApplicationError('Invalid webhook signature.', 401);
      let event: Record<string, unknown>;
      try { event = JSON.parse(body); } catch { throw new ApplicationError('Invalid webhook.'); }
      const recorded = await db.rpc('ats_webhook', { p_event_id: req.headers.get('svix-id'), p_event: event, p_reply_domain: Deno.env.get('APPLICATION_REPLY_DOMAIN') || '' }); rpcError(recorded.error);
      return json(req, { ok: true });
    }
    // This endpoint never accepts an ordinary user JWT, even if the user is an org owner.
    const authorization = req.headers.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
    const configured = Deno.env.get('SCHEDULER_SECRET');
    let authorized = !!token && ((!!configured && token === configured) || token === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    if (!authorized && token.length >= 16) { const verified = await db.rpc('verify_scheduler_secret', { candidate: token }); authorized = !verified.error && verified.data === true; }
    if (!authorized) throw new ApplicationError('Privileged scheduler token required.', 403);
    // Clean only staging objects proven uncommitted, after enough time for interrupted transactions to finish.
    const stale = await db.from('application_uploads').select('path').eq('committed', false).lt('created_at', new Date(Date.now() - 24 * 3600000).toISOString()).limit(100); rpcError(stale.error);
    for (const upload of stale.data || []) {
      const used = await db.from('applications').select('id').eq('resume_path', upload.path).limit(1); rpcError(used.error);
      if (used.data?.length) continue;
      const removed = await db.storage.from(RESUME_BUCKET).remove([upload.path]);
      if (!removed.error) await db.from('application_uploads').delete().eq('path', upload.path).eq('committed', false);
    }
    if (!emailReady()) {
      await cleanInterviewRecordings().catch(() => console.error('interview_recording_cleanup_failed'));
      return json(req, { ok: true, processed: 0, email_ready: false });
    }
    const claimed = await db.rpc('ats_claim_messages', { p_followups: followupsReady() }); rpcError(claimed.error);
    let processed = 0;
    for (const message of claimed.data || []) {
      const prepared = await db.rpc('ats_prepare_message', { p_id: message.id, p_lease: message.lease_token, p_from: Deno.env.get('NOTIFICATION_FROM_EMAIL'), p_internal: Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || '', p_reply_domain: Deno.env.get('APPLICATION_REPLY_DOMAIN') || '', p_followups: followupsReady() });
      if (!prepared.error && !prepared.data) continue;
      const result = prepared.error
        ? { accepted: false, providerId: null, retryable: false, error: 'message_configuration_failed' }
        : await sendApplicationEmail(prepared.data, `ats/${message.id}`, Deno.env.get('RESEND_API_KEY')!);
      const decision = retryDecision(message.attempts, message.first_attempt_at);
      const finished = await db.rpc('ats_finish_message', { p_id: message.id, p_lease: message.lease_token, p_provider_id: result.providerId, p_error: result.error, p_retry_seconds: result.retryable && decision.retry ? decision.delaySeconds : null });
      rpcError(finished.error); processed++;
    }
    await cleanInterviewRecordings().catch(() => console.error('interview_recording_cleanup_failed'));
    const assessments = processInterviewAssessments().catch(() => console.error('application_assessment_worker_failed'));
    const runtime = (globalThis as unknown as { EdgeRuntime?: { waitUntil(work: Promise<unknown>): void } }).EdgeRuntime;
    if (runtime) runtime.waitUntil(assessments); else await assessments;
    return json(req, { ok: true, processed });
  } catch (error) { return failure(req, error); }
});
