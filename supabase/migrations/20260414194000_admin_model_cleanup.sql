/*
  Admin model cleanup:
  - adds explicit users.is_platform_admin flag
  - updates is_platform_admin() to use the explicit flag
  - aligns users.role constraint with frontend type usage (owner/admin/editor/viewer)
*/

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check CHECK (role IN ('owner', 'admin', 'editor', 'viewer'));

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.is_platform_admin = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;
