/*
  # Fix create_organization_and_user RLS permissions

  ## Problem
  The `create_organization_and_user` RPC is called during signup to create the
  initial organization and user record. However, RLS is enabled on both
  `organizations` and `users` tables with no INSERT policies defined.
  This caused the function to silently fail with an RLS violation.

  ## Fix
  Recreate the function with SECURITY DEFINER so it runs as the database owner,
  bypassing RLS for the initial bootstrap insert. The function is still restricted
  to authenticated callers via the GRANT below.
*/

CREATE OR REPLACE FUNCTION create_organization_and_user(
  org_name TEXT,
  org_size TEXT,
  org_industry TEXT,
  user_id UUID,
  user_full_name TEXT,
  user_email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  INSERT INTO organizations (name, size, industry)
  VALUES (org_name, org_size, org_industry)
  RETURNING id INTO new_org_id;

  INSERT INTO users (id, org_id, full_name, email, role)
  VALUES (user_id, new_org_id, user_full_name, user_email, 'admin')
  ON CONFLICT (id) DO UPDATE
    SET org_id = new_org_id,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = 'admin';

  RETURN new_org_id;
END;
$$;

REVOKE ALL ON FUNCTION create_organization_and_user(TEXT, TEXT, TEXT, UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_organization_and_user(TEXT, TEXT, TEXT, UUID, TEXT, TEXT) TO authenticated;
