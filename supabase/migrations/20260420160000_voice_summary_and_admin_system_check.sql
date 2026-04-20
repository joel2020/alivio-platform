-- Cache AI-generated voice summaries on calls.
ALTER TABLE public.voice_calls
  ADD COLUMN IF NOT EXISTS ai_summary jsonb;

-- Platform-admin only system check snapshot used by /admin/system-check.
CREATE OR REPLACE FUNCTION public.get_admin_system_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  total_public_tables integer := 0;
  rls_enabled_tables integer := 0;
  all_rls_enabled boolean := false;
  auth_schema_present boolean := false;
  auth_users_table_present boolean := false;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT COUNT(*)
  INTO total_public_tables
  FROM pg_catalog.pg_tables
  WHERE schemaname = 'public';

  SELECT COUNT(*)
  INTO rls_enabled_tables
  FROM pg_catalog.pg_tables t
  JOIN pg_catalog.pg_class c ON c.relname = t.tablename
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE t.schemaname = 'public'
    AND n.nspname = 'public'
    AND c.relrowsecurity = true;

  all_rls_enabled := total_public_tables > 0 AND total_public_tables = rls_enabled_tables;

  SELECT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_namespace
    WHERE nspname = 'auth'
  ) INTO auth_schema_present;

  SELECT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'auth'
      AND tablename = 'users'
  ) INTO auth_users_table_present;

  RETURN jsonb_build_object(
    'database_connection', true,
    'rls', jsonb_build_object(
      'total_public_tables', total_public_tables,
      'rls_enabled_tables', rls_enabled_tables,
      'all_enabled', all_rls_enabled
    ),
    'auth', jsonb_build_object(
      'auth_schema_present', auth_schema_present,
      'auth_users_table_present', auth_users_table_present,
      'status', (auth_schema_present AND auth_users_table_present)
    ),
    'checked_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_system_check() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_system_check() TO authenticated;
