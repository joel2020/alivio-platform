# ENV-MATRIX

Blunt version: this repo had env sprawl and inconsistent validation. This matrix lists what the code currently references.

| Variable | File(s) | Required | Default | What breaks |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts`, `src/vite-env.d.ts`, `.env.example` | Yes (frontend) | None | Frontend auth/data client boot fails. |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts`, `src/lib/ai.ts`, `src/vite-env.d.ts`, `.env.example` | Yes (frontend) | None | Frontend cannot authenticate/query Supabase. |
| `SUPABASE_URL` | Edge functions, `_shared/security.ts`, `health-check` | Yes (edge) | None | Edge auth checks and DB clients fail. |
| `SUPABASE_ANON_KEY` | `_shared/security.ts`, `.env.example` | Yes for edge auth guard | None | Bearer token validation fails in `requireFunctionAuth`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Internal edge functions, `settings-api-key`, `health-check` | Yes for internal jobs | None | Privileged DB operations and internal function chaining fail. |
| `SCHEDULER_SECRET` | `_shared/security.ts`, `health-check`, `.env.example` | Yes for scheduler-triggered functions | None | `pg_cron` or external scheduler calls to privileged functions fail auth. |
| `OPENROUTER_API_KEY` | `_shared/ai.ts`, `health-check`, `src/lib/openrouterClient.ts` | Required if Ollama unavailable | None | AI fallback and OpenRouter-only flows fail. |
| `OPENROUTER_MODEL` | `_shared/ai.ts`, `health-check`, `.env.example` | Optional | `meta-llama/llama-3.1-8b-instruct:free` | Wrong model string causes OpenRouter runtime errors. |
| `OPENROUTER_BASE_URL` | `src/lib/openrouterClient.ts`, `.env.example` | Optional | `https://openrouter.ai/api/v1` | Node OpenRouter helper may hit the wrong endpoint. |
| `OLLAMA_URL` | `_shared/ai.ts`, `health-check` | Optional | None | No local Ollama primary path. |
| `OLLAMA_MODEL` | `_shared/ai.ts`, `.env.example` | Optional | `gemma3:4b` | Bad model name causes Ollama primary failures and fallback to OpenRouter. |
| `OLLAMA_AUTH` | `_shared/ai.ts`, `health-check` | Optional | Empty | Auth-protected Ollama endpoints become unreachable. |
| `IMAP_HOST` | `fetch-emails`, `health-check`, `.env.example` | Required for inbox ingestion | None | Email ingestion fails. |
| `IMAP_PORT` | `fetch-emails`, `.env.example` | Optional | `993` | Wrong port causes IMAP connectivity failures. |
| `IMAP_USER` | `fetch-emails`, `health-check`, `.env.example` | Required for inbox ingestion | None | Inbox login fails and org mapping cannot resolve. |
| `IMAP_PASSWORD` | `fetch-emails`, `health-check`, `.env.example` | Required for inbox ingestion | None | IMAP authentication fails. |
| `IMAP_TLS` | `fetch-emails`, `.env.example` | Optional | `true` | Misconfigured TLS can break IMAP connection. |
| `RESEND_API_KEY` | `send-outreach-email`, `auto-followup`, `email-pipeline`, `ai-parse-email-resume`, `health-check`, `.env.example` | Required for outbound email | None | Outbound email and notification flows fail. |
| `ADMIN_NOTIFICATION_EMAIL` | `email-pipeline`, `ai-parse-email-resume`, `health-check`, `.env.example` | Required for ops notifications | None | Client-inquiry and new-candidate notifications cannot be delivered. |
| `NOTIFICATION_FROM_EMAIL` | `send-outreach-email`, `auto-followup`, `email-pipeline`, `ai-parse-email-resume`, `health-check`, `.env.example` | Required for default sender identity | None | Outbound email and notifications fail or have no default sender. |

## Scheduler notes
- Supabase edge-function secrets and Postgres `app.settings.*` values are different systems.
- The cron SQL uses `app.settings.scheduler_secret` for the `Authorization` header when invoking scheduler-protected functions.
- Set `app.settings.scheduler_secret` in Postgres to the same value as the Supabase edge-function secret `SCHEDULER_SECRET`.

## Demo workflow minimum env set
For the chosen demo path (manual candidate flow), minimum required variables are:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY` or reachable `OLLAMA_URL`
