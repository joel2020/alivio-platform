BEGIN;

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  due_date DATE,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org JWT clients select" ON public.clients;
CREATE POLICY "Org JWT clients select"
  ON public.clients
  FOR SELECT TO authenticated
  USING (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT clients insert" ON public.clients;
CREATE POLICY "Org JWT clients insert"
  ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT clients update" ON public.clients;
CREATE POLICY "Org JWT clients update"
  ON public.clients
  FOR UPDATE TO authenticated
  USING (org_id::text = auth.jwt()->>'org_id')
  WITH CHECK (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT clients delete" ON public.clients;
CREATE POLICY "Org JWT clients delete"
  ON public.clients
  FOR DELETE TO authenticated
  USING (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT outreach_history select" ON public.outreach_history;
CREATE POLICY "Org JWT outreach_history select"
  ON public.outreach_history
  FOR SELECT TO authenticated
  USING (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT outreach_history insert" ON public.outreach_history;
CREATE POLICY "Org JWT outreach_history insert"
  ON public.outreach_history
  FOR INSERT TO authenticated
  WITH CHECK (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT outreach_history update" ON public.outreach_history;
CREATE POLICY "Org JWT outreach_history update"
  ON public.outreach_history
  FOR UPDATE TO authenticated
  USING (org_id::text = auth.jwt()->>'org_id')
  WITH CHECK (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT activity log select" ON public.agent_activity_log;
CREATE POLICY "Org JWT activity log select"
  ON public.agent_activity_log
  FOR SELECT TO authenticated
  USING (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT activity log insert" ON public.agent_activity_log;
CREATE POLICY "Org JWT activity log insert"
  ON public.agent_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT tasks select" ON public.tasks;
CREATE POLICY "Org JWT tasks select"
  ON public.tasks
  FOR SELECT TO authenticated
  USING (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT tasks insert" ON public.tasks;
CREATE POLICY "Org JWT tasks insert"
  ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT tasks update" ON public.tasks;
CREATE POLICY "Org JWT tasks update"
  ON public.tasks
  FOR UPDATE TO authenticated
  USING (org_id::text = auth.jwt()->>'org_id')
  WITH CHECK (org_id::text = auth.jwt()->>'org_id');

DROP POLICY IF EXISTS "Org JWT tasks delete" ON public.tasks;
CREATE POLICY "Org JWT tasks delete"
  ON public.tasks
  FOR DELETE TO authenticated
  USING (org_id::text = auth.jwt()->>'org_id');

CREATE INDEX IF NOT EXISTS idx_tasks_org_status_due ON public.tasks(org_id, status, due_date);

CREATE OR REPLACE FUNCTION public.tg_touch_tasks_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.tg_touch_tasks_updated_at();

CREATE OR REPLACE FUNCTION public.get_agent_activity_counts_by_agent()
RETURNS TABLE (agent_name TEXT, activity_count BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT aal.agent_name, COUNT(*)::bigint AS activity_count
  FROM public.agent_activity_log AS aal
  GROUP BY aal.agent_name
  ORDER BY COUNT(*) DESC, aal.agent_name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_agent_activity_counts_by_agent() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_auth_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  has_org_users_table BOOLEAN;
BEGIN
  SELECT to_regclass('public.org_users') IS NOT NULL INTO has_org_users_table;

  IF has_org_users_table THEN
    IF NOT EXISTS (
      SELECT 1 FROM org_users
      WHERE user_id = auth.uid()
      AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
    ) THEN
      RAISE EXCEPTION 'Access denied';
    END IF;
  END IF;

  RETURN QUERY
  SELECT u.id, u.email::text, u.created_at, u.last_sign_in_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_auth_users() TO authenticated;

INSERT INTO public.outreach_templates (org_id, name, subject, body, sequence_step)
SELECT o.id,
       'Cold Intro',
       'Cutting nurse hiring time at [Hospital]',
       'Hi [Name],\n\nI lead Alivio Search Partners. We help hospitals and health systems reduce time-to-fill for nursing roles with AI-powered healthcare recruiting workflows.\n\nIf helpful, I can share how teams are using automated sourcing + outreach to move faster without sacrificing quality.\n\nOpen to a 15-minute call next week? You can grab any time here: https://cal.com/alivio/intro\n\nBest,\nAlivio',
       1
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.outreach_templates t WHERE t.org_id = o.id AND t.sequence_step = 1
)
UNION ALL
SELECT o.id,
       'Follow Up',
       'The cost of one open nursing role: $52,000',
       'Hi [Name],\n\nFollowing up on my previous note. One open nursing role can cost health systems around $52,000 in vacancy-related impact, overtime, and throughput pressure.\n\nIf useful, I can share a concise walkthrough of how Alivio improves candidate flow and speeds hiring decisions.\n\nWould a short call be useful?\n\nBest,\nAlivio',
       2
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.outreach_templates t WHERE t.org_id = o.id AND t.sequence_step = 2
)
UNION ALL
SELECT o.id,
       'Breakup Email',
       'Last note from me, [Name]',
       'Hi [Name],\n\nI know timing is everything, so this will be my last note for now.\n\nIf reducing nurse hiring cycle time becomes a priority, I would be glad to reconnect and share ideas tailored to your team.\n\nThanks again, and wishing you a strong quarter.\n\nBest,\nAlivio',
       3
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.outreach_templates t WHERE t.org_id = o.id AND t.sequence_step = 3
);

COMMIT;
