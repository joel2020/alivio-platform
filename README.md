# alivio-platform

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-ycamq1gd)

[![CI](https://github.com/aliviosearchpartners/alivio-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/aliviosearchpartners/alivio-platform/actions/workflows/ci.yml)

## Table of contents

- [Local setup](#local-setup)
- [Checks](#checks)
- [Email Agent (IMAP + AI) setup](#email-agent-imap--ai-setup)
- [Alivio Multi-Agent Backend](#alivio-multi-agent-backend)
- [Alivio recruiter dashboard (vanilla HTML)](#alivio-recruiter-dashboard-vanilla-html)
- [Custom Domain Setup (Production)](CUSTOM-DOMAIN-SETUP.md)

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
  IMAP_USER=joel@aliviosearchpartners.com \
  IMAP_PASSWORD=your_email_password \
  IMAP_TLS=true \
  OPENROUTER_API_KEY=your_openrouter_api_key \
  RESEND_API_KEY=your_resend_api_key
```

Deploy functions:

```bash
supabase functions deploy fetch-emails
supabase functions deploy ai-process-email
supabase functions deploy ai-parse-email-resume
supabase functions deploy email-pipeline
```

The migration `20260414113000_add_email_agent_pipeline.sql` schedules `email-pipeline` every 30 minutes (`*/30 * * * *`) via `pg_cron`.


## Alivio Multi-Agent Backend
See `backend/README.md` for the new production-style agent backend and API routes.

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
