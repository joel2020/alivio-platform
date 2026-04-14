# RLS-AUDIT

Scope audited for demo workflow tables:
- `roles`
- `candidates`
- `voice_calls`
- `voice_transcripts`
- `candidate_feedback`
- `agent_activity_log`

## Findings
1. Core app tables are configured with RLS in foundational schema migrations (roles/candidates/voice calls/transcripts/feedback).
2. Admin visibility is expanded via `is_platform_admin()` policies in admin security migration.
3. `agent_activity_log` RLS is explicitly enabled in dashboard hardening migration.

## Demo workflow assessment
- Reads/writes in manual candidate workflow are expected to be protected by org-scoped policies.
- Admin route now uses server-side RPC (`is_platform_admin`) instead of frontend email checks.

## Remaining risk
- This pass validated policy presence from migrations and runtime code expectations, but not live policy behavior in a deployed DB instance. Run smoke tests with admin + non-admin users to confirm behavior end-to-end.
