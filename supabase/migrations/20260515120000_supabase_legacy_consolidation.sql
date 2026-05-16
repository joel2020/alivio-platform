/*
  # Supabase legacy consolidation support

  Adds the production match table used by the app and a guarded legacy_import
  consolidation runner for moving already-exported legacy payloads into the
  Alivio-OS public schema.
*/

CREATE TABLE IF NOT EXISTS public.candidate_role_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'matched' CHECK (status IN ('matched', 'shortlisted', 'submitted', 'interview', 'offer', 'hired', 'rejected', 'archived')),
  reasons TEXT[] NOT NULL DEFAULT '{}',
  risks TEXT[] NOT NULL DEFAULT '{}',
  next_step TEXT,
  submitted_at TIMESTAMPTZ,
  legacy_source_project_ref TEXT,
  legacy_application_id TEXT,
  legacy_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, candidate_id, role_id, legacy_source_project_ref, legacy_application_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_role_matches_role ON public.candidate_role_matches(role_id);
CREATE INDEX IF NOT EXISTS idx_candidate_role_matches_candidate ON public.candidate_role_matches(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_role_matches_org ON public.candidate_role_matches(org_id);
CREATE INDEX IF NOT EXISTS idx_candidate_role_matches_score ON public.candidate_role_matches(match_score DESC);

ALTER TABLE public.candidate_role_matches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'candidate_role_matches'
      AND policyname = 'Org members can view candidate role matches'
  ) THEN
    CREATE POLICY "Org members can view candidate role matches"
      ON public.candidate_role_matches FOR SELECT
      TO authenticated
      USING (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'candidate_role_matches'
      AND policyname = 'Org members can insert candidate role matches'
  ) THEN
    CREATE POLICY "Org members can insert candidate role matches"
      ON public.candidate_role_matches FOR INSERT
      TO authenticated
      WITH CHECK (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'candidate_role_matches'
      AND policyname = 'Org members can update candidate role matches'
  ) THEN
    CREATE POLICY "Org members can update candidate role matches"
      ON public.candidate_role_matches FOR UPDATE
      TO authenticated
      USING (org_id = public.get_user_org_id())
      WITH CHECK (org_id = public.get_user_org_id());
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS legacy_import;

CREATE TABLE IF NOT EXISTS legacy_import.alivio_os_id_map (
  source_project_ref TEXT NOT NULL,
  legacy_table TEXT NOT NULL,
  legacy_id TEXT NOT NULL,
  public_table TEXT NOT NULL,
  public_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (source_project_ref, legacy_table, legacy_id, public_table)
);

CREATE OR REPLACE FUNCTION legacy_import.import_payload_rows(import_table REGCLASS, legacy_table_name TEXT)
RETURNS TABLE(source_project_ref TEXT, legacy_table TEXT, legacy_id TEXT, payload JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = legacy_import, public, pg_temp
AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT source_project_ref::text,
            COALESCE(legacy_table::text, %L) AS legacy_table,
            legacy_id::text,
            COALESCE(payload, raw_record, to_jsonb(t) - ARRAY[''payload'', ''raw_record'']) AS payload
       FROM %s AS t',
    legacy_table_name,
    import_table
  );
END;
$$;

