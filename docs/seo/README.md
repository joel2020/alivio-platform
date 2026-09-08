# Alivio search visibility: audit and execution plan

September 8 follow-up: direct Search Console access is now verified. See the
[measured baseline and URL recovery](search-console-recovery.md) for actual
Web/Google AI metrics, indexing exclusions and confirmed sitemap submission.
The original access limitations below describe the earlier audit.

Reviewed September 8, 2026. Scope: production `aliviosearchpartners.com`, repository `joel2020/alivio-platform`, Vercel project `alivio-platform`, Supabase `Alivio-OS`. This is a technical and content baseline, not a measured ranking improvement.

## What the evidence shows

The HTTP baseline in [http-baseline.json](http-baseline.json) found no H1 and an empty React root on the inspected public pages. All returned the homepage title and canonical before JavaScript. Missing page and asset URLs returned HTTP 200 HTML. Private client report and login URLs lacked the production exclusion headers applied to some other internal routes. Browser rendering worked, so this was a discovery/metadata problem rather than missing source content.

The scoped database inventory contains 67 published articles: all use `Alivio Search Partners` as author and `Insights` as category; none contains an HTTP/HTTPS source link in its body. Openings sampled across the inventory repeat general staffing language. Word count alone does not establish quality, and absence of links does not prove inaccuracy. These findings justify editorial review, not blanket deletion or noindexing. See [article-inventory.json](article-inventory.json).

A branded web search surfaced the current homepage, an older indexed careers description, a LinkedIn company result, and `aliviosearch.com/blog`. Ownership and current redirects of the shorter domain were not established. Do not redirect or edit it without checking ownership and business intent. Search snippets can be stale and are not reliable live-page evidence.

Search Console, Bing Webmaster Tools, conversion analytics and verified crawler logs were not available in this task. No claim is made about impressions, clicks, ranking positions, keyword volumes, lead attribution or actual AI citation share. No analytics provider was installed. The earlier backend outage was resolved by resuming the existing Supabase project; keep availability in the operating checklist.

## Ten priorities

| Order | Opportunity and evidence | Expected impact | Effort | Status / dependency |
|---|---|---|---|---|
| 1 | Public HTML and unique metadata: empty initial responses across core pages | Makes business content directly retrievable and previews descriptive | Medium | Implemented for nine stable pages; deployed checks required |
| 2 | Real missing-page responses: nonexistent pages/assets returned 200 | Removes avoidable soft-404 and asset ambiguity | Low | Catch-all replaced with explicit application routes; verify on Vercel |
| 3 | Private indexing controls: client/account routes lacked headers | Reduces accidental discovery of internal URLs | Low | Added noindex/nofollow and no-store headers; authentication remains the access control |
| 4 | Article quality: uniform labels, repeated openings, no body source links | Creates reasons to trust and cite content | Medium/high | Recruiter review and original evidence needed; no mass publishing |
| 5 | Commercial page clarity and proof | Helps employers evaluate fit and take action | Medium | Query map and service FAQ draft prepared; confirm operating promises |
| 6 | Search and conversion baseline unavailable | Makes investment decisions measurable | Low/medium | Owner must provide existing GSC/Bing/analytics access or exports |
| 7 | Current blog HTML still depends on JavaScript | Improves article retrieval and sharing | Medium | Next rendering phase needs a content freshness/unpublish strategy; avoid stale build snapshots |
| 8 | Job publication lifecycle and structured data eligibility | Avoids advertising closed or misattributed roles | Medium | 97 records existed after restoration; confirm active status, employer, location, job type and expiration semantics before job-feed expansion |
| 9 | Business identity across domains, founder and third-party profiles | Improves consistency and credibility | Medium | Verify domain ownership, founder credentials, profile links and permissioned client proof |
| 10 | Relevant external contributions and referenceable resources | Builds genuine discovery beyond owned pages | Medium/high | Expert-approved resources and publisher acceptance; no outreach sent |

Impact is a reasoned hypothesis, not a forecast of rankings or revenue.

## Technical implementation

