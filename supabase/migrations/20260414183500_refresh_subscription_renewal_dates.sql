DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'subscription_renews_at'
  ) THEN
    EXECUTE $sql$
      UPDATE organizations
      SET subscription_renews_at = NOW() + INTERVAL '1 year'
      WHERE subscription_renews_at < NOW()
    $sql$;
  END IF;
END;
$$;
