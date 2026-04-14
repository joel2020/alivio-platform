/*
  # Admin portal support

  - Adds an admin-check helper for platform-wide administration
  - Adds admin SELECT policies to key tables used by /admin
  - Creates outreach_history table for CRM/email history views
  - Adds secure RPC to read auth.users metadata for admin user management
*/

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((auth.jwt() ->> 'email') = 'joel@aliviosearchpartners.com', false);
$$;

GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

DROP POLICY IF EXISTS "Platform admin can view all organizations" ON public.organizations;
CREATE POLICY "Platform admin can view all organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admin can view all users" ON public.users;
CREATE POLICY "Platform admin can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admin can view all roles" ON public.roles;
CREATE POLICY "Platform admin can view all roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admin can view all candidates" ON public.candidates;
CREATE POLICY "Platform admin can view all candidates"
  ON public.candidates
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admin can view all activity logs" ON public.agent_activity_log;
CREATE POLICY "Platform admin can view all activity logs"
  ON public.agent_activity_log
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admin can manage blog posts" ON public.blog_posts;
CREATE POLICY "Platform admin can manage blog posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE TABLE IF NOT EXISTS public.outreach_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id),
  candidate_id UUID REFERENCES public.candidates(id),
  role_id UUID REFERENCES public.roles(id),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.outreach_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view outreach history" ON public.outreach_history;
CREATE POLICY "Org members can view outreach history"
  ON public.outreach_history
  FOR SELECT
  TO authenticated
  USING (org_id = public.get_user_org_id());

DROP POLICY IF EXISTS "Platform admin can view outreach history" ON public.outreach_history;
CREATE POLICY "Platform admin can view outreach history"
  ON public.outreach_history
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admin can manage outreach history" ON public.outreach_history;
CREATE POLICY "Platform admin can manage outreach history"
  ON public.outreach_history
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE INDEX IF NOT EXISTS idx_outreach_history_org_id ON public.outreach_history (org_id);
CREATE INDEX IF NOT EXISTS idx_outreach_history_sent_at ON public.outreach_history (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_history_status ON public.outreach_history (status);

CREATE OR REPLACE FUNCTION public.get_admin_auth_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT u.id, u.email, u.created_at, u.last_sign_in_at
  FROM auth.users u
  WHERE public.is_platform_admin()
  ORDER BY u.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_auth_users() TO authenticated;
