# Contributing

All production changes must go through a pull request. Do not push directly to
`main`.

## Required Pre-Merge Checks

Run these checks before requesting review:

```sh
npm install
npm run typecheck
npm run build
```

Then verify the public and app surfaces:

- Verify `/` renders the expected homepage headline: `Hire Critical Healthcare & Technical Talent`.
- Verify the Vercel preview deployment is `READY`.
- Verify public CTAs point to Cal.com.
- Verify `/login` loads.
- Verify app routes still load and Supabase/auth-protected routes are not broken.
- Verify public brand text says `Alivio Search Partners`.
- Do not add fake client logos or unverified marketing claims.

## Pull Request Expectations

- Open PRs from a feature branch.
- Include any manual verification notes that are not covered by CI.
- Link related issues or deployment previews when available.
- Keep unrelated edits out of the PR.
