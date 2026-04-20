# Agent Fix Audit (2026-04-20)

## Scope audited
- Supabase edge functions under `supabase/functions/*`
- Frontend edge function callers under `src/**`
- Agent logging touchpoints using `public.agent_activity_log`

## Key failures found
1. Multiple AI edge functions were still wired to Gemini/OpenRouter/Ollama instead of Azure OpenAI.
2. Several functions did not follow a consistent invalid-body guard (`await req.json().catch(() => null)`).
3. Frontend and automation had a slug mismatch (`ai-generate-outreach` vs `generate-outreach`).
4. Auto-followup used raw `fetch()` to edge functions instead of `supabase.functions.invoke()`.
5. Health check endpoint existed but did not validate Azure + DB + Storage in a single agent-focused payload.
6. Admin system check page lacked a trigger for running the agent health check endpoint.

## Fixes applied
- Added reusable Azure helper with primary/fallback retry logic on 429/503:
  - `supabase/functions/_shared/azure.ts`
- Migrated these AI functions to Azure helper with JSON response format:
  - `ai-generate-job`
  - `ai-completion`
  - `ai-parse-resume`
  - `ai-score-candidates`
  - `ai-match-candidates`
  - `ai-source-candidates`
  - `ai-process-email`
- Standardized `npm:openai` import in Azure edge functions:
  - `score-candidate`, `generate-outreach`
- Updated `auto-followup` to call `generate-outreach` via `supabase.functions.invoke()`.
- Updated CRM client trigger to call correct function slug and surface errors/loading state.
- Replaced `health-check` edge function implementation to test:
  - Azure OpenAI connectivity
  - Supabase DB connectivity
  - Supabase Storage connectivity
  - and return `{ azure, db, storage, timestamp, errors }`
- Added "Run Agent Health Check" action to `/admin/system-check` page.
- Added Supabase secrets command reference in `README.md`.

## Notes
- Live DB log query (`public.agent_activity_log`) was not executed in this environment because project runtime credentials were unavailable in the shell session.
