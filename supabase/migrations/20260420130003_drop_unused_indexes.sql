-- drop_unused_indexes
-- Dropping indexes identified as unused by production index telemetry.
DROP INDEX IF EXISTS public.idx_voice_calls_candidate_id;
DROP INDEX IF EXISTS public.idx_voice_transcripts_call_id;
DROP INDEX IF EXISTS public.idx_agent_activity_log_candidate_id;
DROP INDEX IF EXISTS public.idx_agent_activity_log_role_id;
DROP INDEX IF EXISTS public.idx_candidate_feedback_candidate_id;
DROP INDEX IF EXISTS public.idx_candidate_feedback_org_id;
DROP INDEX IF EXISTS public.idx_candidate_feedback_user_id;
DROP INDEX IF EXISTS public.idx_users_org_id;
DROP INDEX IF EXISTS public.idx_roles_org_id;
