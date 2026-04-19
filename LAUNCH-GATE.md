# LAUNCH-GATE

Status date: **2026-04-19**

## SECURITY
[x] All edge functions enforce auth?
- **YES**: edge entrypoints use user JWT validation or privileged bearer checks via shared auth helpers.

[x] Admin access is server-enforced?
- **YES**: admin routing relies on DB-backed admin checks (`is_platform_admin`).

[x] RLS covers all user-data tables?
- **YES (migration-defined)**: policies are present in migrations; validate parity during release rollout.

[x] No secrets exposed to frontend?
- **YES**: service-role and provider secrets are consumed in edge/backend runtime only.

[x] No hardcoded operational emails/passwords in code?
- **YES**: notification addresses are env-driven.

## RELIABILITY
[x] AI calls have timeout + fallback + error handling?
- **YES**: provider checks and fallback strategy are implemented across AI flows.

[x] Ingestion has dedupe + size/error handling?
- **YES/PARTIAL**: dedupe + error handling are present; keep attachment size caps monitored in staging.

[x] Health endpoint exists and reports real status?
- **YES**: dependency status spans Supabase, scheduler, resend, notifications, ollama/openrouter, and IMAP.

[x] Demo workflow works end-to-end?
- **YES** with valid env + service credentials.

## OPERATIONS
[x] ENV-MATRIX.md is complete?
- **YES** for code-referenced variables.

[x] .env.example covers all required vars?
- **YES**: includes frontend, scheduler, AI, email, Vertex, and backend runtime variables.

[x] Deployment can be reproduced from repo?
- **YES (code/docs level)**: deployment target + env contract are documented; hosted secrets still required.

[x] Scheduler/webhooks send proper auth tokens?
- **YES (contracted)**: scheduler uses `SCHEDULER_SECRET` and edge guards accept scheduler/service tokens.

## FRONTEND
[x] Demo path has loading/empty/error states?
- **YES** in audited views.

[x] No dead routes in demo path?
- **YES**: onboarding redirect now points to `/onboarding/org`.

[x] Auth redirect works on session expiry?
- **YES**.

[x] Non-admin gets blocked from admin views?
- **YES**.


## AUTOMATED REPO GATE
[x] Static launch check passes?
- **YES**: `npm run launch:check` validates env coverage, edge auth guard presence, and onboarding route safety.
