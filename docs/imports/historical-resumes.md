# Historical résumé import

Authenticated active owners, admins, and editors can import reviewed PDF/DOCX résumés into their own organization's Applications inbox. The server verifies the file checksum and private storage object before committing a record. Each distinct file version gets one record; retries merge source occurrences without creating another record. These records do not imply unique people.

Import metadata contains candidate name, optional email, original and upload checksums, source emails/Drive links, review notes, and review flags. Uncertain identity/email and unsupported files remain held for review. Missing emails stay null and flagged. No job, role, candidate pipeline match, questionnaire, or consent is synthesized.

The separate authenticated function does not call public submission or the email worker. Imported records have messaging permanently stopped, enforced by a row constraint and an outbox trigger covering every message kind. Existing server-side credentials remain inside the established backend; no broad credential is retrieved.

Use the historical import panel in Applications to select reviewed-import.json and matching résumé files. Review its ready/held/missing counts, then import. Save the result journal: it distinguishes newly imported records, existing records, held files, and failures. Retry interrupted batches safely. Source URLs and checksum metadata remain visible in each record.

## Release verification — 2026-09-10

Production deployment: https://alivio-platform-p50dp6xse-joel-carias-projects.vercel.app (promoted to aliviosearchpartners.com).

Supabase migration `20260910230212_historical_resume_import` is applied. `import-historical-resume` version 1 requires platform JWT verification and verifies the current user again before selecting the organization. `candidate-applications` version 2 preserves its existing in-handler authentication and adds bounded pagination.

Validation: TypeScript and Deno checks, production build, nine shared validation/workflow tests, two PostgreSQL integration tests, and three browser tests passed. Browser tests intercept every backend write and use synthetic data. They cover the held-file preview, actual multipart request, source visibility, disabled messaging, accessibility, and mobile width. PostgreSQL tests also run the existing public application/email workflow with the new migration installed.

Production readback: historical import count 0; historical outbox count 0; anonymous and authenticated direct import RPC access both denied; outbox guard enabled. Actual authenticated uploads remain pending the user's ATS sign-in. No production test candidate was created.

Security advisor reports no finding on the new import functions. Existing findings concern legacy helpers, intentional service-only tables, existing auth helpers, and password protection. These were not changed by this release. References: [database security advisor](https://supabase.com/docs/guides/database/database-linter), [function authentication](https://supabase.com/docs/guides/functions/auth-headers).
