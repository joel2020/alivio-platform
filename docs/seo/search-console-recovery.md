# Search Console baseline and URL recovery — September 8, 2026

Direct access to the existing Alivio domain property worked. The GSC Wizard connector returned an expired-subscription error; no subscription or new account was purchased. This supersedes the earlier report's statement that Search Console data was unavailable. The [machine-readable baseline](search-console-baseline-2026-09-08.json) preserves the observations.

## Measured baseline

For August 10–September 6, 2026, Web search reported **10 clicks, approximately 1,120 impressions, 0.9% CTR and average position 11.2**. Google Search's separate generative AI report showed **31 impressions** in the same window. Those are Google observations; they do not establish referrals or recommendations from other AI products. The dates precede the September 8 technical changes, so no improvement caused by this work is claimed.

The homepage had 5 clicks, careers 3, about 1, and the legacy Westchester URL 1. Technology, healthcare and services had 57, 38 and 37 impressions respectively, with no clicks in the displayed page rows. These small samples identify pages to watch; they do not justify invented search volume, causal conclusions or mass page production. Google's rounded headline impressions and separate page totals are retained as displayed.

The indexing report, last updated September 3, reported 9 indexed and 162 excluded URLs. Reasons: 44 soft 404s, 68 discovered but not indexed, 23 crawled but not indexed, 20 with a different Google-selected canonical, 4 redirects, and one each for noindex, true 404 and a proper alternative canonical. This is a delayed report, not a fresh test of the new deployment. Redirects, private pages and removed jobs can be correctly excluded.

## Actions

The canonical sitemap was checked: HTTP 200, 80 entries, all on the canonical host. It was resubmitted in Search Console. Google confirmed **Success**, last read September 8, with **80 discovered pages**. Discovery is not index inclusion. The older www sitemap was left intact.

Seven legacy URLs found among Google's soft-404 examples have clear replacements:

| Old path | Destination | Reason |
|---|---|---|
| `/privacy-policy` | `/privacy` | Current privacy notice |
| `/terms-of-service` | `/terms` | Current terms |
| `/jobs` | `/careers` | Current job listing |
| `/apply` | `/careers` | Choose a current opening before applying |
| `/schedule` | `/contact` | Current contact and booking entry |
| `/services/retained-search` | `/services#engagement-models` | Current retained search description |
| `/services/recruitment-as-a-service` | `/services#engagement-models` | Current pipeline and RPO descriptions |

These use permanent HTTP redirects. The services destination has a visible section anchor with space below the fixed navigation. Tests check destination responses and preserve real 404s for retired job slugs, unknown services and the removed ROI calculator. No wildcard job redirect or broad homepage redirect was added.

The services URL was confirmed indexed in URL Inspection. Google accepted its recrawl request and confirmed it was added to a priority crawl queue. This is not a promise of a crawl date or a ranking change. Final deployment checks are recorded in the pull request after verification. No blanket validation of all 44 soft-404 URLs is claimed: dynamic article rendering and retired content require separate treatment.

## Next decisions supported by this evidence

1. Improve retrieval of current blog articles with a fresh rendering/unpublishing strategy. The historical URL `/blog/passive-candidate-outreach-messages` appears in the soft-404 examples; the later publication-inventory check found it absent, so it should remain a real 404. See `article-rendering.md` for the current published-article work. Do not freeze database content into a build without a removal strategy.
2. Review the 20 canonical exclusions and 23 crawled-but-not-indexed URLs before changing canonical rules or consolidating articles.
3. Confirm current Westchester coverage before restoring the location page that earned one click. A generic redirect would not preserve its location-specific purpose. Other former locations, services and job slugs need the same evidence check.
4. Use the existing content drafts to improve the three commercial pages already receiving impressions. Verify business promises and named expertise before expanding claims; no fabricated case studies or mass publication.
5. Compare a complete 28-day post-deployment window against this baseline, keeping Web and Google AI metrics separate. Assess qualified inquiries with GA4 or existing lead records when available. No automatic monitoring was scheduled.

## Validation and access limits

Build/browser results and production commit are recorded on the recovery pull request. Form tests intercept submissions. Claude authentication was checked again and returned `loggedIn: false`; no independent Claude review is claimed.

Sources: [Web performance](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Aaliviosearchpartners.com&num_of_days=28), [Google AI performance](https://search.google.com/search-console/performance/search-analytics/ai?resource_id=sc-domain%3Aaliviosearchpartners.com&num_of_days=28), [indexing report](https://search.google.com/search-console/index?resource_id=sc-domain%3Aaliviosearchpartners.com), [sitemaps](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Aaliviosearchpartners.com), [Google redirect guidance](https://developers.google.com/search/docs/crawling-indexing/301-redirects), [Vercel redirects](https://vercel.com/docs/routing/redirects).
