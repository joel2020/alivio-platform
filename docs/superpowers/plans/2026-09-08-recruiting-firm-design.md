# Recruiting Firm Presentation Implementation Plan

**Goal:** Implement the approved sophisticated recruiting-firm design without disturbing search visibility or application behavior.
**Architecture:** Existing React marketing routes and SSR remain; add a marketing-scoped editorial stylesheet and reusable founder/search/CTA components. Keep existing data queries and inquiry handling.
**Tech Stack:** React 18, React Router, Vite, CSS, existing Playwright and axe.

## Global constraints
Use only verified existing claims, no new dependencies, keep all URLs and canonical behavior, keep dashboard styling independent, preserve accessible mobile navigation.

- [x] Add `src/styles/recruiting-firm.css`, imported by `MarketingLayout.tsx`; navy/ivory/teal tokens, Georgia/Inter, responsive editorial layout and controls.
- [x] Rewrite `HomePage.tsx`; add shared `RecruitingFirmSections.tsx` for the existing search evidence, founder profile and booking CTA. Present practices, process, existing article links and FAQ in approved order.
- [x] Simplify `MarketingNav.tsx`, retain dialog behavior, provide direct mobile practice links; align footer colors and keep all restored-page links.
- [x] Restyle `AboutPage.tsx` and `IndustriesPage.tsx` with real biography, clear assessment/deliverables and correct documented search evidence. Curate `BlogPage.tsx` presentation while preserving query, author, date and paging behavior.
- [x] Update only relevant label-dependent tests and add navigation/evidence regressions. Run `npm run typecheck`, `npm run build`, targeted ESLint and existing marketing tests. Inspect screenshots at 1440 and 390 pixels; check narrow 320px and reduced motion via existing CSS/test suite.
- [ ] Review final diff and checks; request Claude read-only review of plan, diff and tests. Publish via Git PR workflow after checks; verify production homepage, practices, About, restored paths, article and metadata. Record actual verification and any remaining asset limitations.
