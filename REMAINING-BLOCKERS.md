# REMAINING-BLOCKERS

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
