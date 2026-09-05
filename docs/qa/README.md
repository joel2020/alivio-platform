# Website quality fixes — September 5, 2026

## Scope and source

These changes target `joel2020/alivio-platform`, the Vite application serving
`aliviosearchpartners.com` at production commit
`c5f4ae0c1ed4e373a4bc76852409e439c414d449`. The separate Next.js redesign
repository and its existing rebuild were not changed.

## Verified changes

- Responsive footer columns remove the source of the 581px-wide mobile document.
  The navigation menu fits at 320, 390, 768, and 1024px; desktop navigation fits at
  1440px. The menu supports Escape, focus trapping/return, background inertness,
  and cleanup when resized to desktop. Closed menu links are not focusable.
- Corrected light headings and secondary buttons on dark backgrounds, including
  the homepage, product page, services page, and contact page. Added persistent
  input labels, autofill, visible focus, a skip link, and reduced-motion support.
- Simplified the primary conversion choices to a hiring strategy call or search
  plan. Explained the relationship between the AI engine and recruiting services.
- Clearly labeled example dashboards and removed unsupported homepage aggregate
  figures and implied client endorsements. Preserved the existing anonymized
  gastroenterology search snapshot, explicitly distinguishing shortlist evidence
  from placement/retention results. Added founder context and hiring FAQs.
- Both inquiry forms preserve data on errors, announce and focus feedback, and
  require `{ "ok": true }` before confirming success. The existing Supabase
  endpoint and payload fields are preserved. No real submissions were sent.
- Split routes so homepage visitors do not download the CRM, candidate tools,
  admin pages, or other route code immediately. Added loading/recovery screens
  and client-navigation scroll/anchor behavior.
- Served the licensed Inter font locally. Repaired the pre-existing out-of-sync
  lockfile so a clean `npm ci` succeeds.

## Acceptance results

| Check | Result |
| --- | --- |
| Clean `npm ci --no-audit --no-fund` | Passed |
| `npm run typecheck` | Passed |
| `npm run lint` | 0 errors; one existing Fast Refresh warning in SeoRecoveryPage.tsx |
| `npm run build` | Passed |
| Production browser suite | 26 passed |
| Core routes at 320px | No document overflow; zero automated WCAG A/AA violations in the selected rules |
| Main JavaScript bundle | 367.32 KB / 110.03 KB gzip, versus 842.32 KB / 217.25 KB gzip before splitting |
| Desktop Lighthouse | Performance 100 / Accessibility 100 / Best practices 100 / SEO 100 |
| Mobile Lighthouse | Performance 99 / Accessibility 100 / Best practices 100 / SEO 100 |
| Mobile layout shift | 0 |

The initial six regression tests reproduced four failures before fixes (320px,
390px, 1024px, and homepage contrast). All pass after the changes.

Lighthouse reports are local production-build lab measurements, not production
field measurements or an overall business/conversion score. The mobile and desktop reports and 26-test production suite cover the final
release candidate.
Automated accessibility checks do not replace a full assistive-technology audit.

## Review artifacts

- [Desktop screenshot](home-desktop.png)
- [Mobile screenshot](home-mobile.png)
- [Search-plan form on mobile](search-plan-mobile.png)
- [Mobile Lighthouse report](lighthouse-mobile.json)
- [Desktop Lighthouse report](lighthouse-desktop.json)

## Reproduce locally

Use an installed Google Chrome (the Playwright default in this repository) or
set `PLAYWRIGHT_CHANNEL` for another installed Chromium channel.

```sh
npm ci
npm run typecheck
npm run lint
VITE_SUPABASE_URL=https://alivio-qa.invalid VITE_SUPABASE_ANON_KEY=local-browser-tests npm run build
npm run preview -- --host 127.0.0.1 --port 4174
```

In another terminal:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4174 npm run test:marketing
```

The `.invalid` URL and noncredential key are exclusively for isolated local QA.
Tests intercept form requests and never create leads. Use the deployment's real
Vite environment configuration for Preview/Production; do not deploy a build
created with these QA values.

## Release and review limits

Production has not been replaced by this patch. Before merging/releasing, review
the preview with real deployment environment settings and verify the booking
link. Confirm actual lead delivery separately with an authorized test submission.
The authenticated CRM/admin workflows were not exercised with a real account;
login and signup pages were smoke-tested after route splitting.

Named customer references, testimonials, retention statistics, and replacement
terms require evidence/owner confirmation. None were fabricated to raise a score.
The existing engagement snapshot is preserved from the production source, not
newly audited against customer records in this change.

Claude plan/diff review was attempted per the workspace instructions, but the
Claude CLI returned `Not logged in · Please run /login`. That independent review
remains pending; it was not represented as completed. The implementation was
checked directly, built, and tested with the evidence above.
