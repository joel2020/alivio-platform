# Candidate ATS/CRM release notes

Implementation branch: `codex/candidate-ats-crm`. This phase implements and verifies the system; production activation awaits the designated ATS administrator login. The public website design is unchanged.

## Included

- Three-step public application: contact details and private PDF/DOCX resume (5 MB maximum), five short screening questions, review and consent.
- Durable application reference, immutable submission retries, and transactional acknowledgment/internal-notification outbox.
- Authenticated `/applications` inbox connected to existing roles, candidate profiles, and client CRM. Includes filtering, recruiter assignment, stages, notes, next actions, resume downloads, editable email templates, and communication history.
- Organization and role authorization, upload validation and rate limits, leased email delivery with bounded retries, and signed provider events.
- Legacy outreach creation now saves drafts instead of incorrectly recording unsent emails as sent.

## Release order

1. Obtain the user's chosen administrator login and resolve its current auth UUID. Do not infer access from an organization admin role or grant every Alivio account global access.
2. Review the branch preview and run the deployment-only article regression tests against it.
3. Coordinate the frontend release with migration `20260909031210_candidate_ats_email_workflow.sql`. The migration intentionally removes the legacy anonymous direct-table submission path, so do not apply it early while the old form remains live.
4. Deploy the three functions using their custom authentication as documented in `supabase/functions/application-messages/README.md`; apply the migration, grant the chosen administrator, then activate the new frontend. Verify the live public application boundary and private inbox.
5. Verify the existing Resend sender with a synthetic provider test recipient before enabling live delivery. Install the documented worker cron using the existing Vault scheduler secret. Do not test by contacting real candidates.
6. Connect public jobs to internal recruiting roles in the administrator inbox. Unmapped applications remain administrator triage.
7. Configure and verify receiving-domain routing and signed reply webhooks before enabling scheduled follow-ups. Acknowledgments and explicitly reviewed recruiter messages work independently of unattended follow-ups.

## Known activation requirements

Administrator login is pending user selection. Required existing email secret names and the scheduler Vault entry were verified present; this is not evidence of successful provider delivery. No production ATS migration, function deployment, candidate submission, or email was performed during implementation. Receiving-domain/webhook setup is pending, so scheduled follow-ups remain disabled.

Claude review could not run because the local CLI is not logged in. Independent Codex review found and rechecked tenant-access, safe retry, reply handling, and draft-preservation fixes; no remaining actionable findings in the scoped final review.

## Verification evidence

- `npm run typecheck`: passed.
- `npm run lint`: zero errors; one existing React-refresh warning in `SeoRecoveryPage.tsx`.
- `npm run build`: passed; 13 public pages and 404 prerendered. Local build uses a synthetic test key and must not be uploaded as a production build.
- Built-preview Playwright suite: 83 passed, 9 deployment-only checks skipped. The initial development-server run could not satisfy prerendered-HTML checks; the complete built-preview rerun passed.
- ATS helper tests: 6 passed. PostgreSQL/PGlite migration, RLS and lifecycle integration: 1 passed. Existing article server tests: 14 passed.
- All three Edge Function Deno checks and focused backend lint passed. Independent reviewer cleared the final targeted fixes.
- `.github/workflows/ci.yml` now runs ATS helpers and the real migration/policy tests with an isolated pinned PGlite runtime.

No end-to-end production delivery claim is made. Deployment-only routing, live provider acceptance, and incoming-reply delivery must be verified during activation.
