# Supabase consolidation into Alivio-OS

Primary project: `ovxttubotjebnaoedllu`

Legacy projects:

- `bujsbcebtwooqfqkiqla`
- `ycmwimpznfjxvayjiejk`

This repository contains the guarded migration support for consolidating the two legacy Supabase projects into Alivio-OS without automatically moving Instantly API keys or disabling the legacy projects prematurely.

## What is automated

1. `scripts/consolidate-supabase.mjs` exports `jobs`, `candidates`, `applications`, and `website_applications` from each legacy project and upserts them into the matching `legacy_import` import tables in Alivio-OS.
2. `supabase/migrations/20260515120000_supabase_legacy_consolidation.sql` adds `public.candidate_role_matches` and a `legacy_import.apply_alivio_os_consolidation(target_org_id)` function that maps imported legacy rows into:
   - `public.roles`
   - `public.candidates`
   - `public.candidate_role_matches`
3. Website resume/media URLs are preserved in `public.candidates.profile_data.website_media`.
4. Legacy source metadata is preserved in `profile_data.legacy` and `candidate_role_matches.legacy_payload`.
5. Instantly/API-key-like fields are stripped or replaced with a withheld marker before storage in target JSON payloads.

## Required secrets

Do not commit these values. Provide them only in the shell used for the consolidation run.

```bash
export PRIMARY_PROJECT_REF=ovxttubotjebnaoedllu
export PRIMARY_SUPABASE_URL=https://ovxttubotjebnaoedllu.supabase.co
export PRIMARY_SUPABASE_SERVICE_ROLE_KEY=...

export LEGACY_PROJECT_REFS=bujsbcebtwooqfqkiqla,ycmwimpznfjxvayjiejk
export LEGACY_BUJSBCEBTWOOQFQKIQLA_SUPABASE_SERVICE_ROLE_KEY=...
export LEGACY_YCMWIMPZNFJXVAYJIEJK_SUPABASE_SERVICE_ROLE_KEY=...
```

If table names differ in a legacy project, override them before running:

```bash
export LEGACY_EXPORT_TABLES=jobs,candidates,applications,website_applications
export LEGACY_IMPORT_TABLE_MAP='{"jobs":"import_jobs","candidates":"import_candidates","applications":"import_applications","website_applications":"import_website_applications"}'
```

## Run order

1. Apply database migrations to Alivio-OS.
2. Dry-run the export/import to confirm table access and row counts:

   ```bash
   DRY_RUN=1 node scripts/consolidate-supabase.mjs
   ```

3. Export from the two legacy projects and insert into the `legacy_import` import tables:

   ```bash
   node scripts/consolidate-supabase.mjs
   ```

4. Run the structured import mapper inside Alivio-OS, replacing the UUID with the destination organization ID:

   ```sql
   SELECT *
   FROM legacy_import.apply_alivio_os_consolidation('00000000-0000-0000-0000-000000000000');
   ```

5. Validate row counts and app behavior before changing environment variables:

   ```sql
   SELECT count(*) FROM public.roles;
   SELECT count(*) FROM public.candidates;
   SELECT count(*) FROM public.candidate_role_matches;
   SELECT id, full_name, profile_data->'website_media' AS website_media
   FROM public.candidates
   WHERE profile_data ? 'website_media'
   LIMIT 20;
   ```

6. Only after validation, update Vercel environment variables to point to Alivio-OS:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

7. Confirm all apps work against Alivio-OS in production.

8. Pause, but do not delete, the legacy Supabase projects:
   - `bujsbcebtwooqfqkiqla`
   - `ycmwimpznfjxvayjiejk`

## Explicit safety gates

- Instantly API keys are not migrated automatically. Re-enter them manually in Alivio-OS only after the new production environment is validated.
- Legacy projects must remain active until all apps are confirmed working with the Alivio-OS Supabase URL and keys.
- The script only exports the four default business-data tables unless `LEGACY_EXPORT_TABLES` is intentionally changed.
