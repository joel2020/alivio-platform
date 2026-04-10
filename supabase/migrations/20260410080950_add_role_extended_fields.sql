/*
  # Add Extended Fields to Roles Table

  ## Summary
  Adds new columns to the `roles` table to support the full 4-step role creation flow.

  ## New Columns
  - `department` (text) — Engineering, Product, Design, Marketing, etc.
  - `seniority` (text) — Junior, Mid-Level, Senior, Lead, Director, VP, C-Suite
  - `location_type` (text) — Remote, Hybrid, On-site
  - `city_region` (text) — City or region for Hybrid/On-site roles
  - `education_requirement` (text) — No requirement, High school, Bachelor's, Master's, PhD, Bootcamp / Certification
  - `scoring_weights` (jsonb) — AI scoring dimension weights (skills_match, experience_level, education, location_match, culture_signals)

  ## Modified Columns
  - `employment_type` constraint updated to include 'part-time' and 'freelance' in addition to existing values

  ## Notes
  1. All new columns are nullable to preserve compatibility with existing roles
  2. `scoring_weights` defaults to recommended weights
  3. Employment type constraint is dropped and recreated to include new values
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'department'
  ) THEN
    ALTER TABLE roles ADD COLUMN department TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'seniority'
  ) THEN
    ALTER TABLE roles ADD COLUMN seniority TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'location_type'
  ) THEN
    ALTER TABLE roles ADD COLUMN location_type TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'city_region'
  ) THEN
    ALTER TABLE roles ADD COLUMN city_region TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'education_requirement'
  ) THEN
    ALTER TABLE roles ADD COLUMN education_requirement TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'scoring_weights'
  ) THEN
    ALTER TABLE roles ADD COLUMN scoring_weights JSONB DEFAULT '{"skills_match": 8, "experience_level": 7, "education": 4, "location_match": 5, "culture_signals": 5}';
  END IF;
END $$;

ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_employment_type_check;

ALTER TABLE roles ADD CONSTRAINT roles_employment_type_check
  CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'per-diem'));
