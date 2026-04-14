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
