# ROUTES-AUDIT

## Demo path routes reviewed
- `/roles/:id/pipeline`
- `/candidates/:id`
- `/admin/*` (access-control verification)

## Guards and status
1. App shell guard: `AppLayout` enforces session and onboarding redirect for all app routes.
2. Admin guard: `AdminRoute` now calls server-side RPC `is_platform_admin` and blocks non-admins.
3. Session-expiry behavior: missing session redirects to `/login` using `next` parameter preservation.

## Result
- Demo path routes are guarded.
- Remaining route risk is operational (if RPC/function permissions regress in DB).
