-- Production security hardening for public RPCs, org_users view, and RLS helper functions.
-- Applied to Supabase project ovxttubotjebnaoedllu on 2026-04-28.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.org_id
  from public.users u
  where u.id = auth.uid()
  limit 1;
$$;

revoke all on function private.current_org_id() from public, anon;
grant execute on function private.current_org_id() to authenticated, service_role;

drop policy if exists "Users can read own org" on public.organizations;
create policy "Users can read own org"
on public.organizations for select to authenticated
using (id = (select private.current_org_id()));

drop policy if exists "Users can update own org" on public.organizations;
create policy "Users can update own org"
on public.organizations for update to authenticated
using (id = (select private.current_org_id()))
with check (id = (select private.current_org_id()));

drop policy if exists "Authenticated users can create onboarding orgs" on public.organizations;
create policy "Authenticated users can create onboarding orgs"
on public.organizations for insert to authenticated
with check (
  auth.uid() is not null
  and not exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.org_id is not null
  )
);

drop policy if exists "Users can read own org members" on public.users;
create policy "Users can read own org members"
on public.users for select to authenticated
using (((select auth.uid()) = id) or (org_id = (select private.current_org_id())));

drop policy if exists "Users can update own record" on public.users;
create policy "Users can update own record"
on public.users for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile during onboarding" on public.users;
create policy "Users can insert own profile during onboarding"
on public.users for insert to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Org members can view roles" on public.roles;
create policy "Org members can view roles" on public.roles for select to authenticated using (org_id = (select private.current_org_id()));
drop policy if exists "Org members can insert roles" on public.roles;
create policy "Org members can insert roles" on public.roles for insert to authenticated with check (org_id = (select private.current_org_id()));
drop policy if exists "Org members can update roles" on public.roles;
create policy "Org members can update roles" on public.roles for update to authenticated using (org_id = (select private.current_org_id())) with check (org_id = (select private.current_org_id()));
drop policy if exists "Org members can delete roles" on public.roles;
create policy "Org members can delete roles" on public.roles for delete to authenticated using (org_id = (select private.current_org_id()));

drop policy if exists "Org members can view candidates" on public.candidates;
create policy "Org members can view candidates" on public.candidates for select to authenticated using (org_id = (select private.current_org_id()));
drop policy if exists "Org members can insert candidates" on public.candidates;
create policy "Org members can insert candidates" on public.candidates for insert to authenticated with check (org_id = (select private.current_org_id()));
drop policy if exists "Org members can update candidates" on public.candidates;
create policy "Org members can update candidates" on public.candidates for update to authenticated using (org_id = (select private.current_org_id())) with check (org_id = (select private.current_org_id()));

drop policy if exists "Org members can view voice calls" on public.voice_calls;
create policy "Org members can view voice calls" on public.voice_calls for select to authenticated using (org_id = (select private.current_org_id()));
drop policy if exists "Org members can insert voice calls" on public.voice_calls;
create policy "Org members can insert voice calls" on public.voice_calls for insert to authenticated with check (org_id = (select private.current_org_id()));

drop policy if exists "Org members can view voice transcripts" on public.voice_transcripts;
create policy "Org members can view voice transcripts"
on public.voice_transcripts for select to authenticated
using (call_id in (select vc.id from public.voice_calls vc where vc.org_id = (select private.current_org_id())));

drop policy if exists "Org members can insert voice transcripts" on public.voice_transcripts;
create policy "Org members can insert voice transcripts"
on public.voice_transcripts for insert to authenticated
with check (call_id in (select vc.id from public.voice_calls vc where vc.org_id = (select private.current_org_id())));

drop policy if exists "Org members can view voice settings" on public.voice_settings;
create policy "Org members can view voice settings"
on public.voice_settings for select to authenticated
using (role_id in (select r.id from public.roles r where r.org_id = (select private.current_org_id())));

drop policy if exists "Org members can insert voice settings" on public.voice_settings;
create policy "Org members can insert voice settings"
on public.voice_settings for insert to authenticated
with check (role_id in (select r.id from public.roles r where r.org_id = (select private.current_org_id())));

drop policy if exists "Org members can update voice settings" on public.voice_settings;
create policy "Org members can update voice settings"
on public.voice_settings for update to authenticated
using (role_id in (select r.id from public.roles r where r.org_id = (select private.current_org_id())))
with check (role_id in (select r.id from public.roles r where r.org_id = (select private.current_org_id())));

drop policy if exists "Org members can view agent activity log" on public.agent_activity_log;
create policy "Org members can view agent activity log" on public.agent_activity_log for select to authenticated using (org_id = (select private.current_org_id()));
drop policy if exists "Org members can insert agent activity" on public.agent_activity_log;
create policy "Org members can insert agent activity" on public.agent_activity_log for insert to authenticated with check (org_id = (select private.current_org_id()));

