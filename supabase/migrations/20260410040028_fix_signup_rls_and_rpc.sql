/*
  # Fix Signup RLS and Add Organization Creation RPC

  1. Creates a SECURITY DEFINER function to handle org + user creation in one
     transaction, bypassing RLS during signup when no org_id exists yet.

  2. Drops conflicting SELECT policies on organizations and users and recreates
     them using the subquery pattern that works correctly.

  3. All other table policies already use get_user_org_id() which queries the
     users table — these remain unchanged.
*/

CREATE OR REPLACE FUNCTION create_organization_and_user(
    org_name TEXT,
    org_size TEXT,
    org_industry TEXT,
    user_id UUID,
    user_full_name TEXT,
    user_email TEXT
) RETURNS UUID
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
    VALUES (user_id, new_org_id, user_full_name, user_email, 'admin');

    RETURN new_org_id;
END;
$$;

DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Organizations can be inserted" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view own user record" ON users;
DROP POLICY IF EXISTS "Users can insert own user record" ON users;
DROP POLICY IF EXISTS "Users can update own user record" ON users;

CREATE POLICY "Users can read own org"
    ON organizations FOR SELECT
    TO authenticated
    USING (id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update own org"
    ON organizations FOR UPDATE
    TO authenticated
    USING (id IN (SELECT org_id FROM users WHERE id = auth.uid()))
    WITH CHECK (id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can read own record"
    ON users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can read org members"
    ON users FOR SELECT
    TO authenticated
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update own record"
    ON users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
