-- fix_org_users_security_definer
-- Recreate org_users as a normal invoker-secured view so caller RLS applies.
DO $$
DECLARE
  view_sql text;
BEGIN
  SELECT pg_get_viewdef('public.org_users'::regclass, true)
  INTO view_sql;

  IF view_sql IS NULL THEN
    RAISE EXCEPTION 'View public.org_users does not exist';
  END IF;

  EXECUTE 'DROP VIEW public.org_users';
  EXECUTE format('CREATE VIEW public.org_users AS %s', view_sql);
  EXECUTE 'ALTER VIEW public.org_users SET (security_invoker = true)';
END;
$$;
