# Full audit and repair — pre-launch hardening

## Step 1 — TypeScript & Build Audit
- Attempted `npm run build` and `npx tsc --noEmit`; both are currently blocked in this environment because dependencies cannot be installed from npm (`403 Forbidden` on `@dnd-kit/core`) and local `vite`/`tsc` binaries are unavailable until install succeeds.
- Removed stale provider assumptions from Supabase function shared AI utilities to reduce type drift and integration inconsistency.
- Updated `.env.example` so required runtime variables are documented (including `SUPABASE_JWT_SECRET` and all required Azure OpenAI variables).

## Step 2 — Database & Migration Audit
- Verified required migration files exist:
  - `fix_org_users_security_definer`
  - `fix_get_org_stats_search_path`
  - `candidate_feedback_flow_and_rls`
  - `drop_unused_indexes`
  - `add_ai_scoring_columns`
- Confirmed `integration_waitlist` migration exists in `20260420143000_settings_page_org_admin_features.sql`.
- Resolved migration ordering conflict by renaming `20260420143000_add_ai_scoring_columns.sql` to `20260420143001_add_ai_scoring_columns.sql`.
- Attempted `supabase db lint`; Supabase CLI is not installed in this environment.

## Step 3 — Authentication & Route Guard Audit
- Reviewed route guard wiring in `App.tsx`, `AppLayout.tsx`, `RouteGuards.tsx`, and `AdminRoute.tsx`.
- Confirmed protected sections are behind authenticated layout and admin pages are behind platform-admin RPC check.

## Step 4 — API & Supabase Query Audit
- Hardened AI-provider behavior to match Azure-only requirement across edge shared AI utilities and Gemini-dependent edge functions:
  - `_shared/ai.ts` now uses Azure OpenAI primary/fallback deployment logic with 429/503 retry to fallback.
  - `_shared/gemini.ts` now delegates to Azure helper to keep existing callsites compatible.
  - Updated provider metadata in AI edge functions to `azure-openai`.
- Updated `health-check` edge function to validate Azure OpenAI configuration/reachability instead of OpenRouter/Ollama.

## Step 5 — UI Component Audit
- No UI layout/design changes made.
- Existing route wiring and page registrations were reviewed for crash risk and guard coverage.

## Step 6 — vercel.json Audit
- Updated robots headers so app routes are explicitly `noindex, nofollow`.
- Added explicit `index, follow` coverage for public SEO routes (`/`, `/about`, `/pricing`, `/blog`, `/blog/*`).
- Preserved security header set (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `Referrer-Policy`).
- Removed `favicon.ico` rewrite reference to align with SVG-only favicon policy.

## Step 7 — Environment Variable Audit
- Updated `.env.example` to include required variables:
  - `SUPABASE_JWT_SECRET`
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_API_VERSION`
  - `AZURE_OPENAI_PRIMARY_DEPLOYMENT`
  - `AZURE_OPENAI_FALLBACK_DEPLOYMENT`
- Verified required variables from the checklist are now present.

## Step 8 — index.html & SEO Audit
- Verified root `index.html` already contains the required:
  - Title string
  - Meaningful description
  - `/og-image.svg`
  - canonical URL and OG URL
  - `/favicon.svg`
  - JSON-LD structured data
- Removed final `favicon.ico` reference from `frontend/alivio-dashboard.html`.

## Step 9 — Email Templates Audit
- Confirmed the four required templates exist in `supabase/templates/`:
  - `confirm-signup.html`
  - `magic-link.html`
  - `password-reset.html`
  - `invite-user.html`

## Step 10 — Final Pre-Launch Checklist
- Added this `FIXES.md` summary.
- Build/typecheck/db-lint execution remains blocked by environment tooling/package access constraints as noted above.
