/*
  # Fix Indexes, RLS Performance, and Function Security

  ## Summary
  Addresses all reported security and performance advisories:

  1. Unindexed Foreign Keys
     - Adds covering indexes on org_id, user_id, candidate_id, and call_id
       foreign key columns across agent_activity_log, candidate_feedback,
       roles, users, voice_calls, and voice_transcripts tables.

  2. Auth RLS Initialization Plan
     - Wraps auth.uid() calls in (select auth.uid()) on organizations and users
       policies so Postgres evaluates the function once per query instead of
       once per row, significantly improving RLS performance at scale.

  3. Multiple Permissive Policies
     - Consolidates the two SELECT policies on users ("Users can read own record"
       and "Users can read org members") into a single policy to eliminate the
       multiple-permissive-policy overhead.

  4. Function Search Path Mutable
     - Pins the search_path on get_user_org_id() to 'public' to prevent search
       path injection attacks.

  5. Unused Indexes
     - Drops indexes that have no recorded usage, reducing write overhead.
*/

-- ─────────────────────────────────────────────
-- 1. Add missing foreign key covering indexes
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_agent_activity_log_org_id
  ON public.agent_activity_log (org_id);

CREATE INDEX IF NOT EXISTS idx_candidate_feedback_candidate_id
  ON public.candidate_feedback (candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_feedback_org_id
  ON public.candidate_feedback (org_id);

CREATE INDEX IF NOT EXISTS idx_candidate_feedback_user_id
  ON public.candidate_feedback (user_id);

CREATE INDEX IF NOT EXISTS idx_roles_org_id
  ON public.roles (org_id);

CREATE INDEX IF NOT EXISTS idx_users_org_id
  ON public.users (org_id);

CREATE INDEX IF NOT EXISTS idx_voice_calls_org_id
  ON public.voice_calls (org_id);

CREATE INDEX IF NOT EXISTS idx_voice_transcripts_call_id
  ON public.voice_transcripts (call_id);

-- ─────────────────────────────────────────────
-- 2. Fix function search path
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid();
$$;

-- ─────────────────────────────────────────────
-- 3. Fix organizations RLS policies
--    Wrap auth calls in (select ...) for one-time evaluation
-- ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can read own org" ON public.organizations;
DROP POLICY IF EXISTS "Users can update own org" ON public.organizations;

CREATE POLICY "Users can read own org"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id = (SELECT get_user_org_id()));

CREATE POLICY "Users can update own org"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (id = (SELECT get_user_org_id()))
  WITH CHECK (id = (SELECT get_user_org_id()));

-- ─────────────────────────────────────────────
-- 4. Fix users RLS policies
--    Wrap auth.uid() and consolidate duplicate SELECT policies
-- ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Users can read org members" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

CREATE POLICY "Users can read own org members"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR org_id = (SELECT get_user_org_id())
  );

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ─────────────────────────────────────────────
-- 5. Drop unused indexes
-- ─────────────────────────────────────────────

DROP INDEX IF EXISTS public.idx_candidates_role;
DROP INDEX IF EXISTS public.idx_candidates_stage;
DROP INDEX IF EXISTS public.idx_candidates_score;
DROP INDEX IF EXISTS public.idx_voice_calls_candidate;
DROP INDEX IF EXISTS public.idx_voice_calls_role;
DROP INDEX IF EXISTS public.idx_voice_calls_qualification;
DROP INDEX IF EXISTS public.idx_agent_log_role;
DROP INDEX IF EXISTS public.idx_agent_log_candidate;
