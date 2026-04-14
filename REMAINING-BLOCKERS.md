# REMAINING-BLOCKERS

## OPEN
1. **Inbound email flow still assumes trusted invoker on several edge functions.**
   - Functions like `fetch-emails`, `email-pipeline`, `ai-process-email`, and `ai-parse-email-resume` do not currently enforce end-user JWT auth and rely on service-role scheduler context.
2. **`.env.example` incomplete for production reproducibility.**
   - Missing server/runtime variables required for email + scheduler flows.
3. **Health endpoint exists as AI-provider status only.**
   - Current `ai-status` endpoint reports AI provider health; does not represent full platform dependencies (DB, email pipeline, queue/scheduler).

## MITIGATED THIS PASS
1. Admin route frontend email check replaced with server-side `is_platform_admin` RPC.
2. Demo-path AI edge functions now reject unauthenticated requests (401) by validating bearer JWT.
3. Demo-path UI pages now include explicit error/unauthorized states to prevent blank/infinite-loading behavior.
Blunt status after pass two.

1. **Platform-admin bootstrap is manual**
   - `users.is_platform_admin` exists and is now authoritative.
   - No automated provisioning flow sets it yet.
   - Manual SQL/admin action required to mark platform admins.

2. **Scheduler/webhook rollout coordination still required**
   - Service-only auth gates are active on internal pipeline functions.
   - Any scheduler/invoker not sending service-role bearer token will fail.

3. **RLS production-state parity not confirmed**
   - Migration history shows repeated policy/function redefinitions.
   - Not confirmed that all deployed environments have identical migration state.

4. **Non-edge OpenRouter client validation is weak**
   - `src/lib/openrouterClient.ts` still uses non-null env assertions and no startup guard.
   - If used in runtime path, failures may be late and noisy.

5. **Onboarding/app route guard consistency not fully proven**
   - Router-level explicit auth guards are still partial; some flows depend on layout/page behavior.
   - Not confirmed via automated E2E in this pass.
