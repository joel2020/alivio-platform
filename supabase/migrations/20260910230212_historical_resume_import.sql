-- Historical records preserve unknown contact data and never enter the email workflow.
alter table public.applications alter column last_name drop not null;
alter table public.applications alter column email drop not null;
alter table public.applications add column historical_resume_sha256 text;
alter table public.applications add column historical_metadata jsonb;
alter table public.applications add constraint applications_historical_integrity check (
  (historical_resume_sha256 is null and historical_metadata is null) or
  (historical_resume_sha256 is not null and historical_resume_sha256 ~ '^[a-f0-9]{64}$'
   and historical_metadata is not null and jsonb_typeof(historical_metadata)='object'
   and messages_stopped and org_id is not null and job_id is null and role_id is null
   and candidate_id is null and questionnaire is null and questionnaire_version is null
   and consent_at is null and consent_version is null)
);
create unique index applications_historical_checksum on public.applications(org_id,historical_resume_sha256)
where historical_resume_sha256 is not null;

create function public.ats_protect_historical_resume() returns trigger
language plpgsql set search_path=public as $$
begin
  if old.historical_resume_sha256 is not null and
    (new.historical_resume_sha256 is distinct from old.historical_resume_sha256 or new.org_id is distinct from old.org_id
     or new.resume_path is distinct from old.resume_path or new.historical_metadata is null) then
    raise exception 'invalid_historical_mutation';
  end if;
  return new;
end $$;
create trigger applications_protect_historical before update on public.applications
for each row execute function public.ats_protect_historical_resume();

create function public.ats_block_historical_messages() returns trigger
language plpgsql set search_path=public as $$
begin
  perform 1 from public.applications where id=new.application_id and historical_resume_sha256 is not null for share;
  if found then raise exception 'messages_stopped'; end if;
  return new;
end $$;
create trigger application_outbox_block_historical before insert or update on public.application_outbox
for each row execute function public.ats_block_historical_messages();

create function public.ats_import_scope(p_actor uuid) returns uuid
language plpgsql stable security definer set search_path=public as $$
declare org uuid;
begin
  select org_id into org from public.users where id=p_actor and is_active and role in ('owner','admin','editor');
  if org is null then raise exception 'forbidden' using errcode='42501'; end if;
  return org;
end $$;