- Vite's existing build now renders nine stable public pages from the same React components: home, services, about, product, both practices, privacy, terms and accessibility. No framework migration or paid dependency.
- A shared metadata function supplies distinct initial titles, descriptions, canonicals, social tags and WebPage data. Industry metadata stays specific after client navigation.
- Dynamic pages retain the original empty application shell. No jobs, candidates, reports, credentials or CRM data are serialized into static HTML. Prerendered public documents hydrate matching Suspense boundaries to preserve content during lazy route downloads; dynamic/private shells retain the existing client render path.
- Vercel routes known application URLs to that shell. Unmatched URLs and missing assets can return a real 404. Legacy public aliases have permanent redirects.
- Account, client and internal application routes receive exclusion and no-store headers. Existing robots rules already permit public crawling under `User-agent: *`; AI-training preferences are unchanged.
- Organization-authored articles now use Organization author schema, and date-only publication values display their actual calendar date in western time zones. Unavailable articles receive client-side noindex; a real dynamic article 404 is a follow-up.
- Accessibility was missing from the static sitemap and was added. Blog URL parity is checked against the current publication inventory; dynamic sitemap generation and freshness remain future work.

Prerendered pages refresh with each normal Git deployment. Blog and job changes continue to load from Supabase. Do not add database snapshots to the build without handling withdrawals, changed URLs and rebuild failures.

## Five relevant competitor comparisons

These are content observations from their own public pages, not audited performance claims or endorsements. Research queries included healthcare executive search, physician recruitment and technology leadership recruiting. Results vary by engine, location and date.