CREATE OR REPLACE FUNCTION legacy_import.text_array_from_json(value JSONB)
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN value IS NULL THEN ARRAY[]::TEXT[]
    WHEN jsonb_typeof(value) = 'array' THEN COALESCE((SELECT array_agg(item) FROM jsonb_array_elements_text(value) AS item), ARRAY[]::TEXT[])
    WHEN jsonb_typeof(value) = 'string' THEN ARRAY[value #>> '{}']
    ELSE ARRAY[]::TEXT[]
  END;
$$;

CREATE OR REPLACE FUNCTION legacy_import.clean_legacy_payload(payload JSONB)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(payload, '{}'::JSONB)
    - 'instantly_api_key'
    - 'instantlyApiKey'
    - 'instantly_token'
    - 'instantlyToken'
    - 'api_key'
    - 'apiKey';
$$;

CREATE OR REPLACE FUNCTION legacy_import.apply_alivio_os_consolidation(target_org_id UUID)
RETURNS TABLE(entity TEXT, inserted_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = legacy_import, public, pg_temp
AS $$
DECLARE
  import_jobs_table REGCLASS := to_regclass('legacy_import.import_jobs');
  import_candidates_table REGCLASS := to_regclass('legacy_import.import_candidates');
  import_applications_table REGCLASS := to_regclass('legacy_import.import_applications');
  import_website_applications_table REGCLASS := to_regclass('legacy_import.import_website_applications');
BEGIN
  IF target_org_id IS NULL THEN
    RAISE EXCEPTION 'target_org_id is required';
  END IF;

  CREATE TEMP TABLE _legacy_rows (
    source_project_ref TEXT NOT NULL,
    legacy_table TEXT NOT NULL,
    legacy_id TEXT NOT NULL,
    payload JSONB NOT NULL
  ) ON COMMIT DROP;

  IF import_jobs_table IS NOT NULL THEN
    INSERT INTO _legacy_rows SELECT * FROM legacy_import.import_payload_rows(import_jobs_table, 'jobs');
  END IF;
  IF import_candidates_table IS NOT NULL THEN
    INSERT INTO _legacy_rows SELECT * FROM legacy_import.import_payload_rows(import_candidates_table, 'candidates');
  END IF;
  IF import_applications_table IS NOT NULL THEN
    INSERT INTO _legacy_rows SELECT * FROM legacy_import.import_payload_rows(import_applications_table, 'applications');
  END IF;
  IF import_website_applications_table IS NOT NULL THEN
    INSERT INTO _legacy_rows SELECT * FROM legacy_import.import_payload_rows(import_website_applications_table, 'website_applications');
  END IF;

  WITH inserted AS (
    INSERT INTO public.roles (
      org_id, title, location, remote, employment_type, experience_min, experience_max,
      must_have_requirements, nice_to_have_requirements, compensation_min, compensation_max,
      description, target_candidate_volume, outreach_tone, status, created_at, updated_at
    )
    SELECT
      target_org_id,
      COALESCE(payload->>'title', payload->>'name', payload->>'job_title', 'Legacy role') AS title,
      COALESCE(payload->>'location', payload->>'city', payload->>'work_location', 'Unknown') AS location,
      COALESCE((payload->>'remote')::BOOLEAN, lower(COALESCE(payload->>'location_type', '')) = 'remote', false) AS remote,
      CASE lower(COALESCE(payload->>'employment_type', payload->>'type', 'full-time'))
        WHEN 'part-time' THEN 'part-time'
        WHEN 'contract' THEN 'contract'
        WHEN 'freelance' THEN 'freelance'
        WHEN 'per-diem' THEN 'per-diem'
        ELSE 'full-time'
      END AS employment_type,
      COALESCE(NULLIF(payload->>'experience_min', '')::INTEGER, 0),
      COALESCE(NULLIF(payload->>'experience_max', '')::INTEGER, 20),
      legacy_import.text_array_from_json(COALESCE(payload->'must_have_requirements', payload->'requirements')),
      legacy_import.text_array_from_json(payload->'nice_to_have_requirements'),
      NULLIF(COALESCE(payload->>'compensation_min', payload->>'salary_min'), '')::INTEGER,
      NULLIF(COALESCE(payload->>'compensation_max', payload->>'salary_max'), '')::INTEGER,
      COALESCE(payload->>'description', payload->>'summary'),
      COALESCE(NULLIF(payload->>'target_candidate_volume', '')::INTEGER, 50),
      'conversational',
      CASE WHEN lower(COALESCE(payload->>'status', 'active')) IN ('active', 'paused', 'closed', 'draft') THEN lower(payload->>'status') ELSE 'active' END,
      COALESCE(NULLIF(payload->>'created_at', '')::TIMESTAMPTZ, NOW()),
      NOW()
    FROM _legacy_rows r
    WHERE legacy_table = 'jobs'
      AND NOT EXISTS (
        SELECT 1 FROM legacy_import.alivio_os_id_map m
        WHERE m.source_project_ref = r.source_project_ref
          AND m.legacy_table = r.legacy_table
          AND m.legacy_id = r.legacy_id
          AND m.public_table = 'roles'
      )
    RETURNING id
  )
  SELECT count(*) INTO inserted_count FROM inserted;
  entity := 'roles';
  RETURN NEXT;

  INSERT INTO legacy_import.alivio_os_id_map (source_project_ref, legacy_table, legacy_id, public_table, public_id)
  SELECT r.source_project_ref, r.legacy_table, r.legacy_id, 'roles', role_row.id
  FROM _legacy_rows r
  JOIN public.roles role_row
    ON role_row.org_id = target_org_id
   AND role_row.title = COALESCE(r.payload->>'title', r.payload->>'name', r.payload->>'job_title', 'Legacy role')
   AND role_row.created_at = COALESCE(NULLIF(r.payload->>'created_at', '')::TIMESTAMPTZ, role_row.created_at)
  WHERE r.legacy_table = 'jobs'
  ON CONFLICT DO NOTHING;

  WITH candidate_sources AS (
    SELECT
      r.source_project_ref,
      r.legacy_table,
      r.legacy_id,
      r.payload,
      COALESCE(r.payload->>'job_id', r.payload->>'role_id', r.payload->>'position_id') AS legacy_job_id
    FROM _legacy_rows r
    WHERE r.legacy_table IN ('candidates', 'website_applications')
  ), inserted AS (
    INSERT INTO public.candidates (
      org_id, role_id, full_name, email, phone, current_title, current_company,
      location, experience_years, skills, licenses, certifications, education,
      source, profile_data, score, pipeline_stage, created_at, updated_at
    )
    SELECT
      target_org_id,
      role_map.public_id,
      COALESCE(payload->>'full_name', payload->>'name', concat_ws(' ', payload->>'first_name', payload->>'last_name'), 'Legacy candidate'),
      NULLIF(payload->>'email', ''),
      NULLIF(payload->>'phone', ''),
      NULLIF(COALESCE(payload->>'current_title', payload->>'title'), ''),
      NULLIF(payload->>'current_company', ''),
      NULLIF(payload->>'location', ''),
      NULLIF(payload->>'experience_years', '')::INTEGER,
      legacy_import.text_array_from_json(payload->'skills'),
      legacy_import.text_array_from_json(payload->'licenses'),
      legacy_import.text_array_from_json(payload->'certifications'),
      NULLIF(payload->>'education', ''),
      COALESCE(payload->>'source', legacy_table),
      jsonb_build_object(
        'legacy', jsonb_build_object(
          'source_project_ref', source_project_ref,
          'legacy_table', legacy_table,
          'legacy_id', legacy_id,
          'payload', legacy_import.clean_legacy_payload(payload)
        ),
        'website_media', jsonb_strip_nulls(jsonb_build_object(
          'resume_url', COALESCE(payload->>'resume_url', payload->>'resumeUrl', payload->>'cv_url'),
          'media_url', COALESCE(payload->>'media_url', payload->>'mediaUrl', payload->>'portfolio_url'),
          'attachment_urls', COALESCE(payload->'attachment_urls', payload->'attachments')
        ))
      ),
      NULLIF(COALESCE(payload->>'score', payload->>'match_score'), '')::NUMERIC,
      CASE WHEN legacy_table = 'website_applications' THEN 'responded' ELSE 'discovered' END,
      COALESCE(NULLIF(payload->>'created_at', '')::TIMESTAMPTZ, NOW()),
      NOW()
    FROM candidate_sources c
    JOIN legacy_import.alivio_os_id_map role_map
      ON role_map.source_project_ref = c.source_project_ref
     AND role_map.legacy_table = 'jobs'
     AND role_map.legacy_id = c.legacy_job_id
     AND role_map.public_table = 'roles'
    WHERE NOT EXISTS (
      SELECT 1 FROM legacy_import.alivio_os_id_map m
      WHERE m.source_project_ref = c.source_project_ref
        AND m.legacy_table = c.legacy_table
        AND m.legacy_id = c.legacy_id
        AND m.public_table = 'candidates'
    )
    RETURNING id
  )
  SELECT count(*) INTO inserted_count FROM inserted;
  entity := 'candidates';
  RETURN NEXT;

  INSERT INTO legacy_import.alivio_os_id_map (source_project_ref, legacy_table, legacy_id, public_table, public_id)
  SELECT r.source_project_ref, r.legacy_table, r.legacy_id, 'candidates', candidate_row.id
  FROM _legacy_rows r
  JOIN public.candidates candidate_row
    ON candidate_row.org_id = target_org_id
   AND candidate_row.email IS NOT DISTINCT FROM NULLIF(r.payload->>'email', '')
   AND candidate_row.full_name = COALESCE(r.payload->>'full_name', r.payload->>'name', concat_ws(' ', r.payload->>'first_name', r.payload->>'last_name'), 'Legacy candidate')
  WHERE r.legacy_table IN ('candidates', 'website_applications')
  ON CONFLICT DO NOTHING;

  WITH application_sources AS (
    SELECT
      r.source_project_ref,
      r.legacy_table,
      r.legacy_id,
      r.payload,
      COALESCE(r.payload->>'job_id', r.payload->>'role_id', r.payload->>'position_id') AS legacy_job_id,
      COALESCE(r.payload->>'candidate_id', r.payload->>'applicant_id', r.legacy_id) AS legacy_candidate_id
    FROM _legacy_rows r
    WHERE r.legacy_table IN ('applications', 'website_applications')
  ), inserted AS (
    INSERT INTO public.candidate_role_matches (
      org_id, candidate_id, role_id, match_score, status, reasons, risks, next_step,
      submitted_at, legacy_source_project_ref, legacy_application_id, legacy_payload, created_at, updated_at
    )
    SELECT
      target_org_id,
      candidate_map.public_id,
      role_map.public_id,
      COALESCE(NULLIF(COALESCE(payload->>'match_score', payload->>'score'), '')::NUMERIC, 0),
      CASE lower(COALESCE(payload->>'status', 'matched'))
        WHEN 'submitted' THEN 'submitted'
        WHEN 'interview' THEN 'interview'
        WHEN 'offer' THEN 'offer'
        WHEN 'hired' THEN 'hired'
        WHEN 'rejected' THEN 'rejected'
        WHEN 'archived' THEN 'archived'
        WHEN 'shortlisted' THEN 'shortlisted'
        ELSE 'matched'
      END,
      legacy_import.text_array_from_json(payload->'reasons'),
      legacy_import.text_array_from_json(payload->'risks'),
      NULLIF(payload->>'next_step', ''),
      NULLIF(payload->>'submitted_at', '')::TIMESTAMPTZ,
      source_project_ref,
      legacy_id,
      legacy_import.clean_legacy_payload(payload),
      COALESCE(NULLIF(payload->>'created_at', '')::TIMESTAMPTZ, NOW()),
      NOW()
    FROM application_sources a
    JOIN legacy_import.alivio_os_id_map role_map
      ON role_map.source_project_ref = a.source_project_ref
     AND role_map.legacy_table = 'jobs'
     AND role_map.legacy_id = a.legacy_job_id
     AND role_map.public_table = 'roles'
    JOIN legacy_import.alivio_os_id_map candidate_map
      ON candidate_map.source_project_ref = a.source_project_ref
     AND candidate_map.legacy_table IN ('candidates', 'website_applications')
     AND candidate_map.legacy_id = a.legacy_candidate_id
     AND candidate_map.public_table = 'candidates'
    ON CONFLICT (org_id, candidate_id, role_id, legacy_source_project_ref, legacy_application_id) DO UPDATE SET
      match_score = EXCLUDED.match_score,
      status = EXCLUDED.status,
      reasons = EXCLUDED.reasons,
      risks = EXCLUDED.risks,
      next_step = EXCLUDED.next_step,
      submitted_at = EXCLUDED.submitted_at,
      legacy_payload = EXCLUDED.legacy_payload,
      updated_at = NOW()
    RETURNING id
  )
  SELECT count(*) INTO inserted_count FROM inserted;
  entity := 'candidate_role_matches';
  RETURN NEXT;
END;
$$;
