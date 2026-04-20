-- Settings page org admin features:
-- - organizations profile fields and logo storage
-- - users soft deactivate support
-- - integration waitlist table + RLS
-- - org-assets storage bucket policies

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'location'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN location TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN logo_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.integration_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  integration_key TEXT NOT NULL CHECK (integration_key IN ('linkedin', 'indeed', 'bullhorn', 'greenhouse', 'ats-generic')),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.integration_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org users can read integration waitlist" ON public.integration_waitlist;
CREATE POLICY "Org users can read integration waitlist"
  ON public.integration_waitlist FOR SELECT
  TO authenticated
  USING (org_id = (SELECT public.get_user_org_id()));

DROP POLICY IF EXISTS "Org admins can insert integration waitlist" ON public.integration_waitlist;
CREATE POLICY "Org admins can insert integration waitlist"
  ON public.integration_waitlist FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id = (SELECT public.get_user_org_id())
    AND requested_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = (SELECT auth.uid())
        AND u.org_id = org_id
        AND u.role = 'admin'
        AND COALESCE(u.is_active, TRUE)
    )
  );

CREATE INDEX IF NOT EXISTS idx_integration_waitlist_org_created
  ON public.integration_waitlist(org_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('org-assets', 'org-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Org members can read org assets" ON storage.objects;
CREATE POLICY "Org members can read org assets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'org-assets'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Org admins can upload org assets" ON storage.objects;
CREATE POLICY "Org admins can upload org assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'org-assets'
    AND auth.role() = 'authenticated'
    AND split_part(name, '/', 1) = ((SELECT public.get_user_org_id())::text)
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = (SELECT auth.uid())
        AND u.org_id = (SELECT public.get_user_org_id())
        AND u.role = 'admin'
        AND COALESCE(u.is_active, TRUE)
    )
  );

DROP POLICY IF EXISTS "Org admins can update org assets" ON storage.objects;
CREATE POLICY "Org admins can update org assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'org-assets'
    AND split_part(name, '/', 1) = ((SELECT public.get_user_org_id())::text)
  )
  WITH CHECK (
    bucket_id = 'org-assets'
    AND split_part(name, '/', 1) = ((SELECT public.get_user_org_id())::text)
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = (SELECT auth.uid())
        AND u.org_id = (SELECT public.get_user_org_id())
        AND u.role = 'admin'
        AND COALESCE(u.is_active, TRUE)
    )
  );

DROP POLICY IF EXISTS "Org admins can delete org assets" ON storage.objects;
CREATE POLICY "Org admins can delete org assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'org-assets'
    AND split_part(name, '/', 1) = ((SELECT public.get_user_org_id())::text)
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = (SELECT auth.uid())
        AND u.org_id = (SELECT public.get_user_org_id())
        AND u.role = 'admin'
        AND COALESCE(u.is_active, TRUE)
    )
  );
