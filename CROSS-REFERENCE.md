# CROSS-REFERENCE (Pass 1/2 findings vs current state)

## REMAINING-BLOCKERS.md
- **Admin frontend email check** → **RESOLVED** (now RPC-based admin check in route guard).
- **Demo path missing clear error boundaries** → **MITIGATED** (pipeline + candidate pages now have explicit unauthorized/error states).
- **Edge auth inconsistency** → **MITIGATED/PARTIAL** (fixed on demo-path AI functions, still open on ingestion/scheduler functions).
- **Deployment env documentation gap** → **STILL OPEN** (`.env.example` incomplete for backend operations).

## ENV-MATRIX.md
- Required variables are now enumerated.
- Demo workflow can run with minimal auth + AI set (`VITE_*`, `SUPABASE_*`, and one AI provider).
- Full platform operations still require additional envs (`RESEND_*`, IMAP vars).

## RLS-AUDIT.md
- Demo workflow tables are covered by migration-defined RLS + admin policies.
- Runtime verification in live env remains required (manual smoke test required).

## ROUTES-AUDIT.md
- Demo workflow routes are guarded by app-shell auth checks.
- Admin routes are server-enforced through `is_platform_admin` RPC check.

## Overall
- **Resolved:** Demo-route admin enforcement, demo-page UX failure states, demo AI function JWT auth checks.
- **Still open:** ingestion function auth model, environment reproducibility completeness, full-system health endpoint breadth.
