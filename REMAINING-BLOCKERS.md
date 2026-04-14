# REMAINING-BLOCKERS

## OPEN
1. **Inbound email flow still assumes trusted invoker on several edge functions.**
   - Functions like `fetch-emails`, `email-pipeline`, `ai-process-email`, and `ai-parse-email-resume` do not currently enforce end-user JWT auth and rely on service-role scheduler context.
2. **`.env.example` incomplete for production reproducibility.**
   - Missing server/runtime variables required for email + scheduler flows.
3. **Health endpoint exists as AI-provider status only.**
   - Current `ai-status` endpoint reports AI provider health; does not represent full platform dependencies (DB, email pipeline, queue/scheduler).

## MITIGATED THIS PASS
1. Admin route frontend email check replaced with server-side `is_platform_admin` RPC.
2. Demo-path AI edge functions now reject unauthenticated requests (401) by validating bearer JWT.
3. Demo-path UI pages now include explicit error/unauthorized states to prevent blank/infinite-loading behavior.
