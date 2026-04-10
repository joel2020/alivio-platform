/*
  # Fix Remaining Unindexed Foreign Keys and Drop Unused Indexes

  ## Summary

  1. New FK Covering Indexes
     - agent_activity_log(candidate_id) — supports lookups by candidate
     - agent_activity_log(role_id) — supports lookups by role
     - candidates(role_id) — supports pipeline queries filtered by role
     - voice_calls(candidate_id) — supports call history lookups
     - voice_calls(role_id) — supports role-level call aggregations

  2. Drop Unused Indexes
     - Removes 8 indexes with no recorded usage to reduce write overhead
       on INSERT/UPDATE operations across agent_activity_log,
       candidate_feedback, roles, users, voice_calls, and voice_transcripts.

  Important Notes
     - Auth DB Connection Strategy and Leaked Password Protection require
       changes in the Supabase dashboard and cannot be resolved via migration.
*/

-- ─────────────────────────────────────────────
-- 1. Add missing FK covering indexes
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_agent_activity_log_candidate_id
  ON public.agent_activity_log (candidate_id);

CREATE INDEX IF NOT EXISTS idx_agent_activity_log_role_id
  ON public.agent_activity_log (role_id);

CREATE INDEX IF NOT EXISTS idx_candidates_role_id
  ON public.candidates (role_id);

CREATE INDEX IF NOT EXISTS idx_voice_calls_candidate_id
  ON public.voice_calls (candidate_id);

CREATE INDEX IF NOT EXISTS idx_voice_calls_role_id
  ON public.voice_calls (role_id);

-- ─────────────────────────────────────────────
-- 2. Drop unused indexes
-- ─────────────────────────────────────────────

DROP INDEX IF EXISTS public.idx_agent_activity_log_org_id;
DROP INDEX IF EXISTS public.idx_candidate_feedback_candidate_id;
DROP INDEX IF EXISTS public.idx_candidate_feedback_org_id;
DROP INDEX IF EXISTS public.idx_candidate_feedback_user_id;
DROP INDEX IF EXISTS public.idx_roles_org_id;
DROP INDEX IF EXISTS public.idx_users_org_id;
DROP INDEX IF EXISTS public.idx_voice_calls_org_id;
DROP INDEX IF EXISTS public.idx_voice_transcripts_call_id;
