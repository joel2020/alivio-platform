# FINAL-BLOCKERS (Must resolve before launch)

1. **Non-uniform edge-function auth model (security blocker).**
   - System: Supabase edge functions.
   - Why blocker: some ingestion/scheduler endpoints still accept calls without user-level auth checks and rely on implicit trust.
   - Action: standardize invoker authentication/authorization for all publicly reachable functions.
   - Owner: backend + devops.

2. **Incomplete operational env contract (deployment blocker).**
   - System: deployment configuration.
   - Why blocker: `.env.example` does not enumerate required backend/runtime secrets, preventing reliable reproducible deploy.
   - Action: expand env template + document required values and ownership.
   - Owner: devops.

3. **Health endpoint coverage incomplete (operability blocker).**
   - System: runtime health checks.
   - Why blocker: current health check focuses on AI providers, not full critical path dependencies.
   - Action: add/extend health probe(s) for DB connectivity, email pipeline readiness, and scheduler health.
   - Owner: backend/devops.

4. **Inbound email hardening not fully verified end-to-end (demo risk if inbound chosen).**
   - System: `fetch-emails` / `email-pipeline` / `ai-parse-email-resume` path.
   - Why blocker: real IMAP + scheduler + Resend behavior cannot be proven in repo-only pass.
   - Action: run smoke tests in staging with real credentials and malformed/duplicate fixtures.
   - Owner: backend/ops.
