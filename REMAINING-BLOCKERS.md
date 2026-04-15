# REMAINING-BLOCKERS

## OPEN

1. **Platform-admin bootstrap is manual**
   - `users.is_platform_admin` exists and is now authoritative.
   - No automated provisioning flow sets it yet.
   - Manual SQL/admin action required to mark platform admins.

2. **RLS production-state parity not confirmed**
   - Migration history shows repeated policy/function redefinitions.
   - Not confirmed that all deployed environments have identical migration state.

3. **Onboarding/app route guard consistency not fully proven**
   - Router-level explicit auth guards are still partial; some flows depend on layout/page behavior.
   - Not confirmed via automated E2E.

## RESOLVED

1. **Inbound email flow auth** — `fetch-emails`, `email-pipeline`, `ai-process-email`, and `ai-parse-email-resume` all now import and enforce `requireFunctionAuth`. Scheduler calls use `SCHEDULERSECRET`.

2. **`.env.example` incomplete** — Updated with `SCHEDULERSECRET`, `ADMINNOTIFICATIONEMAIL`, `NOTIFICATIONFROMEMAIL`, and all IMAP + scheduler variables.

3. **Health endpoint AI-only** — `health-check` now reports `supabase`, `scheduler`, `resend`, `notifications`, `ollama`, `openrouter`, and `imap` status.

4. **Hardcoded operational emails** — Removed from `email-pipeline`, `ai-parse-email-resume`, `auto-followup`, and `send-outreach-email`. All use env vars.

5. **Scheduler auth wiring** — `requireFunctionAuth` now accepts `SCHEDULERSECRET` in addition to service-role key. pgcron jobs use Vault-backed secret.

6. **OpenRouter client null guard** — `src/lib/openrouterClient.ts` now warns at startup and throws a clear error at call time if `OPENROUTER_API_KEY` is missing.

7. **Admin route frontend email check** — Replaced with server-side `is_platform_admin` RPC.

8. **Demo-path AI edge functions** — Reject unauthenticated requests (401) by validating bearer JWT.

9. **Scheduler/webhook rollout** — Service-only auth gates active. pgcron jobs wired with `SCHEDULERSECRET` via Vault.

10. **Cron jobs created** — `alivio-auto-followup-daily-9am` (9am daily) and `alivio-email-pipeline-30min` (every 30 min) active in production.