create function public.ats_import_resume(p_actor uuid,p_payload jsonb,p_path text,p_filename text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare org uuid; h text:=p_payload->>'upload_sha256'; a public.applications; aid bigint; merged jsonb; result_status text;
begin
  org:=public.ats_import_scope(p_actor);
  if jsonb_typeof(p_payload) is distinct from 'object' or h is null or h !~ '^[a-f0-9]{64}$'
    or coalesce(p_payload->>'original_sha256','') !~ '^[a-f0-9]{64}$'
    or coalesce(length(trim(p_payload->>'first_name')),0) not between 1 and 150
    or coalesce(length(p_payload->>'last_name'),0)>150 or coalesce(length(p_payload->>'email'),0)>254
    or coalesce(length(p_payload->>'batch'),0) not between 1 and 150
    or octet_length(p_payload::text)>60000
    or jsonb_typeof(p_payload->'sources') is distinct from 'array'
    or jsonb_typeof(p_payload->'notes') is distinct from 'array'
    or jsonb_typeof(p_payload->'flags') is distinct from 'array'
    or (p_payload - array['first_name','last_name','email','upload_sha256','original_sha256','batch','sources','notes','flags']) <> '{}'::jsonb
    then raise exception 'invalid_historical_metadata'; end if;
  if jsonb_array_length(p_payload->'sources') not between 1 and 100
    or (p_payload->'flags') ?| array['identity_requires_review','email_requires_review','unsupported_upload_format']
    or exists(select 1 from jsonb_array_elements(p_payload->'sources') s where jsonb_typeof(s)<>'object' or coalesce(s->>'url','') !~ '^https://')
    then raise exception 'invalid_historical_review'; end if;
  if p_path is null or p_path not in ('historical/'||org::text||'/'||h||'.pdf','historical/'||org::text||'/'||h||'.docx')
    or coalesce(length(p_filename),0) not between 1 and 180
    or not exists(select 1 from storage.objects where bucket_id='application-resumes' and name=p_path)
    then raise exception 'invalid_upload'; end if;
  perform pg_advisory_xact_lock(hashtextextended(org::text||h,0));
  select * into a from public.applications where org_id=org and historical_resume_sha256=h for update;
  if found then
    if lower(a.first_name) is distinct from lower(p_payload->>'first_name')
      or lower(a.last_name) is distinct from lower(nullif(p_payload->>'last_name',''))
      or lower(a.email) is distinct from lower(nullif(p_payload->>'email','')) then raise exception 'import_identity_conflict'; end if;
    select jsonb_agg(s order by s::text) into merged from
      (select distinct value s from jsonb_array_elements((a.historical_metadata->'sources') || (p_payload->'sources'))) x;
    update public.applications set historical_metadata=jsonb_set(historical_metadata,'{sources}',merged) where id=a.id;
    if not merged <@ (a.historical_metadata->'sources') then
      insert into public.application_events(application_id,actor_id,event_type,detail) values(a.id,p_actor,'historical_sources','Additional source occurrences preserved.');
    end if;
    aid:=a.id; result_status:='existing';
  else
    insert into public.applications(first_name,last_name,email,status,org_id,messages_stopped,resume_path,resume_filename,historical_resume_sha256,historical_metadata)
    values(p_payload->>'first_name',nullif(p_payload->>'last_name',''),nullif(p_payload->>'email',''),'new',org,true,p_path,p_filename,h,p_payload)
    returning id into aid;
    insert into public.application_events(application_id,actor_id,event_type,detail)
    values(aid,p_actor,'historical_import','Historical résumé imported. No messages sent; job, questionnaire and consent not collected.');
    result_status:='imported';
  end if;
  return jsonb_build_object('id',aid,'status',result_status,'sha256',h,'messages_sent',0);
end $$;

create or replace function public.ats_application_json(p_id bigint) returns jsonb language sql stable security definer set search_path = public as $$
 select jsonb_build_object('id',a.id,'public_reference',a.public_reference,'job_id',a.job_id,'job_title',case when a.historical_resume_sha256 is not null then 'Historical résumé · no job assigned' else coalesce(j.title,'Removed job') end,'first_name',a.first_name,'last_name',a.last_name,'email',a.email,'phone',a.phone,'status',a.status,'created_at',a.created_at,'org_id',a.org_id,'role_id',a.role_id,'candidate_id',a.candidate_id,'assigned_to',a.assigned_to,'questionnaire',a.questionnaire,'resume_filename',a.resume_filename,'next_action',a.next_action,'next_action_at',a.next_action_at,'messages_stopped',a.messages_stopped,'followups_stopped',a.messages_stopped or a.replied_at is not null or coalesce(a.status in ('hired','rejected','withdrawn'),false),'historical_metadata',a.historical_metadata)
 from public.applications a left join public.jobs j on j.id=a.job_id where a.id=p_id
$$;

-- Bounded pages keep older imported versions reachable beyond the original 500-row cap.
create function public.ats_application_page(p_actor uuid,p_before bigint default null) returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare result jsonb;
begin
  if not exists(select 1 from public.users where id=p_actor and is_active) then raise exception 'forbidden' using errcode='42501'; end if;
  if p_before is not null and p_before<1 then raise exception 'invalid_cursor'; end if;
  select jsonb_build_object('applications',coalesce(jsonb_agg(public.ats_application_json(x.id) order by x.id desc),'[]'::jsonb),
    'next_cursor',case when count(*)=200 then min(x.id) else null end) into result
  from (select id from public.applications where public.ats_can_access(p_actor,org_id,false)
    and (p_before is null or id<p_before) order by id desc limit 200) x;
  return result;
end $$;

revoke all on function public.ats_import_scope(uuid),public.ats_import_resume(uuid,jsonb,text,text),public.ats_application_page(uuid,bigint),public.ats_protect_historical_resume(),public.ats_block_historical_messages() from public,anon,authenticated;
grant execute on function public.ats_import_scope(uuid),public.ats_import_resume(uuid,jsonb,text,text),public.ats_application_page(uuid,bigint) to service_role;
