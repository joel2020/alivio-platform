# Public website SEO optimization — September 14, 2026

Scope: the approved recruiting-firm redesign, including nearshore LATAM recruiting. Changes are on `codex/frontend-refresh-20260914` in the actual Alivio platform repository. This phase delivers a hosted preview; it does not promote production or claim ranking gains.

## Search Console observations

Read the existing `sc-domain:aliviosearchpartners.com` property through the authenticated browser. The GSC Wizard connector returned an expired-subscription error, but direct access worked; no additional subscription or setup was needed.

- Web performance, June 13–September 12, 2026: 31 clicks, approximately 2,520 impressions, 1.2% CTR, average position 19.8. These are observed totals for that window, not changes caused by this work.
- Displayed queries included `healthtech recruitment agency` (36 impressions, 0 clicks) and `health tech recruiters` (20 impressions, 0 clicks). Small samples support improving the existing technology page; they do not establish search volume forecasts.
- URL Inspection of the production `/nearshore-latam-recruiting` page reported **URL is on Google / Page is indexed**. This does not imply a particular ranking or that Google has crawled the unpublished redesign.
- The canonical sitemap showed **Success**, last read September 14, with 84 discovered pages. The www sitemap also showed Success. Discovery and index inclusion are different measures.
- The indexing report was last updated September 3: 9 indexed, 162 not indexed. Exclusions included 44 soft 404s, 68 discovered but not indexed, 23 crawled but not indexed, and 20 with a different Google-selected canonical. This stale report predates the recent recovery work and cannot evaluate the new preview.
- Core Web Vitals showed no field data. HTTP and www entry points were checked separately and both return 308 to the canonical HTTPS host.

## Implemented

1. Consolidated the duplicate `/services` content into `/employers` with a permanent deployment redirect, consistent canonical fallback, direct legacy redirects, and removal of `/services` from the sitemap. Existing indexed service URLs retain a relevant destination.
2. Added linked WebSite, Organization, and Service structured data using the business name, published contact email, existing LinkedIn profile, and service descriptions. Added visible breadcrumbs and matching BreadcrumbList data. No ratings, reviews, offices, prices, or results were invented.
3. Added prerendered public content and page-specific metadata for `/start` and the `/blog` landing page. Blog article records remain live; they are not frozen into the build. Individual published articles retain their server-rendered route and removal behavior.
4. Expanded the existing healthcare, technology/healthtech, and executive pages with distinct search-planning content. Added relevant links to nearshore LATAM and the inquiry form. Added the nearshore option to the existing inquiry selector.
5. Restored direct footer discovery of the existing Westchester and Medellín pages. Kept the canonical LATAM page prominent in the navigation and service journeys.
6. Preserved private-page noindex/no-store headers, real unknown-page 404s, stable canonical URLs, mobile layouts, and current forms. No candidate or client messages were sent.

## Search intent ownership

| Existing page | Main intent |
| --- | --- |
| `/industries/healthcare` | Healthcare recruiting, physician recruiting, healthcare leadership hiring |
| `/industries/technology` | Technology recruiting, healthtech recruitment agency, engineering/data/product search |
| `/industries/executive` | Executive and leadership search |
| `/nearshore-latam-recruiting` | Nearshore LATAM recruiting for U.S. technology and operations teams |
| `/employers` | Recruiting services, contingency/retained/contract engagement selection |
| `/recruiting-agency-medellin` | Medellín recruiting and location-specific search planning |
| `/recruiting-agency-westchester` | Westchester recruiting |

These are content targets, not promised rankings. Avoid creating multiple near-identical pages for variants of the same query.

## Validation

TypeScript, targeted ESLint, build, and whitespace checks passed. The initial full local suite passed 113 tests with 9 deployment-only checks skipped. After adding the blog landing-page prerender, the relevant search visibility and secondary-page suites passed 48 checks, with 2 deployment-only checks skipped. These runs overlap and should not be summed as distinct tests.

Lighthouse 13.0.1, local production build with mobile simulation: SEO 100/100, performance 92/100, LCP 3.3 seconds, CLS 0, TBT 0 ms. This is a single lab run, not field Core Web Vitals or a Google ranking score. The main remaining performance opportunity is responsive image delivery; the audit estimated about 143 KiB of savings. Detailed reports were saved locally under `/tmp/alivio-seo-lighthouse-mobile.json` during execution.

No independent Claude review is claimed: `claude auth status` returned `loggedIn: false`. Changes were reviewed through the diff and automated checks.

Final hosted validation: all 9 deployment-specific tests passed, covering article rendering/hydration, unpublished-article 404 behavior, regional URLs, permanent redirects, and private-page noindex/no-store headers. The sitemap crawl checked all 85 listed URLs: all returned 200, each had one H1, a unique title, a description, the expected canonical URL, and parseable structured-data JSON. The detailed result is in [frontend-crawl-2026-09-14.json](frontend-crawl-2026-09-14.json). The count is the current preview sitemap, not the earlier Search Console discovery count.

Verified preview: https://alivio-platform-p7ke3anmi-joel-carias-projects.vercel.app (deployment `dpl_53tQqKLtAR4tWbhgnyyNpiZQVdCY`). Temporary sharing access was used for verification; no access cookies were committed. Production remains unchanged.

## Release and measurement

The preview must be promoted to the canonical production domain before Google can use these changes. Following release, verify the canonical URLs, redirect, sitemap and private-page exclusions on production, then inspect the priority pages in Search Console. The current production sitemap was already successfully read today, so this phase did not resubmit a preview sitemap or request recrawling of unpublished content.

After Google has recrawled the release, compare equivalent 28-day periods for nonbranded impressions, clicks, query/page relevance, and qualified inquiries. Investigate the specific canonical and soft-404 examples that persist in a refreshed report. Prioritize original recruiter expertise and permissioned case studies over additional generic articles. No automatic monitoring, paid links, or outreach was scheduled.

Guidance: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [canonical URL consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization), [breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), and [page experience](https://developers.google.com/search/docs/appearance/page-experience).
