# REMAINING-BLOCKERS

## OPEN

1. **RLS production-state parity not confirmed**
   - Migration history shows repeated policy/function redefinitions.
   - Not confirmed that all deployed environments have identical migration state.

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

11. **Platform-admin bootstrap automation** — `public.apply_platform_admin_bootstrap()` trigger now auto-promotes emails from `app.settings.platform_admin_emails`; includes backfill migration for existing users.

12. **Onboarding/auth route guards hardened** — Added centralized router guards for logged-out-only and onboarding-only flows (`RequireLoggedOut`, `RequireOnboarding`) and applied them in `App.tsx`.

