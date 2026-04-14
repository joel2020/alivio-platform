# ROUTES-AUDIT

Source of truth reviewed: `src/App.tsx` plus route guard components.

## Route list + guard behavior

### Public marketing routes
- `/`, `/product`, `/pricing`, `/developers`, `/privacy`, `/terms`, `/blog`, `/blog/:slug`, `/contact`
- Auth required: **No**
- Direct navigation: renders marketing pages
- Missing/expired session: unaffected

### Auth routes
- `/login`, `/signup`
- Auth required: **No**
- Direct navigation: login/signup forms

### Onboarding routes
- `/onboarding`, `/onboarding/first-role`
- Auth required: **Not explicitly route-guarded in router**
- Behavior depends on page-level/auth-context logic (not confirmed in this audit)

### App workspace routes (wrapped by `AppLayout`)
- `/dashboard`, `/pipeline`, `/roles`, `/roles/new`, `/roles/:id/pipeline`, `/roles/:id/settings`, `/outreach`, `/agents`, `/candidates/:id`, `/settings`, `/dashboard/crm`, `/dashboard/crm/templates`, `/dashboard/crm/:id`
- Auth required: **Indirect** (via app-level layout/auth state, not explicit route-level guard in router)
- Direct navigation with missing session: expected redirect flow is layout/auth-context dependent (**not confirmed** end-to-end in this pass)

### Admin routes (wrapped by `AdminRoute`)
- `/admin`, `/admin/users`, `/admin/organizations`, `/admin/blog`, `/admin/ai-monitor`, `/admin/email-inbox`, `/admin/tasks`
- Auth required: **Yes**
- Enforcement: `AdminRoute` checks authenticated session + RPC `is_platform_admin`
- Missing session: redirects to login
- Non-admin session: redirects to dashboard

### Redirect routes
- `/admin/crm` -> `/dashboard/crm`
- `/admin/emails` -> `/admin/email-inbox`
- `/about/*`, `/services/*`, `/team/*`, `/careers/*`, `/case-studies/*`, `/industries/*`, `/resources/*` -> `/`

### Utility routes
- `/og`
- `*` (NotFound)

## Fixes applied in pass two
- Removed leftover hardcoded-email admin UI checks in sidebar and email inbox page; switched to `is_platform_admin` RPC-driven checks.

## Dead/broken route findings
- No hard 404 loops found in route declarations.
- Some app routes rely on layout/page auth behavior rather than explicit route guards (**not confirmed** if every direct URL path gracefully redirects in all session-expiry races).
