# Restored search pages — September 8, 2026

At the user's request, `/pricing` and `/recruiting-agency-westchester` are restored as dedicated pages. The August 10–September 6 Search Console baseline showed 53 impressions for pricing and one click/five impressions for Westchester. This justifies a focused restoration experiment, not a claim of strong established traffic or guaranteed growth.

The pricing page explains the existing retained search, pipeline and project/RPO options, quote inputs and written-proposal questions. It supplies no invented amounts, fee percentages, refunds, timelines or guarantees. Westchester reuses the service scope in the saved SeoRecoveryPage content and adds practical employer questions about worksite, schedule, candidate preferences and evaluation. It does not claim a local office, specific client outcomes or market statistics. The old generic recovery component is not routed.

Both URLs now have dedicated React routes, static HTML, preload/hydration support, self-canonicals and WebPage/Organization data. The pricing redirect is removed from both App and Vercel. The pages are in the sitemap, linked from the footer, and connected to services, industry practices and search-plan intake. Other aliases, private controls and retired job responses are preserved.

Validation before preview: production build, TypeScript and lint passed; lint retains one pre-existing Fast Refresh warning. The expanded suite passed 64 checks locally, with three deployment-only checks skipped. Added checks first failed against the old build. Desktop pricing and mobile Westchester were visually reviewed. Claude reviewed the plan; review checks included exact historical paths, duplicate routes, complete redirect removal, SSR/hydration, honest claims and absence of fabricated local/price schema. Actual diff review and final preview/production results are recorded on the pull request.

Search Console follow-up: submit the updated sitemap and request both restored URLs for recrawling after verifying deployment. Record actual outcomes; a submitted request does not establish indexing or ranking gains.

Independent Claude diff review completed using the supplied full diff/new files and test evidence. Review follow-up verified the existing hash-scroll handler and service anchor, public robots access, and actual execution of deployed HTTP checks. Added sitemap membership and cross-page section-navigation checks; improved CTA spacing and heading hierarchy, and linked Organization schema through a stable @id. The prior permanent pricing redirect may remain cached in returning browsers, so fresh HTTP checks and Google recrawling are the deployment evidence. No unrelated archived page files were deleted.

After review refinements, build, TypeScript and lint passed again; the final local suite passed 65 checks with three deployment-only skips. The cross-page hash test confirms the services section clears the fixed navigation.
