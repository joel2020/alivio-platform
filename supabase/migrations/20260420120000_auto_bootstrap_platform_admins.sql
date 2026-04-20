BEGIN;

CREATE OR REPLACE FUNCTION public.apply_platform_admin_bootstrap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  configured_emails text;
  normalized_emails text[];
  candidate_email text;
BEGIN
  IF NEW.is_platform_admin THEN
    RETURN NEW;
  END IF;

  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  configured_emails := current_setting('app.settings.platform_admin_emails', true);

  IF configured_emails IS NULL OR btrim(configured_emails) = '' THEN
    RETURN NEW;
  END IF;

  normalized_emails := regexp_split_to_array(lower(configured_emails), '\\s*,\\s*');
  candidate_email := lower(btrim(NEW.email));

  IF candidate_email = ANY(normalized_emails) THEN
    NEW.is_platform_admin := true;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_platform_admin_bootstrap ON public.users;

CREATE TRIGGER trg_apply_platform_admin_bootstrap
BEFORE INSERT OR UPDATE OF email ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.apply_platform_admin_bootstrap();

UPDATE public.users u
SET is_platform_admin = true
WHERE u.is_platform_admin = false
  AND lower(u.email) = ANY(
    regexp_split_to_array(
      lower(coalesce(current_setting('app.settings.platform_admin_emails', true), '')),
      '\\s*,\\s*'
    )
  );

COMMIT;
