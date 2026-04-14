# alivio-platform

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-ycamq1gd)

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
