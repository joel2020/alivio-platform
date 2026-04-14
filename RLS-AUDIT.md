# RLS-AUDIT

Scope reviewed: all SQL files in `supabase/migrations/`.

## Table-by-table status

| Table | Created in migrations | RLS enabled | Policies present | Notes |
|---|---|---|---|---|
| organizations | yes | yes | yes | Platform-admin SELECT policy also added later. |
| users | yes | yes | yes | Multiple overlapping policy rewrites across migrations; drift risk exists. |
| roles | yes | yes | yes | Admin-wide SELECT policy layered on top of org policies. |
| candidates | yes | yes | yes | Admin-wide SELECT policy layered on top of org policies. |
| voice_calls | yes | yes | yes | Baseline org policies present. |
| voice_transcripts | yes | yes | yes | Baseline org policies present. |
| voice_settings | yes | yes | yes | Baseline org policies present. |
| agent_activity_log | yes | yes | yes | Admin-wide SELECT policy layered on top. |
| candidate_feedback | yes | yes | yes | Baseline org policies present. |
| clients | yes | yes | yes | JWT/org policies present. |
| outreach_history | yes | yes | yes | Created twice historically; policies repeatedly overwritten. |
| outreach_templates | yes | yes | yes | Org policies present. |
| email_inbox | yes | yes | yes | Org policies present. |
| resume_attachments | yes | yes | yes | Org policies present. |
| blog_posts | yes | yes | yes | Public read policy (`anon, authenticated using (true)`) is intentionally permissive for published content. |
| tasks | yes | yes | yes | JWT/org policies present. |

## Risk findings
1. **Policy drift risk is real**: same tables/functions are redefined repeatedly across migrations (especially `outreach_history`, admin functions, and user policies).
2. **No table found with RLS enabled and zero policies** in current migration history.
3. `blog_posts` has explicit public-read permissive policy. This appears intentional for marketing/blog rendering, but it is still wide-open by design.

## Safe patching done in pass two
- No broad RLS refactor applied (intentionally), to avoid destabilizing policy behavior without full production snapshot validation.
- Admin model policy function moved to explicit `users.is_platform_admin` flag migration (`20260414194000_admin_model_cleanup.sql`).

## Not confirmed
- Not confirmed whether all historical migrations are actually applied in the same order/environment in production.
- Not confirmed whether any manual SQL outside migrations changed active policies.
