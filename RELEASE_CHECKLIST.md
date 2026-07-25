# Release Checklist

Use this checklist before merging changes that can affect production.

## Local Checks

- [ ] `npm install`
- [ ] `npm run typecheck`
- [ ] `npm run build`

## Homepage And Public Site

- [ ] `/` renders the expected homepage headline: `Hire Critical Healthcare & Technical Talent`
- [ ] Public brand says `Alivio Search Partners`
- [ ] Public CTAs point to Cal.com
- [ ] No fake client logos were added
- [ ] No unverified marketing claims were added

## App Routes

- [ ] `/login` loads
- [ ] Auth-protected app routes still load or redirect as expected
- [ ] Supabase/auth flows were not broken

## Deployment

- [ ] Vercel preview deployment is `READY`
- [ ] Preview URL was checked before merge
- [ ] CI passed on the PR
