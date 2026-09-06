# Public website follow-up — September 6, 2026

The expanded review found mobile overflow and false-positive success handling
in the career application, low contrast on policy pages and blog errors, and
an unlabeled blog search. Seven of the first eight new regression checks failed
against production before the fixes.

## Changes and verification

- Career applications require both a successful HTTP response and `{ ok: true }`.
  Invalid responses and provider failures preserve entered data and give a focused,
  announced error. No raw provider details are shown.
- Career inputs have persistent labels, appropriate autofill and input types,
  16px text, and a one-column name row on phones. A LinkedIn or resume link is
  checked before sending, matching the existing API requirement.
- Blog search has a visible label; selected categories are announced. Failed
  requests show readable retry guidance. Older requests cannot overwrite newer
  search results.
- Privacy, terms, and accessibility secondary text now passes automated contrast
  checks. Policy wording and dates are unchanged.

`npm run typecheck` and `npm run build` passed. `npm run lint` passed with zero
errors and the existing `SeoRecoveryPage.tsx` Fast Refresh warning. All 35
Playwright checks passed against the local production build. Career data and
application responses are intercepted: no real application or lead was sent.
The mobile application form was also visually inspected.

A Lighthouse run against the **public production homepage** before these
secondary-page changes measured performance 99, accessibility 100, best practices
100, SEO 100, LCP 1.7s, CLS 0 and total blocking time 50ms. This is a single lab
run, not a field measurement or an overall website/business score. The main
homepage bundle is unchanged by this follow-up (367.32 kB / 110.03 kB gzip).

Claude review remains unavailable: `claude auth status` reports `loggedIn: false`.
The diff was reviewed directly and tested; independent Claude review is not
represented as complete.

## Unresolved production dependency

The site's configured Supabase project is `ovxttubotjebnaoedllu` (Alivio-OS),
matching `supabase/config.toml` and the existing incident documentation. Public
blog requests fail with `net::ERR_NAME_NOT_RESOLVED`. An independent Google DNS
lookup returns status 3 (NXDOMAIN) for its API hostname. This affects the common
API origin used by blog data, careers data, authentication and intake delivery.

The connected Supabase account cannot access that project, and its visible
project list does not include Alivio-OS. The owner has been asked to connect the
owning account or provide the replacement project reference. No credentials,
database settings, records, RLS policies, or production environment variables
were changed. Do not treat passing intercepted form tests as live delivery
verification, or reconnect the site to an unrelated accessible project.

Evidence from this session is retained at `/tmp/alivio-live-mobile.json`,
`/tmp/alivio-secondary-audit.jsonl`, `/tmp/alivio-supabase-dns.json`,
`/tmp/alivio-secondary-before.log` and `/tmp/alivio-secondary-after.log`.
