CREATE OR REPLACE FUNCTION public.get_admin_auth_users()
RETURNS TABLE(
  id uuid, 
  email text, 
  created_at timestamptz, 
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS 
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = 'joel@aliviosearchpartners.com'
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$
;

GRANT EXECUTE ON FUNCTION public.get_admin_auth_users() 
TO authenticated;