| Firm / inspected source | Observable approach | Concrete Alivio opportunity |
|---|---|---|
| [Jackson Physician Search](https://www.jacksonphysiciansearch.com/clients/physician-executive-recruitment/) and [research library](https://www.jacksonphysiciansearch.com/research-and-reports/) | Dedicated physician executive page connects search examples and original research | Develop an evidence-backed physician search resource and connect it to the practice page |
| [Cowen Partners](https://cowenpartners.com/healthcare-executive-search/) | Names healthcare leadership functions and organization types on a specific service page | State exactly which leadership roles Alivio supports; provide fit criteria and a relevant CTA |
| [Parker Remick](https://parkerremick.com/) | Focuses on technical leadership and separates venture, private equity and public-company audiences | Explain stage and role fit for Alivio's technology practice, without copying competitors' placement claims |
| [Daversa](https://daversa.com/) | Presents executive search through company, leadership and sector context | Show permissioned examples and who led the work, rather than unsupported success counters |
| [McMillan, Solheim & Lechner](https://mslhealthrecruiters.com/) | Displays named partner biographies and attributed testimonials | Strengthen Joel's verified biography and collect publishable customer evidence |

These sources support the observations only. They do not prove why a competitor ranks or is cited.

## Query and content plan

[query-map.csv](query-map.csv) groups related buyer intents into existing pages. Prioritize healthcare/physician and healthtech searches already reflected in the site. Do not create a separate landing page for every wording or city. Fee, timing, coverage and replacement claims require owner confirmation.

Review the 67 articles against five criteria: specific employer decision, original insight, accurate evidence, distinct purpose, and useful next step. Preserve URLs with value. Where pages substantially overlap, propose a destination and redirect only after checking Search Console demand and links. Keep factual publication dates; record substantive revision dates only when work occurs. Replace `Insights` with meaningful categories only after mapping articles to actual topics.

Start with the [prepared content drafts](content-drafts.md). They do not contain fabricated results and have not been published. The existing gastroenterology example is a shortlist milestone, not a proven placement or retention outcome. Obtain permission and source records before expanding it.

## Legitimate external visibility

- Verify the existing LinkedIn company profile, correct business website, service descriptions and founder information; avoid duplicate profiles.
- Evaluate participation in relevant ACHE, MGMA and regional healthcare/technology communities. Membership, directory eligibility and editorial acceptance are not assumed. [ACHE's directory](https://www.ache.org/Career-Resources/Transition-Your-Career/Executive-Search-Firms) is an example of a relevant audience, not a guaranteed listing.
- Offer a reviewed hiring checklist or an anonymized search-process analysis to an appropriate association or publication. Start with evidence, not a backlink request.
- Publish signed, useful expert contributions and permissioned case studies. No paid links, manufactured reviews or mass forum mentions.
- Apply for a Google Business Profile only if the business meets its real eligibility and location requirements; do not invent an office or service area.

A reviewable outreach draft is included in the content file. No messages or submissions were sent.

## Measurement protocol

Use [ai-visibility-prompts.csv](ai-visibility-prompts.csv) as a fixed question set. For each platform and run, record date/time, product/model, search mode, locale, exact question, full answer, whether Alivio was mentioned, exact cited URLs, citation accuracy and competitors mentioned. Repeat each prompt three times in fresh sessions. Keep branded and unbranded questions separate. Do not report unsupported platforms as tested. No scheduled automation was created.

Compute mention rate and citation rate as successful observations divided by total completed observations, with the sample size alongside each rate. Compare identical protocols over time; answer order is not a universal ranking. Record changes in wording or geography as a new cohort.

Weekly operating measures once access is available: non-branded clicks/impressions and landing pages in Search Console; index coverage for the priority URLs; qualified inquiries and booked calls by known source; observable AI referrals; confirmed form delivery; and backend availability. Do not infer that every unlabelled visit came from AI. Qualify leads by employer fit, real hiring need, service/geography fit and timing; do not optimize for raw form volume alone.

## 30/60/90-day roadmap

**Days 1–30:** release and verify the technical fixes; obtain GSC/Bing/analytics access; inspect priority URLs using the platforms' URL tools; submit the accurate sitemap where access allows; baseline the fixed AI question set; verify domain identity; interview Joel about two real searches; approve the three draft resources. Success means verified discovery and measurement, not guaranteed rankings.

**Days 31–60:** publish the reviewed resources; improve the first five overlapping or generic articles; add permissioned founder/customer evidence; decide the blog rendering and content lifecycle approach; verify active-job semantics; pitch a small number of suitable publishers after approval. Measure indexing and qualified traffic before producing more pages.

**Days 61–90:** compare equal measurement windows and repeat the same AI protocol; update pages showing impressions but weak relevance/conversion; consolidate overlapping pages only with evidence; expand the strongest documented specialty; publish additional original resources only when data and expertise justify them. Review qualified inquiries and booked calls alongside visibility.

## Guidance and limits

Google says its existing SEO foundations remain relevant to generative search, with useful original content central to the approach; it does not require special AI markup or llms.txt. [Official guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). OpenAI documents search crawling separately from training crawling. [Crawler documentation](https://developers.openai.com/api/docs/bots). The prerender implementation follows [Vite's supported SSG approach](https://v5.vite.dev/guide/ssr).

Passing browser and build checks establishes technical behavior. It does not establish search-engine index inclusion, real customer outcomes, email delivery, or AI recommendations. Claude review was previously unavailable because the CLI was signed out; check again before representing any independent review as complete.

## Verification for this change

Local production build and TypeScript checks passed. ESLint reports zero errors and the pre-existing `SeoRecoveryPage.tsx` Fast Refresh warning. The expanded Playwright suite passed 46 checks locally; the one deployment-only HTTP/header check is intentionally skipped until Vercel verification. Tests cover initial content without JavaScript, canonical URLs, client navigation metadata, article date/author consistency, and the original mobile/accessibility/form scenarios. All intake/application requests are intercepted.

Claude authentication was checked during this phase and still reports `loggedIn: false`. No independent Claude review is claimed. Deployment results will be recorded separately after the preview is available.

Protected Vercel preview `alivio-platform-ifv7a6x7o-joel-carias-projects.vercel.app`
(application commit `0419feb`) passed **all 47 checks**, including actual HTTP 404s
for missing pages/assets, noindex/no-store headers on private routes, nine pages
readable with JavaScript disabled, and the existing application checks. Temporary
preview access was used; deployment protection was not changed. Test-only browser
contexts explicitly inherit the optional preview session state.

Final review identified an early-loading regression on lazy public routes. The
client now waits for the path-matched marketing module and hydrates the matching
server Suspense boundaries instead of replacing the content. A deliberately delayed
Services chunk test keeps the H1 visible throughout loading, then verifies the menu
works and no hydration errors occur. The revised local suite passes 47 checks,
with only the deployment-specific HTTP/header check skipped. Build, typecheck and
lint passed again (the same pre-existing lint warning remains).

The deployed checks also exposed horizontal overflow after live careers records
loaded on a 320px viewport. Job cards now wrap their category and constrain their
text column. The mobile regression explicitly loads a long-title job before
checking accessibility and width. The delayed-chunk test retries interaction while
the released remote script downloads, rather than treating release as hydration
completion. Final deployment results are recorded in the pull request.

Production verification of PR #129 passed all 48 checks. A separate Lighthouse
run exposed a homepage hydration mismatch: React 18 escaped quotation marks in
an inline style selector during server rendering. Those responsive rules are now
in the stylesheet. The regression suite additionally checks all nine static
pages for browser errors after hydration; follow-up deployment evidence is
recorded with the correction pull request.
