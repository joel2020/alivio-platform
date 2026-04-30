# Deployment Guardrails

This repo serves the public Alivio Search Partners homepage from the Vite root route `/`.

## Required Checks

Never merge homepage, routing, Vercel, or deployment changes unless these commands pass locally and in CI:

```bash
npm run verify:homepage
npm run verify:production
npm run typecheck
npm run build
```

Before merging, verify `/` shows the current public homepage headline:

```text
Hire Critical Healthcare & Technical Talent
```

## Homepage Routing

The root route `/` must render `src/pages/marketing/HomePage.tsx` from `src/App.tsx`.

If the homepage looks unchanged after deployment, check these in order:

1. Route mapping in `src/App.tsx`.
2. Vercel project and production domain mapping.
3. Browser or CDN cache.

`vercel.json` must keep SPA rewrites pointed at `/index.html` and must not redirect `/` away from the Vite app.

## Public Brand And CTAs

The public brand is `Alivio Search Partners`, not `Alivio Platform`.

All public CTA links for intro/demo booking should use:

```text
https://cal.com/alivio/intro-call30
```

Do not add fake or unverified client-logo text to public marketing surfaces.

## App Routes

Marketing edits should not casually change app/internal product routes such as dashboard, CRM, candidates, roles, pipeline, auth, admin, or AI-agent flows.

The public client shortlist portal should remain disabled unless `VITE_ENABLE_CLIENT_SHORTLIST_PORTAL=true` is intentionally set for a reviewed release. The documented default is:

```text
VITE_ENABLE_CLIENT_SHORTLIST_PORTAL=false
```
