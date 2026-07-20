-- Lead-working columns for the inbound pipeline surface.
alter table public.leads
  add column if not exists status text not null default 'new',
  add column if not exists notes text;

do $$ begin
  alter table public.leads
    add constraint leads_status_check check (status in ('new','contacted','qualified','closed','spam'));
exception when duplicate_object then null; end $$;

create index if not exists idx_leads_status_created on public.leads (status, created_at desc);

-- Platform admins manage leads from the app; anon writes go through the
-- public-intake edge function (service role).
drop policy if exists "Platform admins manage leads" on public.leads;
create policy "Platform admins manage leads" on public.leads
  for all using (public.is_platform_admin())
  with check (public.is_platform_admin());
