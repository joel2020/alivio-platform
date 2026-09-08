# Fresh Article Rendering Implementation Plan

**Goal:** Deliver current published article HTML and accurate HTTP status without stale build snapshots.
**Architecture:** Shared article SEO and initial state; Vite-built server renderer; a read-only Node handler using existing public Supabase access. Exact /blog/:slug rewrite precedes the SPA route. Browser hydrates the same article before refreshing data.
**Tech Stack:** React 18, React Router 7, Vite 5, Node/Vercel Functions, Supabase public REST, Playwright and node:test.

- [ ] Add failing deployed article HTML/404 checks against existing production.
- [ ] Add shared article SEO/bootstrap state and server rendering; adapt BlogPostPage for hydration, canceled requests and optional related-post failures.
- [ ] Add validated read-only handler and fresh published-only lookup, 404/503 behavior, escaped template output and private server build artifacts. Configure exact rewrite and function file inclusion.
- [ ] Run unit tests for lifecycle, errors and injection; build/types/lint and local marketing tests. Review code and provide plan/diff/tests/security-sensitive files to Claude if its usage limit permits.
- [ ] Verify all deployed preview tests and browser visuals. Merge verified commit, verify production deployment/status/HTML/hydration and request Google recrawl of the repaired article. Record actual outcomes and limitations.

Inventory correction from preview: the old passive-candidate-outreach-messages URL is absent from the published inventory and must remain 404. Use succession-planning-for-growing-staffing-organizations as the published-article regression and Google recrawl target. Both missing and published cases previously received the same empty 200 shell.
