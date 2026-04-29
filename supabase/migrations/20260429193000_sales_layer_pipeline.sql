-- Sales layer: client-ready candidate submission stages and supporting indexes.

alter table public.candidates
  add column if not exists submitted_at timestamptz,
  add column if not exists interview_at timestamptz,
  add column if not exists offer_at timestamptz,
  add column if not exists hired_at timestamptz,
  add column if not exists client_notes text,
  add column if not exists client_visible boolean not null default false;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'candidates_pipeline_stage_check'
  ) then
    alter table public.candidates drop constraint candidates_pipeline_stage_check;
  end if;
end $$;

alter table public.candidates
  add constraint candidates_pipeline_stage_check
  check (pipeline_stage in (
    'discovered',
    'scored',
    'voice_qualified',
    'engaged',
    'responded',
    'scheduled',
    'submitted',
    'interview',
    'offer',
    'hired',
    'archived'
  ));

create index if not exists idx_candidates_client_visible
  on public.candidates (org_id, client_visible, pipeline_stage, updated_at desc);

create index if not exists idx_candidates_submitted_at
  on public.candidates (org_id, submitted_at desc)
  where submitted_at is not null;
