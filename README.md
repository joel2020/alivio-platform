# alivio-platform

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-ycamq1gd)

[![CI](https://github.com/aliviosearchpartners/alivio-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/aliviosearchpartners/alivio-platform/actions/workflows/ci.yml)

## Table of contents

- [Repository structure](#repository-structure)
- [What to deploy (first Vercel production release)](#what-to-deploy-first-vercel-production-release)
- [Local setup](#local-setup)
- [Checks](#checks)
- [Email Agent (IMAP + AI) setup](#email-agent-imap--ai-setup)
- [Alivio Multi-Agent Backend](#alivio-multi-agent-backend)
- [Alivio recruiter dashboard (vanilla HTML)](#alivio-recruiter-dashboard-vanilla-html)
- [Custom Domain Setup (Production)](CUSTOM-DOMAIN-SETUP.md)

## Repository structure

- `backend/alivio-backend/` — **canonical production backend** (Vertex AI Search + OpenAI-compatible LLM, Vercel-ready).
- `backend/` — future TypeScript multi-agent layer (mock/live agent orchestration, not the canonical production deployment target yet).
- `frontend/` — recruiter dashboard UI assets.
- `shared/` — shared prompt library and fixtures.
- `docs/` — architecture/workflow/integration/deployment docs.

See also: `ARCHITECTURE.md`.

## What to deploy (first Vercel production release)

Deploy **`backend/alivio-backend/`** to Vercel.

- Use `backend/alivio-backend/vercel.json`.
- Configure runtime env vars in Vercel (not in git), especially:
  - `GOOGLE_APPLICATION_CREDENTIALS_JSON`
  - `LLM_API_KEY`
  - `LLM_MODEL`
  - `CORS_ORIGIN` (if frontend is on a different domain)

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local env file:
   ```bash
   cp .env.example .env
   ```
3. Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Start development:
   ```bash
   npm run dev
   ```

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Email Agent (IMAP + AI) setup

Set these Supabase project secrets before deploying the new email functions:

```bash
supabase secrets set \
  IMAP_HOST=your_imap_host \
  IMAP_PORT=993 \
  IMAP_USER=your_imap_user \
  IMAP_PASSWORD=your_email_password \
  IMAP_TLS=true \
  OPENROUTER_API_KEY=your_openrouter_api_key \
  RESEND_API_KEY=your_resend_api_key \
  SCHEDULER_SECRET=your_scheduler_secret \
  ADMIN_NOTIFICATION_EMAIL=ops@yourdomain.com \
  NOTIFICATION_FROM_EMAIL="Alivio Search Partners <noreply@yourdomain.com>"
```

Deploy functions:

```bash
supabase functions deploy fetch-emails
supabase functions deploy ai-process-email
supabase functions deploy ai-parse-email-resume
supabase functions deploy email-pipeline
```

The migration `20260414113000_add_email_agent_pipeline.sql` schedules `email-pipeline` every 30 minutes (`*/30 * * * *`) via `pg_cron`.
Cron-authenticated jobs now use `SCHEDULER_SECRET`, not the service-role key.
Because `pg_cron` reads Postgres settings rather than Supabase edge-function secrets, set the database setting `app.settings.scheduler_secret` to the same value as the Supabase function secret `SCHEDULER_SECRET`.



## Recruiter prompt/query library

Reusable recruiter prompt fixtures live in `shared/prompt-library/` for backend examples, frontend demos, and automation playbooks.

- Canonical fixtures: `shared/prompt-library/recruiter-prompts.fixtures.json`
- Workflow chains: `shared/prompt-library/recruiter-workflow-examples.json`
- Usage/taxonomy: `shared/prompt-library/README.md`, `shared/prompt-library/prompt-taxonomy.md`

Use fixture `id` + placeholder hydration to keep prompts practical, recruiter-friendly, and consistent across implementations.

## Alivio Multi-Agent Backend
See `backend/README.md` for the TypeScript multi-agent backend and API routes (future layer, not the first Vercel production deploy target).

## Alivio recruiter dashboard (vanilla HTML)

A lightweight static dashboard is available at `frontend/alivio-dashboard.html` and uses `frontend/alivio-api-client.js` for backend API calls.

### Serve locally

From the repo root, run any static server (examples):

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then open:

- `http://localhost:8080/frontend/alivio-dashboard.html`

### Point to backend

By default, the page calls `https://api.aliviosearchpartners.com`.

To target a different backend, define `window.ALIVIO_API_BASE` before loading the page script (for example in an inline script tag above the API client include), then reload the page.

## Supabase Edge Function secrets (agents)

> These are **Supabase project secrets** for edge functions. They are separate from Vercel env vars.

```bash
supabase secrets set AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/" \
  AZURE_OPENAI_API_KEY="your-key" \
  AZURE_OPENAI_API_VERSION="2024-02-01" \
  AZURE_OPENAI_PRIMARY_DEPLOYMENT="gpt-4o" \
  AZURE_OPENAI_FALLBACK_DEPLOYMENT="gpt-4o-mini" \
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  SUPABASE_URL="https://your-project-ref.supabase.co" \
  SUPABASE_ANON_KEY="your-anon-key" \
  LLM_API_KEY="your-llm-key" \
  LLM_MODEL="your-model" \
  RESEND_API_KEY="your-resend-key"
```
