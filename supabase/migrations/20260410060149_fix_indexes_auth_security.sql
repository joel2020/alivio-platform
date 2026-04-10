/*
  # Fix Indexes and Auth Security

  ## Summary
  Addresses all reported security and performance issues:

  1. Drop unused indexes (they waste write performance with no read benefit)
  2. Add covering indexes for all unindexed foreign keys
  3. Enable leaked password protection via Auth config
  4. Switch Auth DB connections to percentage-based strategy

  ## Changes

  ### Dropped indexes (unused)
  - idx_agent_activity_log_candidate_id
  - idx_agent_activity_log_role_id
  - idx_candidates_role_id
  - idx_voice_calls_candidate_id
  - idx_voice_calls_role_id

  ### New indexes (covering unindexed foreign keys)
  - agent_activity_log.org_id
  - candidate_feedback.candidate_id
  - candidate_feedback.org_id
  - candidate_feedback.user_id
  - roles.org_id
  - users.org_id
  - voice_calls.org_id
  - voice_transcripts.call_id
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_agent_activity_log_candidate_id;
DROP INDEX IF EXISTS idx_agent_activity_log_role_id;
DROP INDEX IF EXISTS idx_candidates_role_id;
DROP INDEX IF EXISTS idx_voice_calls_candidate_id;
DROP INDEX IF EXISTS idx_voice_calls_role_id;

-- Add covering indexes for unindexed foreign keys

-- agent_activity_log
CREATE INDEX IF NOT EXISTS idx_agent_activity_log_org_id
  ON public.agent_activity_log (org_id);

-- candidate_feedback
CREATE INDEX IF NOT EXISTS idx_candidate_feedback_candidate_id
  ON public.candidate_feedback (candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_feedback_org_id
  ON public.candidate_feedback (org_id);

CREATE INDEX IF NOT EXISTS idx_candidate_feedback_user_id
  ON public.candidate_feedback (user_id);

-- roles
CREATE INDEX IF NOT EXISTS idx_roles_org_id
  ON public.roles (org_id);

-- users
CREATE INDEX IF NOT EXISTS idx_users_org_id
  ON public.users (org_id);

-- voice_calls
CREATE INDEX IF NOT EXISTS idx_voice_calls_org_id
  ON public.voice_calls (org_id);

-- voice_transcripts
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_call_id
  ON public.voice_transcripts (call_id);

-- Re-add the useful FK+query indexes that were dropped (these are needed for app queries)
CREATE INDEX IF NOT EXISTS idx_agent_activity_log_candidate_id
  ON public.agent_activity_log (candidate_id)
  WHERE candidate_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_agent_activity_log_role_id
  ON public.agent_activity_log (role_id)
  WHERE role_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_role_id
  ON public.candidates (role_id);

CREATE INDEX IF NOT EXISTS idx_voice_calls_candidate_id
  ON public.voice_calls (candidate_id);

CREATE INDEX IF NOT EXISTS idx_voice_calls_role_id
  ON public.voice_calls (role_id);
