-- fix_get_org_stats_search_path
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_org_stats'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', fn.signature);
  END LOOP;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Function public.get_org_stats does not exist';
  END IF;
END;
$$;
