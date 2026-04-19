# FINAL-BLOCKERS (Must resolve before launch)

## Status (2026-04-19)

**No code-level launch blockers currently open in-repo.**

This file previously tracked four blockers. They are now resolved in code/config/docs:

1. **Edge-function auth model**
   - Resolved by standardized `requireFunctionAuth` usage across edge-function entrypoints, including scheduler-protected functions.

2. **Operational env contract**
   - Resolved by expanded `.env.example` coverage for frontend, edge functions, scheduler, email, AI, and backend runtime variables.

3. **Health endpoint coverage**
   - Resolved by expanded `health-check` dependency reporting (Supabase, scheduler, resend, notifications, AI providers, IMAP).

4. **Inbound email hardening verification path**
   - Resolved in-repo for auth and guardrails; final staging validation remains an operational go-live checklist item, not a code blocker.

## Remaining non-code go-live tasks (operations)

- Run staging smoke tests with real credentials and malformed/duplicate fixtures.
- Confirm production scheduler secrets and cron invocations in hosted environment.
- Confirm admin bootstrap process for initial platform-admin assignment in production.
