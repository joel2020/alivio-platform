# SMOKE-TESTS (30-minute launch verification)

## TEST 1: Happy path — manual candidate workflow
Steps:
1. Login as org user with pipeline access.
2. Open `/roles/:id/pipeline` for a role that has seeded candidates.
3. Open a candidate, advance stage, switch to Outreach tab, generate AI outreach.
Expected result: stage update persists; outreach either returns generated draft or visible friendly error.
If it fails: pipeline/candidate query path (`PipelinePage` / `CandidatePage`) or `generate-outreach` edge function.

## TEST 2: Admin access with admin account
Steps:
1. Login as platform admin user.
2. Navigate to `/admin` and `/admin/users`.
3. Confirm pages load and data appears.
Expected result: admin pages load normally.
If it fails: `AdminRoute` RPC check (`is_platform_admin`) or DB function grants.

## TEST 3: Non-admin blocked from admin
Steps:
1. Login as non-admin user.
2. Navigate directly to `/admin`.
3. Observe redirect.
Expected result: redirected to `/dashboard`.
If it fails: `AdminRoute` guard logic or `is_platform_admin` semantics.

## TEST 4: AI action + graceful failure UX
Steps:
1. Open candidate page outreach tab.
2. Trigger outreach generation.
3. Repeat with invalid AI provider env (or simulated provider outage).
Expected result: success draft when available; otherwise clear inline error message, no crash.
If it fails: `src/pages/app/CandidatePage.tsx` OutreachTab or `generate-outreach`.

## TEST 5: Ollama disabled fallback behavior
Steps:
1. Ensure `OLLAMA_URL` points to unavailable host or stop Ollama.
2. Trigger scoring/outreach.
3. Check response.
Expected result: OpenRouter fallback succeeds (if key configured) or clear error surfaced.
If it fails: AI edge fallback logic (`ai-score-candidates`, `generate-outreach`, `ai-parse-resume`).

## TEST 6: Duplicate inbound email de-duplication
Steps:
1. Send same message-id email twice into monitored inbox.
2. Run `email-pipeline`.
3. Inspect `email_inbox` and candidates.
Expected result: second email counted as duplicate; no duplicate candidate insertion.
If it fails: `fetch-emails` message_id dedupe or candidate upsert logic in `ai-parse-email-resume`.

## TEST 7: Malformed attachment handling
Steps:
1. Send email with unsupported/corrupt attachment.
2. Run `email-pipeline`.
3. Verify app still responsive and processing status updated.
Expected result: no crash; email marked failed/ignored with processing note.
If it fails: `fetch-emails` attachment parsing or `ai-parse-email-resume` error handling.

## TEST 8: Missing required env var
Steps:
1. Unset `OPENROUTER_API_KEY` and ensure Ollama unavailable.
2. Trigger outreach or scoring.
3. Observe UI and function response.
Expected result: explicit error message; no silent success.
If it fails: AI edge error propagation to UI.

## TEST 9: Direct edge function call without auth token
Steps:
1. POST to `ai-score-candidates` or `generate-outreach` without `Authorization` header.
2. Inspect response code/body.
Expected result: HTTP 401 Unauthorized.
If it fails: edge auth enforcement regression.

## TEST 10: Protected route with expired/no session
Steps:
1. Clear session/local auth tokens.
2. Navigate to `/roles/:id/pipeline`.
3. Observe route result.
Expected result: redirected to `/login` with `next` parameter.
If it fails: `AppLayout` auth guard.
