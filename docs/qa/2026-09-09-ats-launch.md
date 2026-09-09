# Alivio ATS launch — September 9, 2026

Live workspace: https://aliviosearchpartners.com/applications
Administrator: joel@aliviosearchpartners.com

PR137 merged as 6e99ab1c7b497fc5725ef7a758f387c076d9981a. Production deployment dpl_5iHrbBBKbgMszHQR6CmEZVdx2N53 is ready. All three Supabase functions were deployed, the reviewed migration applied, and the chosen existing account granted access through the dedicated ATS administrator allowlist.

Verified live intake with a clearly synthetic PDF and five questionnaire answers. Two identical submissions returned one reference and one application. Resend accepted the acknowledgment and internal notification on their first attempts. The candidate test used Resend’s documented delivered test address: https://resend.com/docs/dashboard/emails/send-test-emails . Provider acceptance is verified; real-inbox delivery is not claimed.

Verified designated administrator access to the synthetic application and questionnaire; private signed résumé download succeeded and public download was denied. Anonymous application reads returned no records; unauthenticated recruiter, worker, and unsigned webhook calls were rejected. The synthetic application and résumé were removed afterward.

All 12 production browser checks passed. Candidate writes in the browser suite were intercepted; the separate direct API check above exercised real persistence and provider sending. Previously completed local verification: 83 browser tests, 21 server/database tests, typecheck, lint (one existing warning), build, and three Deno checks.

The email worker runs every minute as cron job 5, using the existing Vault secret. Cron execution succeeded and a direct request using the same Vault authorization returned HTTP200 with {"ok":true,"processed":0}. Historical applications were not sent acknowledgments.

The deployment tool recorded migration version20260909051734. Automatic approval review rejected rewriting production migration history; no history change occurred. The repository migration filename was aligned with the actual recorded deployment version, preserving production history and SQL content.

## Remaining configuration

- Scheduled candidate follow-ups are disabled until a receiving domain and signed incoming-reply webhook are configured and tested. Automatic acknowledgment and reviewed immediate recruiter emails are active.
- Public jobs currently enter the administrator inbox. Use “Connect public jobs to recruiting roles” in Applications to route them to specific internal roles/candidate pipelines where appropriate; no client/role ownership was guessed.
- One synthetic recruiter notification may be visible in the configured notification mailbox from release verification. Its matching test application has been removed.
