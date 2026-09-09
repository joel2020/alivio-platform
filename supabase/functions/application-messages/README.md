# ATS email worker operations

Deploy `submit-application`, `candidate-applications`, and `application-messages` with gateway JWT verification disabled. Each authenticated handler verifies its own user or scheduler token; the public upload and signed webhook do not use a JWT. Do not disable the handler authentication.

Existing required secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`, `SCHEDULER_SECRET`. Verify the Resend sender domain before activating email. Missing sender/API key leaves durable messages queued; provider rejection records failure without losing the application. Internal notifications intentionally include only the job title and application reference, with review link https://aliviosearchpartners.com/applications .

Root administrator must explicitly insert the verified authorized auth user UUID in `application_platform_admins` using a service connection. The allowlist has no anonymous/authenticated privileges. Org owners/admins/editors can edit applications only in their organization. Viewers cannot read or edit applications or résumés. Jobs are unowned until an explicit platform-admin mapping; all unmapped/legacy applications remain admin triage. `jobs.accepting_applications=false` closes public intake. Mapping an inactive role also closes intake.

Install this cron only after deploying the worker and verifying `vault.decrypted_secrets` contains the existing `schedulersecret`. It invokes the privileged worker every minute. The worker also cleans abandoned staged uploads older than 24 hours. Never insert a raw secret into the cron text.

```sql
select cron.schedule('ats-application-messages', '* * * * *', $cron$
  select net.http_post(
    url := 'https://ovxttubotjebnaoedllu.supabase.co/functions/v1/application-messages',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' ||
      (select decrypted_secret from vault.decrypted_secrets where name='schedulersecret' limit 1)),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
$cron$);
```

Scheduled follow-ups are disabled by default. To enable after testing receiving delivery end to end:

1. Configure a Resend receiving domain and wildcard recipient routing. Set `APPLICATION_REPLY_DOMAIN` to that bare domain.
2. Register a signed Resend webhook at `/functions/v1/application-messages?webhook=1` for `email.received`, `email.delivered`, `email.bounced`, `email.complained`, `email.failed`, and `email.suppressed`; set its signing secret in `APPLICATION_WEBHOOK_SECRET`.
3. Verify a synthetic inbound reply to the `applications+<secret-token>@<domain>` reply address stops queued follow-ups. Then set `APPLICATION_REPLY_DETECTION_ENABLED=true`.

Only signed provider events update delivery. Inbound metadata is sufficient to suppress follow-ups; message bodies and attachments are not retrieved or logged. Recruiters can also record a reply or stop messages manually. Replies suppress scheduled follow-ups while allowing deliberate manual recruiter responses; explicit stop blocks all future recruiter emails. Hired, rejected, and withdrawn stages cancel scheduled follow-ups; explicit status emails remain available until messages are stopped. Provider payload and idempotency key remain immutable across retries. All uncertain sends stop retrying after 23 hours (Resend's idempotency window is 24h); exhausted/terminal failures require recruiter review. No historic application gets an acknowledgment from this migration.

Evidence: https://resend.com/docs/webhooks/emails/received and https://resend.com/docs/dashboard/emails/idempotency-keys .
