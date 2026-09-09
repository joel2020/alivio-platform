import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from './cors.ts';
import { ApplicationError } from './application-validation.ts';
export const adminClient = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
export const emailReady = () => Boolean(Deno.env.get('RESEND_API_KEY') && Deno.env.get('NOTIFICATION_FROM_EMAIL'));
export const followupsReady = () => emailReady() && Deno.env.get('APPLICATION_REPLY_DETECTION_ENABLED') === 'true' && Boolean(Deno.env.get('APPLICATION_WEBHOOK_SECRET') && Deno.env.get('APPLICATION_REPLY_DOMAIN'));
export function json(req: Request, value: unknown, status = 200) { return new Response(JSON.stringify(value), { status, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }); }
export function failure(req: Request, error: unknown) {
  if (error instanceof ApplicationError) return json(req, { error: error.message }, error.status);
  if (error instanceof Response) return json(req, { error: 'Authentication required.' }, error.status);
  console.error('application_request_failed');
  return json(req, { error: 'Unable to process the request. Please try again.' }, 500);
}
export function rpcError(error: { code?: string; message?: string } | null) {
  if (!error) return;
  if (error.code === '42501') throw new ApplicationError('You do not have access to this application.', 403);
  const safe: Record<string, [string, number]> = {
    submission_conflict: ['This submission reference has already been used. Refresh the page to start a new application.', 409],
    job_unavailable: ['This opportunity is no longer accepting applications.', 409],
    invalid_schedule: ['Choose a future date within 90 days.', 400],
    message_conflict: ['This message request reference has already been used for different content.', 409],
    messages_stopped: ['Candidate messages have been stopped.', 409],
    followups_unavailable: ['Scheduled follow-ups are unavailable until reply detection is configured.', 409],
    job_already_mapped: ['This job is already linked to a different role.', 409],
    invalid_assignee: ['Choose an active reviewer in this application’s organization.', 400],
  };
  const mapped = safe[error.message || ''];
  if (mapped) throw new ApplicationError(...mapped);
  if (error.code === '22P02' || error.code === '22007' || error.message?.startsWith('invalid_')) throw new ApplicationError('Invalid request.');
  throw new Error('database_operation_failed');
}
export async function wakeWorker() {
  const secret = Deno.env.get('SCHEDULER_SECRET');
  if (!secret) return;
  try { await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/application-messages`, { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(2500) }); } catch { /* Scheduled worker retries durable queued messages. */ }
}

export function enqueueWorker() {
  const runtime = (globalThis as unknown as { EdgeRuntime?: { waitUntil(promise: Promise<unknown>): void } }).EdgeRuntime;
  const work = wakeWorker();
  if (runtime) runtime.waitUntil(work);
}
