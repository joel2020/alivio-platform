# ADMIN-MODEL

## Decision
`owner` is **not used anymore** to determine platform admin rights.

A dedicated flag now drives platform admin:
- `public.users.is_platform_admin boolean`
- `public.is_platform_admin()` checks this flag for `auth.uid()`.

This removes ambiguity between org-level role semantics and global/admin-console semantics.

## What values does `users.role` contain?
- Code type expects: `owner | admin | editor | viewer`.
- Schema now enforces the same set via `users_role_check` (migration `20260414194000_admin_model_cleanup.sql`).

## Is `owner` used elsewhere with a different meaning?
Yes.
- CRM/page access logic treats `owner` as org-level elevated role.
- Old pass-one admin policy used `owner` as platform admin surrogate (removed in pass two).

## Other admin-like checks found
- Removed/updated hardcoded email checks in:
  - `src/components/app/Sidebar.tsx`
  - `src/pages/app/admin/EmailInboxPage.tsx`
- `AdminRoute` already uses `is_platform_admin` RPC.

## Frontend admin consistency
- `/admin/*` is still guarded by `AdminRoute` calling `is_platform_admin` RPC.
- Sidebar and Email Inbox visibility now also uses `is_platform_admin` RPC rather than email matching.

## Not confirmed
- Existing production data migration plan for populating `is_platform_admin` is **not confirmed**.
  - Someone must set this explicitly (SQL/admin tool) for intended platform admins.
