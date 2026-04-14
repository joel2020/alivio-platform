# ENV-MATRIX

## Frontend runtime (.env)
| Variable | Required | Used by | Notes |
|---|---:|---|---|
| `VITE_SUPABASE_URL` | Yes | frontend Supabase client | Required for all app routes. |
| `VITE_SUPABASE_ANON_KEY` | Yes | frontend Supabase client + edge invoke headers in `src/lib/ai.ts` | Required for auth/session and function invoke. |

## Edge/runtime secrets (Supabase Functions)
| Variable | Required | Used by | Notes |
|---|---:|---|---|
| `SUPABASE_URL` | Yes | auth validation + service client in multiple functions | Required for secure auth checks and service-role operations. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | service client in pipeline/email + auth validation | Must never be exposed in frontend. |
| `OPENROUTER_API_KEY` | Yes for AI fallback / OpenRouter-only | all AI functions | Needed whenever Ollama unavailable. |
| `OPENROUTER_MODEL` | Optional | all AI functions | Defaults exist in code. |
| `OLLAMA_URL` | Optional | all AI functions | If set, tried first before OpenRouter. |
| `OLLAMA_MODEL` | Optional | all AI functions | Defaults exist in code. |
| `OLLAMA_AUTH` | Optional | all AI functions | Basic auth for protected Ollama hosts. |
| `RESEND_API_KEY` | Required for email sending flows | `send-outreach-email`, `email-pipeline`, `ai-parse-email-resume`, `auto-followup` | Required for outreach/inbox notifications. |
| `IMAP_HOST` | Required for inbound email flow | `fetch-emails` | Inbound pipeline only. |
| `IMAP_PORT` | Optional | `fetch-emails` | Defaults to 993. |
| `IMAP_USER` | Required for inbound email flow | `fetch-emails` | Must map to a `users.email` row. |
| `IMAP_PASSWORD` | Required for inbound email flow | `fetch-emails` | IMAP credential. |
| `IMAP_TLS` | Optional | `fetch-emails` | Defaults to `true`. |

## Demo workflow minimum env set
For the chosen demo path (manual candidate flow), minimum required variables are:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY` **or** reachable `OLLAMA_URL`

## Gaps
- `.env.example` currently does **not** include server-side variables (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, IMAP vars), so full deployment is not reproducible from this file alone.
Blunt version: this repo had env sprawl and inconsistent validation. This matrix lists what code actually references.

| Variable | File(s) | Required | Default | What breaks |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts`, `src/vite-env.d.ts`, `.env.example` | Yes (frontend) | None | Frontend auth/data client boot fails. |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts`, `src/lib/ai.ts`, `src/vite-env.d.ts`, `.env.example` | Yes (frontend) | None | Frontend cannot authenticate/query Supabase. |
| `SUPABASE_URL` | Edge functions, `_shared/security.ts`, `health-check` | Yes (edge) | None | Edge auth checks and DB clients fail. |
| `SUPABASE_ANON_KEY` | `_shared/security.ts`, `.env.example` | Yes for edge auth guard | None | Bearer token validation fails (`requireFunctionAuth`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Internal edge functions, `settings-api-key`, `health-check` | Yes for internal jobs | None | Service-only functions fail or reject calls; DB privileged ops fail. |
| `OPENROUTER_API_KEY` | `_shared/ai.ts`, `health-check`, `src/lib/openrouterClient.ts` | Required if Ollama unavailable | None | AI fallback and OpenRouter-only flows fail. |
| `OPENROUTER_MODEL` | `_shared/ai.ts`, `health-check`, `.env.example` | Optional | `meta-llama/llama-3.1-8b-instruct:free` | Wrong model string causes runtime OpenRouter errors. |
| `OPENROUTER_BASE_URL` | `src/lib/openrouterClient.ts`, `.env.example` | Optional | `https://openrouter.ai/api/v1` | Node OpenRouter helper may hit wrong endpoint. |
| `OLLAMA_URL` | `_shared/ai.ts`, `health-check` | Optional | None | No local Ollama primary path (fallback only). |
| `OLLAMA_MODEL` | `_shared/ai.ts`, `.env.example` | Optional | `gemma3:4b` | Bad model name causes Ollama primary failures and fallback to OpenRouter. |
| `OLLAMA_AUTH` | `_shared/ai.ts`, `health-check` | Optional | Empty | Auth-required Ollama endpoint becomes unreachable. |
| `IMAP_HOST` | `fetch-emails`, `health-check`, `.env.example` | Required for inbox ingestion | None | Email ingestion disabled/fails. |
| `IMAP_PORT` | `fetch-emails`, `.env.example` | Optional | `993` | Wrong port causes IMAP connectivity failures. |
| `IMAP_USER` | `fetch-emails`, `health-check`, `.env.example` | Required for inbox ingestion | None | Cannot map org / login IMAP. |
| `IMAP_PASSWORD` | `fetch-emails`, `health-check`, `.env.example` | Required for inbox ingestion | None | IMAP authentication fails. |
| `IMAP_TLS` | `fetch-emails`, `.env.example` | Optional | `true` | Misconfigured TLS can break IMAP connection. |
| `RESEND_API_KEY` | `send-outreach-email`, `auto-followup`, `email-pipeline`, `ai-parse-email-resume`, `.env.example` | Required for outbound email | None | Email sending/notifications fail. |

## Secrets with weak/no upfront validation (still risky)
- `src/lib/openrouterClient.ts` uses non-null assertions on `process.env.OPENROUTER_API_KEY` and no startup validation (**not confirmed safe in production path**).
- Some edge functions validate at runtime only (not boot time), so bad envs fail late instead of fast.
