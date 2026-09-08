# Search page restoration implementation plan

**Goal:** Restore the approved Westchester and pricing pages at their original URLs.
**Architecture:** Two isolated React marketing pages, integrated into existing prerender/hydration, metadata and Vercel routing. Shared site styles and navigation remain in use.
**Tech stack:** React 18, Vite, React Router, Vercel, Playwright.

## Constraints
Use only existing service scope, no fabricated local office or price claims. Preserve private-route protections and unrelated redirects. No new dependencies. The user approved the two-page scope; routine implementation proceeds without another permission gate.

- [x] Add the two paths to SSR/hydration and accessibility tests plus a deployed HTTP/CTA check; verify they fail on the current local build.
- [x] Create PricingPage.tsx and WestchesterPage.tsx using the current marketing visual system; add styles for the new content only.
- [x] Integrate App routes, preloadMarketingRoute, entry-prerender, pageSeo, Vercel rewrites and sitemap; remove pricing redirect in both router and Vercel.
- [x] Add contextual pricing link from Services and footer links to both pages.
- [x] Build, typecheck/lint and run the browser suite. Review plan, diff and results with Claude; resolve actionable issues.
- [ ] Push and verify preview including HTTP routes. Merge exact tested head and verify the public domain. Update Google discovery using existing authorized access where available.
