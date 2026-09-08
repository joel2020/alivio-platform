# LATAM and Medellín Restoration Implementation Plan

**Goal:** Restore two previously visible recruiting pages and consolidate overlapping historical paths.
**Architecture:** Reuse existing marketing layout and search-page styles with separate LatamPage and MedellinPage components. Add explicit static Vercel routes; keep canonical pages indexable and redirect only the two known aliases.
**Tech Stack:** React 18, React Router 7, Vite, TypeScript, Vercel, Playwright.

## Global constraints
Existing service scope only; no fabricated local office, hiring results, pricing, EOR/payroll or compliance promises. No new integrations or real form submissions. User has approved restoration and publishing. Implement sequentially; Claude reviews without running a duplicate build.

- [x] Extend restored-pages, quality and search-visibility tests for the two canonical paths; add 308 redirect checks and verify failure on the old build.
- [x] Create `src/pages/marketing/LatamPage.tsx` and `MedellinPage.tsx`; wire `src/App.tsx`, `src/entry-prerender.tsx`, `src/lib/preloadMarketingRoute.ts`, `src/lib/pageSeo.ts`, footer/services links, `public/sitemap.xml` and `vercel.json`. Reuse search-page classes without new CSS.
- [ ] Run build, typecheck, lint and full local browser suite. Review desktop/mobile screenshots. Give Claude full scoped diff, new files and test evidence; resolve substantive findings.
- [ ] Commit and push; open PR, verify CI and all deployed preview checks; merge verified HEAD and verify production deployment matches its merge commit.
- [ ] Run full production suite, confirm sitemap has 84 canonical entries, submit sitemap and request the two canonical URLs in Search Console. Record observed outcomes on PR; requests are not indexing guarantees.