drop policy if exists "Org members can view candidate feedback" on public.candidate_feedback;
create policy "Org members can view candidate feedback" on public.candidate_feedback for select to authenticated using (org_id = (select private.current_org_id()));
drop policy if exists "Org members can insert candidate feedback" on public.candidate_feedback;
create policy "Org members can insert candidate feedback" on public.candidate_feedback for insert to authenticated with check (org_id = (select private.current_org_id()));

create or replace view public.org_users
with (security_invoker = true)
as
select
  u.id,
  u.id as user_id,
  u.org_id,
  u.org_id as organization_id,
  u.full_name,
  u.email,
  u.role,
  u.created_at,
  u.updated_at
from public.users u;

revoke all on public.org_users from public, anon;
revoke insert, update, delete, truncate, references, trigger on public.org_users from authenticated;
grant select on public.org_users to authenticated;

create or replace function public.create_organization_and_user(
  org_name text,
  org_size text,
  org_industry text,
  user_id uuid,
  user_full_name text,
  user_email text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_org_id uuid;
  existing_org_id uuid;
  current_uid uuid := auth.uid();
  normalized_size text;
  normalized_name text := nullif(btrim(org_name), '');
  normalized_industry text := coalesce(nullif(btrim(org_industry), ''), 'Technology');
  normalized_full_name text := coalesce(nullif(btrim(user_full_name), ''), 'User');
  normalized_email text := coalesce(nullif(btrim(user_email), ''), '');
begin
  if current_uid is null then
    raise exception 'Authentication required';
  end if;

  if user_id is distinct from current_uid then
    raise exception 'User mismatch';
  end if;

  if normalized_name is null then
    raise exception 'Organization name is required';
  end if;

  select u.org_id into existing_org_id
  from public.users u
  where u.id = current_uid
  limit 1;

  if existing_org_id is not null then
    return existing_org_id;
  end if;

  normalized_size := case
    when org_size in ('1-50', '51-200', '201-1000', '1000+') then org_size
    when org_size in ('1-10', '11-50') then '1-50'
    else '1-50'
  end;

  insert into public.organizations (name, size, industry)
  values (normalized_name, normalized_size, normalized_industry)
  returning id into new_org_id;

  insert into public.users (id, org_id, full_name, email, role)
  values (current_uid, new_org_id, normalized_full_name, normalized_email, 'admin')
  on conflict (id) do update
  set
    org_id = coalesce(public.users.org_id, excluded.org_id),
    full_name = excluded.full_name,
    email = excluded.email,
    role = case when public.users.org_id is null then 'admin' else public.users.role end,
    updated_at = now();

  return new_org_id;
end;
$$;

revoke execute on function public.create_organization_and_user(text, text, text, uuid, text, text) from public, anon;
grant execute on function public.create_organization_and_user(text, text, text, uuid, text, text) to authenticated;

create or replace function public.get_admin_auth_users()
returns table (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    u.id,
    u.email::text,
    u.created_at,
    null::timestamptz as last_sign_in_at
  from public.users u
  where u.org_id = private.current_org_id()
    and exists (
      select 1
      from public.users me
      where me.id = auth.uid()
        and me.org_id = u.org_id
        and me.role = 'admin'
    )
  order by u.created_at desc;
$$;

revoke execute on function public.get_admin_auth_users() from public, anon;
grant execute on function public.get_admin_auth_users() to authenticated;

create or replace function public.get_org_stats(org_id_input uuid)
returns json
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  caller_org_id uuid := private.current_org_id();
  result json;
begin
  if auth.uid() is null or org_id_input is distinct from caller_org_id then
    raise exception 'Access denied';
  end if;

  select json_build_object(
    'total_roles', (select count(*) from public.roles where org_id = org_id_input),
    'active_roles', (select count(*) from public.roles where org_id = org_id_input and status = 'active'),
    'total_candidates', (select count(*) from public.candidates where org_id = org_id_input),
    'total_voice_calls', (select count(*) from public.voice_calls where org_id = org_id_input),
    'placed_candidates', (select count(*) from public.candidates where org_id = org_id_input and pipeline_stage = 'placed')
  ) into result;

  return result;
end;
$$;

revoke execute on function public.get_org_stats(uuid) from public, anon;
grant execute on function public.get_org_stats(uuid) to authenticated;

revoke execute on function public.get_user_org_id() from public, anon, authenticated;
revoke execute on function public.load_demo_data(uuid) from public, anon, authenticated;
grant execute on function public.load_demo_data(uuid) to service_role;

alter default privileges in schema public revoke execute on functions from public, anon;
