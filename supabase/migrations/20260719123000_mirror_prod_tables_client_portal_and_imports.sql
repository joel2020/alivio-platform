-- Mirror of tables that already exist in production (created outside
-- this repo during consolidation). IF NOT EXISTS keeps this a no-op in
-- prod while making fresh environments complete.

create table if not exists public.candidate_import_batches (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  role_id uuid references public.roles(id) on delete set null,
  source text not null default 'csv',
  status text not null default 'completed',
  total_rows integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  skipped_count integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.candidate_import_batches enable row level security;
do $$ begin
  create policy candidate_import_batches_org_access on public.candidate_import_batches
    for all to authenticated
    using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.org_id = candidate_import_batches.org_id))
    with check (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.org_id = candidate_import_batches.org_id));
exception when duplicate_object then null; end $$;

create table if not exists public.client_shortlists (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  share_token text not null unique,
  status text not null default 'active',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.client_shortlists enable row level security;
do $$ begin
  create policy client_shortlists_org_access on public.client_shortlists
    for all to authenticated
    using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.org_id = client_shortlists.org_id))
    with check (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.org_id = client_shortlists.org_id));
exception when duplicate_object then null; end $$;

create table if not exists public.client_shortlist_candidates (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references public.client_shortlists(id) on delete cascade,
  candidate_match_id uuid references public.candidate_role_matches(id) on delete set null,
  display_name text not null,
  summary text,
  recommendation text,
  compensation_notes text,
  interview_questions text[] not null default '{}',
  display_order integer not null default 0,
  client_decision text,
  client_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.client_shortlist_candidates enable row level security;
do $$ begin
  create policy client_shortlist_candidates_org_access on public.client_shortlist_candidates
    for all to authenticated
    using (exists (select 1 from public.client_shortlists s join public.users u on u.org_id = s.org_id
                   where s.id = client_shortlist_candidates.shortlist_id and u.id = (select auth.uid())))
    with check (exists (select 1 from public.client_shortlists s join public.users u on u.org_id = s.org_id
                        where s.id = client_shortlist_candidates.shortlist_id and u.id = (select auth.uid())));
exception when duplicate_object then null; end $$;

create table if not exists public.weekly_client_reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  week_start date not null,
  week_end date not null,
  candidates_sourced integer not null default 0,
  candidates_contacted integer not null default 0,
  candidates_replied integer not null default 0,
  candidates_screened integer not null default 0,
  candidates_shortlisted integer not null default 0,
  candidates_submitted integer not null default 0,
  interviews_scheduled integer not null default 0,
  summary text,
  bottlenecks text[] not null default '{}',
  recommendations text[] not null default '{}',
  share_token text not null unique,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.weekly_client_reports enable row level security;
do $$ begin
  create policy weekly_client_reports_org_access on public.weekly_client_reports
    for all to authenticated
    using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.org_id = weekly_client_reports.org_id))
    with check (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.org_id = weekly_client_reports.org_id));
exception when duplicate_object then null; end $$;
