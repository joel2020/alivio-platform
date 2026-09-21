# Alivio recruiting-firm redesign

Implemented from the approved “Redesign Alivio Search Partners” conversation and the September 10 request. Based on `joel2020/alivio-platform` main commit `952f2c7`, confirmed as the Vercel project serving aliviosearchpartners.com. The older saved Next.js project is not the production source.

## Experience

- All eight approved homepage sections, including direct sourcing, candidate vetting, four search steps, candidate benefits, industry role examples, founder introduction, and final recruiting-call invitation.
- Employer, candidate, industries, healthcare, technology, executive, about, jobs, and contact pages.
- Persistent navigation: Employers, Candidates, Industries, Jobs, About, Contact.
- Primary action: Book a Recruiting Call, using the existing Cal.com URL. Secondary action: View Open Jobs.
- Existing job data and application endpoint retained. General resume submissions open the verified company email address; applicants attach the resume in their email application.
- Navy #0A2C4C, teal #A5D1C7, white, light gray #F6F8FA. Self-hosted Inter, responsive layout, reduced motion, visible focus, existing accessible mobile menu.
- Professional photography is locally hosted with dimensions and lazy loading; the hero loads eagerly. Photos are illustrative, not representations of Alivio staff or clients.
- No invented client logos, testimonials, placements, or promised hiring timelines.

## Search visibility and routing

- New pages are prerendered with unique metadata and canonical URLs. Jobs prerenders the public page shell only; listings stay live.
- Updated organization description, sitemap, and social preview image.
- Legacy product/platform pages redirect to Employers. Pricing redirects to engagement models. Careers index redirects to Jobs; existing `/careers/:id` application links continue to work.
- Public `/candidates` is indexable. Private candidate detail paths retain both noindex and no-store headers. Authenticated application routes and authorization were not changed.
- Regional recruiting and published insights remain available at their existing URLs.

## Verification

- Production build: passed; 17 public pages prerendered.
- Typecheck: passed.
- Full lint: no errors. One existing fast-refresh warning in `SeoRecoveryPage.tsx`; new files lint cleanly.
- Browser suite: 102 passed locally; all 5 deployment-only checks also passed against the hosted preview (107 total). Covers 320/390/768/1024/1440 widths, accessibility, keyboard navigation, truthful form failure/retry states, application consent, upload validation, duplicate prevention, and prerender hydration.
- Form/application checks intercept submissions; no real lead or application was sent.
- Manual visual inspection caught and corrected footer link layout. Navy/teal branding, hero, candidate and contact pages reviewed in desktop/mobile screenshots.
- Correctness, security boundary, and Ponytail complexity reviews: existing hooks, menu, forms, job feed, and booking URL reused. No new dependencies or backend changes.

## Photography sources

- https://images.unsplash.com/photo-1521737711867-e3b97375f902
- https://images.unsplash.com/photo-1576091160399-112ba8d25d1d
- https://images.unsplash.com/photo-1522071820081-009f0129c71c

Local screenshots are in `artifacts/recruiting-redesign/` (not committed). Hosted preview: https://alivio-platform-4kcgsntem-joel-carias-projects.vercel.app

Production publishing is a separate release step; production has not been changed.

## September 21: LATAM and offshore recruitment

Added a shared LATAM/offshore service section to the homepage, employer page, and industry hub; added links to mobile practice navigation and the footer. Extended homepage, about, employer, and search-intake copy to include international recruiting. Preserved the existing LATAM URL and connected it to a new `/offshore-recruitment` page with role coverage, candidate assessment criteria, the existing recruiting process, and booking/jobs CTAs. Added prerendering, page-specific SEO, deployment routing, and sitemap coverage for offshore recruitment. Payroll and employment administration are described as separately scoped services.

Validation: build and typecheck passed, changed files lint cleanly, desktop/mobile layouts reviewed, and marketing browser checks passed. This remains a preview change; production has not been published. Unrelated Azure work already present in the checkout was excluded from the commit and preview.

## September 21: 21st.dev editorial refinement

Connected the existing MIT-licensed 21st.dev Editorial Collage Hero adaptation to the redesigned homepage. Preserved the approved headline, firm positioning, booking/jobs CTAs, and eight homepage sections. Replaced decorative artwork with the existing recruiting photograph and a navy search-approach panel; added a responsive expertise navigation for healthcare, technology, leadership, LATAM, and offshore recruitment. Kept source attribution and avoided additional JavaScript dependencies.

Validation: production build (18 prerendered public pages), typecheck, and changed-file lint passed. All 94 local marketing browser checks passed; 5 hosting-only checks remain skipped locally. Visually inspected desktop/mobile screenshots, checked horizontal fit at 320/390/768/1024/1440 widths, confirmed hero image loading, and confirmed entrance animation is disabled under reduced-motion preferences. No backend, credential, or form-submission changes. Screenshots: `artifacts/recruiting-redesign/21st-hero-desktop.png` and `21st-mobile-first-screen.png`.
