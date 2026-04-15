/*
  # Add onboarding wizard fields

  ## Summary
  Adds completion tracking to organizations and onboarding-specific attributes to roles.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'onboarding_complete'
  ) THEN
    ALTER TABLE public.organizations
      ADD COLUMN onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'care_setting'
  ) THEN
    ALTER TABLE public.roles
      ADD COLUMN care_setting TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'required_credentials'
  ) THEN
    ALTER TABLE public.roles
      ADD COLUMN required_credentials TEXT[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'onboarding_urgency'
  ) THEN
    ALTER TABLE public.roles
      ADD COLUMN onboarding_urgency TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'onboarding_outreach_style'
  ) THEN
    ALTER TABLE public.roles
      ADD COLUMN onboarding_outreach_style TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'onboarding_notify_email'
  ) THEN
    ALTER TABLE public.roles
      ADD COLUMN onboarding_notify_email TEXT;
  END IF;
END $$;
