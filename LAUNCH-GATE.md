# LAUNCH-GATE

## SECURITY
[x] All edge functions enforce auth?
- **NO** (unchecked): several ingestion/scheduler functions still rely on trusted service-role invocation and do not validate user JWT.
- Manual action: decide and implement explicit invoker-auth strategy for non-user-triggered functions.
- Owner: backend/devops.

[x] Admin access is server-enforced?
- **YES** for route gating: `AdminRoute` now relies on DB RPC `is_platform_admin`.

[x] RLS covers all user-data tables?
- **PARTIAL/LIKELY YES** by migrations, but not fully runtime-proven in this pass.
- Manual action: run admin/non-admin policy smoke tests in deployed DB.
- Owner: backend.

[x] No secrets exposed to frontend?
- **YES** in code reviewed; service-role keys are read only in edge runtime.

[x] No hardcoded emails/passwords in code?
- **NO**: code still contains hardcoded recipient/admin email strings in some function flows.
- Manual action: move remaining static operational emails to env/config.
- Owner: backend/product.

## RELIABILITY
[x] AI calls have timeout + fallback + error handling?
- **YES/PARTIAL**: demo-path AI functions include timeout + fallback + thrown errors; runtime still provider-dependent.

[x] Ingestion has dedupe + size limits + error handling?
- **PARTIAL**: dedupe + basic error handling present; attachment size-limit enforcement not explicit in current `fetch-emails` implementation.
- Manual action: add explicit max-bytes guard before storing attachment base64.
- Owner: backend.

[x] Health endpoint exists and reports real status?
- **PARTIAL**: `ai-status` reports AI provider health only.
- Manual action: extend to DB/email/scheduler checks or add separate system health endpoint.
- Owner: backend/devops.

[x] Demo workflow works end-to-end?
- **YES/PARTIAL**: code path complete and guarded; AI/env dependencies remain operational prerequisites.

## OPERATIONS
[x] ENV-MATRIX.md is complete?
- **YES** for known repo variables.

[x] .env.example covers all required vars?
- **NO**: missing backend/scheduler/env vars.
- Manual action: expand `.env.example` with server/runtime variables and comments.
- Owner: devops/backend.

[x] Deployment can be reproduced from repo?
- **NO**: missing complete env template and scheduler deployment contract.
- Manual action: add deployment runbook + scheduler token requirements.
- Owner: devops.

[x] Scheduler/webhooks send proper auth tokens?
- **NOT CONFIRMED** from repo-only inspection.
- Manual action: verify scheduler config in hosted environment.
- Owner: devops.

## FRONTEND
[x] Demo path has loading/empty/error states?
- **YES** (pipeline/candidate/admin guard audited and patched).

[x] No dead routes in demo path?
- **YES** in reviewed path.

[x] Auth redirect works on session expiry?
- **YES** via app-shell guard redirect to `/login`.

[x] Non-admin gets blocked from admin views?
- **YES** via RPC-backed admin route guard.
