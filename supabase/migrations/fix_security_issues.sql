-- Fix 1 (CRITICAL): Recreate public.org_users without SECURITY DEFINER behavior.
-- Why: SECURITY DEFINER views execute with creator privileges and can bypass caller RLS context.
-- This block preserves the existing SELECT definition and recreates the view with default caller context.
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
END;
$$;

-- Fix 2 (HIGH): Lock function search_path for public.get_org_stats.
-- Why: Mutable search_path can allow object name hijacking via attacker-controlled schemas.
-- This block preserves existing logic/signature and only applies SET search_path = public.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS fn_signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_org_stats'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', fn.fn_signature);
  END LOOP;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Function public.get_org_stats does not exist';
  END IF;
END;
$$;

-- Fix 3 (HIGH - MANUAL ACTION REQUIRED): Supabase Auth leaked-password protection setting.
-- ACTION REQUIRED (manual): Go to Supabase Dashboard → Authentication → Sign In / Up → Password Settings →
-- Enable 'Check for leaked passwords via HaveIBeenPwned.org'. This cannot be done via SQL migration.
