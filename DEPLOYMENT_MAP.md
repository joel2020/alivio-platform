# Deployment Map

## Scope

- Repo: `joel2020/alivio-platform`
- Expected Vercel project: `alivio-platform`
- Public website brand: Alivio Search Partners
- Current production hostname known from source: `https://aliviosearchpartners.com`
- Vercel project binding in repo: no `.vercel/project.json` is present, so the local checkout does not prove which Vercel project is linked.

## Runtime Shape

This is a Vite React single-page app.

- `index.html` is the static HTML shell.
- `src/main.tsx` mounts React into `<div id="root"></div>`.
- `src/App.tsx` owns React Router routing and app-level SEO updates.
- Vercel rewrites non-asset requests to `/index.html`, then React Router chooses the visible route.

`index.html` does not contain an old static homepage body. It only contains metadata, the root mount node, and the Vite module script. The visible homepage is React-rendered, not static HTML.

## Route Map

| URL path | Vercel behavior | React component rendered |
| --- | --- | --- |
| `/` | Rewritten to `/index.html`, then handled by React Router | `MarketingLayout` with `HomePage` from `src/pages/marketing/HomePage.tsx` |
| `/app` | Rewritten to `/index.html`, then handled by React Router | No explicit `/app` route exists; React Router falls through to `NotFoundPage` from `src/pages/NotFoundPage.tsx` |
| `/login` | Rewritten to `/index.html`, then handled by React Router | `RequireLoggedOut` wrapping `LoginPage` from `src/pages/auth/LoginPage.tsx` |

The authenticated product routes currently live under paths such as `/dashboard`, `/pipeline`, `/roles`, `/outreach`, `/agents`, `/settings`, `/calls`, `/dashboard/crm`, and `/admin`, wrapped by `AppLayout` from `src/components/app/AppLayout.tsx`.

## Homepage Source Files

- Homepage route owner: `src/App.tsx`
- Homepage page component and public homepage content: `src/pages/marketing/HomePage.tsx`
- Marketing navigation: `src/components/marketing/MarketingNav.tsx`
- Marketing layout wrapper: `src/components/marketing/MarketingLayout.tsx`
- Demo booking URL constant: `src/lib/demoBooking.ts`

The current homepage source includes the headline `Hire Critical Healthcare & Technical Talent — Faster`, the `Active Search Intelligence` panel, and CTAs that use `CAL_COM_BOOKING_URL`.

## SEO Metadata

SEO metadata is split between the static shell and runtime React updates.

- Static initial metadata: `index.html`
- Runtime route metadata: `SeoManager` inside `src/App.tsx`
- DOM metadata helper: `src/lib/seo.ts`

Because the app is client-rendered, crawlers and browser page source may initially show the static `index.html` metadata before React updates the document head.

## Vercel Rewrites And Redirects

`vercel.json` does not define a rewrite that points `/` to another page or project. It does define SPA fallback rewrites:

- `source: /((?!api|assets|robots\.txt|sitemap\.xml|favicon\.ico|favicon\.png|favicon\.svg|apple-touch-icon\.png|_next|_vercel|images|icons|fonts|manifest\.json).*)`
- `destination: /index.html`
- plus a final catch-all `/(.*)` to `/index.html`

Those rewrites make direct visits to React Router paths work, but they do not override which React component renders `/`.

`vercel.json` also redirects many legacy marketing paths, such as `/about`, `/services`, `/industries`, and related slug paths, back to `/`.

## Environment Variables

Required for the frontend React app to boot past the Supabase configuration gate:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional or route-specific frontend variable observed in source:

- `VITE_LOCAL_BACKEND_URL`

Additional backend, Supabase Edge Function, email, scheduler, AI provider, and Vertex variables are documented in `.env.example` and `ENV-MATRIX.md`, but they are outside this public website domain/deployment audit.

## Why The Homepage Might Look Unchanged

- Wrong domain is being opened.
- Wrong Vercel project is serving the domain.
- Browser cache or service edge cache is returning an older asset.
- The root route is still rendering an older React component or older deployed commit.
- A static `index.html` override is suspected, although this repo's `index.html` does not contain old homepage body content.
- The deployment is built but not promoted to production.
- The checked production commit SHA does not match the latest intended `main`.

## Production Verification Checklist

- [ ] Open the production URL in incognito: `https://aliviosearchpartners.com`
- [ ] Confirm headline: `Hire Critical Healthcare & Technical Talent — Faster`
- [ ] Confirm `Active Search Intelligence` appears.
- [ ] Confirm CTA links to `https://cal.com/alivio/intro-call30`.
- [ ] Confirm Vercel deployment status is `READY`.
- [ ] Confirm commit SHA matches latest `main`.

