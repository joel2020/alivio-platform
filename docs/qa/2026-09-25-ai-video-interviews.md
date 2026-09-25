# Candidate AI assessment and video interviews — implementation handoff

Status: implemented and tested locally, **not activated in production**. Production Supabase project is `ovxttubotjebnaoedllu`. The connected Supabase account only exposes another project's database, so no production migration, function deployment, real candidate assessment, recording, or invitation was attempted. Do not deploy this feature to that other project.

## Product flow

The existing `ats_submit` transaction already queues a deduplicated thank-you email. Keep that path. A new insert trigger queues assessment only for new applications with a résumé. The privileged existing email worker processes the AI queue after email delivery, with a feature flag and bounded leases/retries. Azure OpenAI evaluates an immutable job snapshot against extracted PDF/DOCX text. A cached, job-specific rubric and exact evidence validation support a score out of ten. Unreadable files or unsuccessful AI processing receive manual review, never invented scores or automatic rejection.

The Applications workspace can filter recommendations at 8/10 or above. Recruiters review evidence, the original résumé, and the eight proposed questions. A documented human approval is required before the existing outbox sends an interview invitation. A human can override a lower score. Approval does not change the candidate's hiring status.

The public `/client/interview` page is already covered by the marketing site's `/client` proxy. The private link uses a 256-bit token in a URL fragment, removed from the address bar and retained only in session storage. SQL stores the token hash; the access-controlled outbox necessarily contains the invitation. Links expire after seven days. Candidate consent precedes recording. This implementation provides **structured, one-way video answers to AI-generated questions read aloud by the browser**, not a live avatar or unrestricted conversational agent.

Eight answers have three-minute recording limits and a single server-recorded 30-minute deadline. Reloads preserve the deadline. Each private answer upload is reserved before recording, capped at 15 MB, verified before progress advances, and can be retried or recovered. An upload started before the cutoff has five minutes to finish; no new answers can start afterward. Camera/microphone tracks stop at the cutoff or on exit. Browser support requires MediaRecorder and camera/microphone permission; questions remain visible if synthetic speech is unavailable. Human-interview requests are equally visible and do not penalize the candidate.

Recordings expire after 30 days. The existing scheduled worker deletes expired recordings and queues object deletion if an application is removed. Anonymous and ordinary authenticated clients cannot read the review tables or recording bucket. Recruiters receive short-lived signed recording URLs only after tenant authorization. Messages are rechecked for opt-out, withdrawal, expired invitations, and human-interview requests before sending.

## Verification

- Local PostgreSQL integration: original ATS transaction/delivery/RLS tests; new migration, new-only queuing, deduplication, cross-tenant denial, explicit approval, immutable deadline, expired sessions, private storage, invitation cancellation and deletion cleanup.
- Node tests: original application validation, delivery retries and signed webhooks; score calculation and rejection of invalid/hallucinated AI evidence.
- Deno: actual PDF and DOCX extraction, malformed/empty/oversized documents; API authentication, consent, storage verification, approval identity and recovery of uncertain uploads. All provider requests in API tests are intercepted.
- Browser: original nine ATS/application checks plus five interview checks covering mobile axe/overflow, human alternative, real synthetic camera recording/upload, reload, deadline camera/microphone shutdown and human approval.
- Frontend typecheck, ESLint and production build; Deno checks for all three affected functions. ESLint has one existing Fast Refresh warning in SeoRecoveryPage.tsx, no new errors.
- Claude review was attempted but its OAuth session had expired. Direct security and complexity review completed; an invitation-confirmation UI issue and pre-send withdrawal check were fixed and retested.

No real applicant data or live recipient addresses were used. Local tests do not establish Azure model quality, production inbox delivery, or deployed operation. A synthetic staging/end-to-end check is required before activation.

## Release sequence after account access is restored

1. Verify the account can administer **ovxttubotjebnaoedllu**, and compare its active schema/functions with this source. Keep `APPLICATION_AI_INTERVIEWS_ENABLED` unset/false initially. Existing Azure OpenAI and Resend configuration are reused; do not provision substitute credentials or another project's database.
2. Apply only `20260925182949_candidate_ai_interviews.sql` after checking migration history. Do not bulk-push unrelated historical migrations or rewrite their recorded versions.
3. Deploy `candidate-interviews` with JWT gateway verification disabled: it handles recruiter JWT verification and candidate bearer-link authorization itself. Deploy updated `candidate-applications` and privileged `application-messages` with their existing deployment settings. Preserve the once-per-minute email worker schedule and scheduler secret.
4. Stage/build the `alivio-platform` frontend and verify `/client/interview` and authenticated `/applications`. The website's proxy uses the stable `alivio-platform-joel-carias-projects.vercel.app` alias; preserve it and the protected proxy configuration.
5. In a test environment, enable `APPLICATION_AI_INTERVIEWS_ENABLED=true`, submit a synthetic résumé against a synthetic, detailed job, verify one acknowledgement and one assessment, review the rubric/score/questions manually, approve once, verify one invitation, complete/reload the interview, and verify private playback and expiry. Use provider test mailboxes, never actual applicants for QA.
6. Validate the real Azure deployment's responses against the schema and a representative set of job/resume examples with human reviewers. Confirm candidate disclosures and the human-interview process are operational. Only then promote the tested frontend and enable processing for production applications. Watch the outbox and manual-review queue; failed scoring must not block application receipt or acknowledgement.

Rollback: disable `APPLICATION_AI_INTERVIEWS_ENABLED` to stop new assessments/invitations while leaving existing consented sessions available. Keep the additive tables, private recordings and cleanup worker. Do not roll back or destroy existing applications/outbox messages.

## Local commands

```sh
npm ci
npm run typecheck
npm run lint
npm run build
node --import tsx --test tests/server/application-workflow.test.ts tests/server/interview-assessment.test.ts
ATS_PGLITE_MODULE=/path/to/@electric-sql/pglite/dist/index.js node --test tests/server/application-database.test.mjs tests/server/interview-database.test.mjs
npx deno check --node-modules-dir=none supabase/functions/candidate-interviews/index.ts supabase/functions/application-messages/index.ts supabase/functions/candidate-applications/index.ts
npx deno test --node-modules-dir=none --allow-env --allow-read tests/server/interview-resume.test.ts tests/server/interview-api.test.ts
# Start Vite on 127.0.0.1:4173 with this project's public Supabase configuration, then:
npx playwright test tests/marketing/ai-interview.spec.ts tests/marketing/ai-interview-admin.spec.ts tests/marketing/ats-workspace.spec.ts tests/marketing/candidate-application.spec.ts
```

The two new edge-only parser imports are pinned (`unpdf@1.8.1`, `fflate@0.8.3`) and captured in deno.lock. They avoid a custom PDF parser and full document rendering; no new frontend dependency, video provider, email provider, or scheduler was introduced.
