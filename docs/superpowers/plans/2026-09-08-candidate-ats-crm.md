# Candidate ATS/CRM Implementation Plan

> Execute using subagent-driven-development for independent bounded implementation tasks, with root integration and review. User approved the email-first design.

**Goal:** Deliver secure résumé applications, short questionnaires, truthful email confirmations, and an authenticated recruiter application workspace connected to existing roles/candidates and CRM.

**Architecture:** Preserve public jobs/applications and add explicit job-to-role ownership. A new public `submit-application` function accepts validated multipart submissions; a JWT-authenticated `candidate-applications` function serves recruiter actions. A durable outbox and privileged `application-messages` worker perform provider-confirmed sends and bounded retries. Extend existing React routes and components without changing website option previews or adding packages.

**Global constraints:** PDF/DOCX ≤5 MB; private documents; no anonymous application reads; authorized org editor/admin or platform-admin access; no AI hiring decisions; preserve legacy applications and leads; no historical bulk mail; synthetic recipients only during verification. Existing Resend provider; verify environment availability separately without printing values.

## Contract

Public POST `/functions/v1/submit-application`: `FormData` with `resume` File and `payload` JSON string containing `submission_id` UUID, `job_id` number, `first_name`, `last_name`, `email`, optional `phone`,`linkedin_url`, honeypot `website`, `privacy_consent:true`, and `questionnaire:{location,experience,skills,availability,interest}` (nonempty strings). Success `{ok:true,reference:string}`; errors `{error:string}` with suitable HTTP code. Same submission ID/payload retries return same reference and do not send twice. No private database ID is returned.

Authenticated `supabase.functions.invoke('candidate-applications',{body:{action,...}})`:
- `list` → `{data:{applications,jobs,roles,reviewers,is_admin,email_ready,followups_ready}}`.
- `detail,id` → `{data:{application,events,messages}}`.
- `update,id,status?,assigned_to?,next_action?,next_action_at?,note?` → `{ok:true}`.
- `resume,id` → `{data:{url}}` (short-lived authorized download).
- `map-job,job_id,role_id` → `{ok:true}` platform admin only, links existing triage applications deliberately.
- `message,id,request_id:UUID,subject,body,scheduled_at?` → `{ok:true}` persists outbox, no false sent state. Scheduling gated on configured reply detection.
- `stop-messages,id` → `{ok:true}` stops all candidate emails; `record-reply,id` stops automated followups while allowing manual replies.

Application records: `id:number,public_reference:string|null,job_id:number,job_title:string,first_name,last_name,email,phone:string|null,status,created_at,org_id:string|null,role_id:string|null,candidate_id:string|null,assigned_to:string|null,questionnaire:Record<string,string>|null,resume_filename:string|null,next_action:string|null,next_action_at:string|null,messages_stopped:boolean,followups_stopped:boolean`.
Job records `{id:number,title,role_id:string|null}`; roles `{id,title,org_id}`; reviewers `{id,full_name}`. Events `{id,created_at,event_type,detail}`. Messages `{id,created_at,subject,body,status,scheduled_at,sent_at,last_error}`. New application stages `new,reviewing,screening,interview,offer,hired,rejected,withdrawn`; legacy statuses displayed without destructive migration.

## Tasks and ownership

- [x] Backend: own new SQL migration, `submit-application`, `candidate-applications`, `application-messages`, shared application validation/delivery helpers, targeted server tests. Add durable cross-instance rate limits, submission hash/idempotency, transactional application/candidate/outbox persistence, strict auth and tenant checks, safe file validation, explicit role mapping, notes/task events, leased bounded retry processor. Use service-only RPCs with revoked public execute permissions. Provider idempotency window is 24h; uncertain sends older than 23h require intervention. Do not deploy until reviewed.
- [x] Candidate UI: own `CareersJobPage.tsx`, new `ApplicationForm.tsx`, application CSS and dedicated browser tests. Show three steps: contact/résumé, five-question questionnaire, review/consent. Keep input on failure, use stable submission UUID for retries, enforce limits client-side and display server errors, focus errors/confirmation, do not claim email delivery. Replace only the application form, preserving job content and SEO.
- [x] Root: own recruiter `ApplicationsPage.tsx`, routes/sidebar, old outreach false-send correction, integration, docs, and local verification. Release remains a separate pending activation step. Add inbox filters, stage/owner/next action/note editing, résumé download, questionnaire details, event/message history, editable message templates, optional scheduled send with readiness gating, role mapping, stop/reply controls. Keep sender destination derived server-side from application rather than client input.
- [x] Review: isolated read-only security/spec review of backend and final diff. Claude review attempted separately under existing client policy; report any unavailable review honestly.

## Verification

Backend unit tests: valid/invalid PDF and DOCX; missing/oversized input; wrong file signature; consent; required questionnaire; duplicate request/hash behavior; provider non-2xx and uncertainty; retries older than idempotency window; unauthorized and cross-org access. Database verification checks policies/constraints and rolls back synthetic fixtures. Browser tests verify multipart submission, three steps, retries, no false delivery claims, keyboard use and no overflow. Recruiter tests exercise list/detail/update/message with intercepted API and clearly synthetic records. Run typecheck, lint, build, existing marketing and server suites; deploy preview before production. No tests send email to candidates.

## Progress

Design approved by user. Implementation branch: `codex/candidate-ats-crm`. Implementation and scoped security review are complete. Final local regression verification passed: 83 browser tests, 21 server/database tests, typecheck and build; nine deployment-only tests remain pending. Release is held for the user to identify the ATS administrator login; no allowlist account is inferred. Claude review was attempted but the local Claude CLI is not authenticated; an independent Codex reviewer reviewed the implementation and fixes. No production migrations, deployments, or candidate emails have been performed.

- [ ] Activate: identify administrator login, coordinate schema/functions/frontend release, verify provider sender and delivery, and configure verified inbound replies before enabling scheduled follow-ups.
