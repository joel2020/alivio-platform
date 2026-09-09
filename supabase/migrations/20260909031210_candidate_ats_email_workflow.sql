-- Additive ATS workflow. No historical application produces an email.
create table public.application_platform_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.application_platform_admins enable row level security;
revoke all on public.application_platform_admins from anon, authenticated;
-- The legacy platform helper grants every org admin global access; deliberately do not use it here.
create function public.ats_can_access(p_actor uuid, p_org uuid, p_edit boolean default false)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.users u where u.id=p_actor and u.is_active and
    (exists(select 1 from public.application_platform_admins a where a.user_id=u.id)
    or (u.org_id=p_org and u.role in ('owner','admin','editor'))))
$$;
-- Existing self-profile policies must not allow changing ATS authorization attributes.
create function public.ats_protect_membership() returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated','anon') then
    if TG_OP='INSERT' then
      raise exception 'Membership creation requires an administrator' using errcode='42501';
    end if;
    if new.org_id is distinct from old.org_id or new.role is distinct from old.role or new.is_active is distinct from old.is_active then
      raise exception 'Membership changes require an administrator' using errcode='42501';
    end if;
  end if;
  return new;
end $$;
create trigger ats_protect_membership before insert or update on public.users for each row execute function public.ats_protect_membership();
alter table public.jobs add column accepting_applications boolean not null default true;
create table public.application_job_roles (
  job_id bigint primary key references public.jobs(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  created_at timestamptz not null default now()
);
alter table public.applications
  add column submission_id uuid unique,
  add column submission_hash text,
  add column public_reference text unique,
  add column org_id uuid references public.organizations(id),
  add column role_id uuid references public.roles(id),
  add column candidate_id uuid references public.candidates(id),
  add column assigned_to uuid references public.users(id),
  add column questionnaire jsonb,
  add column questionnaire_version text,
  add column consent_at timestamptz,
  add column consent_version text,
  add column resume_path text,
  add column resume_filename text,
  add column next_action text,
  add column next_action_at timestamptz,
  add column messages_stopped boolean not null default false,
  add column replied_at timestamptz,
  add column reply_token uuid not null default gen_random_uuid();
create index applications_org_created_idx on public.applications(org_id,created_at desc);
create table public.application_events (
  id uuid primary key default gen_random_uuid(), application_id bigint not null references public.applications(id) on delete cascade,
  actor_id uuid references auth.users(id), event_type text not null, detail text not null,
  created_at timestamptz not null default now()
);
create table public.application_outbox (
  id uuid primary key default gen_random_uuid(), application_id bigint not null references public.applications(id) on delete cascade,
  event_key text not null unique, kind text not null check (kind in ('acknowledgment','internal','manual','followup')),
  recipient text, subject text not null, body text not null,
  status text not null default 'queued' check(status in ('queued','sending','accepted','delivered','failed','cancelled')),
  scheduled_at timestamptz not null default now(), next_attempt_at timestamptz not null default now(), created_at timestamptz not null default now(),
  sent_at timestamptz, delivered_at timestamptz, provider_id text unique, provider_payload jsonb,
  attempts integer not null default 0, first_attempt_at timestamptz, lease_token uuid, lease_until timestamptz, last_error text
);
create index application_outbox_due_idx on public.application_outbox(status,next_attempt_at,scheduled_at);
create table public.application_uploads (
  path text primary key, created_at timestamptz not null default now(), committed boolean not null default false
);
create table public.application_rate_limits (
  key text primary key, hits integer not null, window_start timestamptz not null
);
create table public.application_webhook_events (id text primary key, event_type text not null, provider_id text, created_at timestamptz not null default now());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('application-resumes','application-resumes',false,5242880,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
-- Restrictive policy also protects this bucket if broad permissive storage policies are added later.
create policy ats_private_resume_boundary on storage.objects as restrictive for all to anon,authenticated
using (bucket_id <> 'application-resumes') with check(bucket_id <> 'application-resumes');
alter table public.applications enable row level security;
-- Preserve previous policies but impose this tenant boundary on all of them.
create policy ats_application_boundary on public.applications as restrictive for all to anon,authenticated
using (public.ats_can_access(auth.uid(),org_id,false)) with check(false);
create policy ats_application_read on public.applications for select to authenticated using(public.ats_can_access(auth.uid(),org_id,false));
revoke insert,update,delete on public.applications from anon,authenticated;
-- New tables are inaccessible directly; Edge functions expose only necessary fields.
do $$ declare tbl text; begin
  foreach tbl in array array['application_job_roles','application_events','application_outbox','application_uploads','application_rate_limits','application_webhook_events'] loop
    execute format('alter table public.%I enable row level security',tbl);
    execute format('revoke all on public.%I from anon,authenticated',tbl);
  end loop;
end $$;
create function public.ats_rate_limit(p_key text,p_limit integer,p_seconds integer) returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into public.application_rate_limits(key,hits,window_start) values(p_key,1,now())
  on conflict(key) do update set hits=case when application_rate_limits.window_start < now()-make_interval(secs=>p_seconds) then 1 else application_rate_limits.hits+1 end,
    window_start=case when application_rate_limits.window_start < now()-make_interval(secs=>p_seconds) then now() else application_rate_limits.window_start end
  returning hits into n;
  delete from public.application_rate_limits where window_start<now()-interval '2 days';
  return n<=p_limit;
end $$;
create function public.ats_link_candidate(p_id bigint) returns void language plpgsql security definer set search_path = public as $$
declare a public.applications; c uuid;
begin
  select * into a from public.applications where id=p_id for update;
  if a.org_id is null or a.role_id is null or a.candidate_id is not null then return; end if;
  perform pg_advisory_xact_lock(hashtextextended(a.org_id::text||a.role_id::text||lower(trim(a.email)),0));
  select id into c from public.candidates where org_id=a.org_id and role_id=a.role_id and lower(trim(email))=lower(trim(a.email)) order by created_at,id limit 1;
  if c is null then
    insert into public.candidates(org_id,role_id,full_name,email,phone,location,source,pipeline_stage,profile_data)
    values(a.org_id,a.role_id,a.first_name||' '||a.last_name,lower(trim(a.email)),a.phone,a.questionnaire->>'location','website_application','discovered',jsonb_build_object('application_reference',a.public_reference)) returning id into c;
  end if;
  update public.applications set candidate_id=c where id=p_id;
end $$;
create function public.ats_submit(p_payload jsonb,p_hash text,p_path text,p_filename text) returns text
language plpgsql security definer set search_path = public as $$
declare a public.applications; j public.jobs; r public.roles; ref text; aid bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_payload->>'submission_id',0));
  select * into a from public.applications where submission_id=(p_payload->>'submission_id')::uuid;
  if found then
    if a.submission_hash<>p_hash then raise exception 'submission_conflict' using errcode='P0001'; end if;
    return a.public_reference;
  end if;
  select * into j from public.jobs where id=(p_payload->>'job_id')::bigint for share;
  if not found or not j.accepting_applications then raise exception 'job_unavailable' using errcode='P0001'; end if;
  select roles.* into r from public.roles join public.application_job_roles m on m.role_id=roles.id where m.job_id=j.id;
  if r.id is not null and r.status is distinct from 'active' then raise exception 'job_unavailable' using errcode='P0001'; end if;
  if not exists(select 1 from public.application_uploads where path=p_path and not committed) then raise exception 'invalid_upload'; end if;
  ref := 'ASP-'||upper(replace(gen_random_uuid()::text,'-',''));
  insert into public.applications(job_id,first_name,last_name,email,phone,linkedin_url,status,submission_id,submission_hash,public_reference,org_id,role_id,questionnaire,questionnaire_version,consent_at,consent_version,resume_path,resume_filename)
  values(j.id,p_payload->>'first_name',p_payload->>'last_name',p_payload->>'email',nullif(p_payload->>'phone',''),nullif(p_payload->>'linkedin_url',''),'new',(p_payload->>'submission_id')::uuid,p_hash,ref,r.org_id,r.id,p_payload->'questionnaire','2026-09-08',now(),'2026-09-08',p_path,p_filename) returning id into aid;
  perform public.ats_link_candidate(aid);
  update public.application_uploads set committed=true where path=p_path;
  insert into public.application_events(application_id,event_type,detail) values(aid,'submitted','Application received with résumé and privacy consent.');
  insert into public.application_outbox(application_id,event_key,kind,recipient,subject,body) values
  (aid,'ack:'||aid,'acknowledgment',p_payload->>'email','Application received — '||j.title,
   'Hi '||(p_payload->>'first_name')||E',\n\nThank you for applying for the '||j.title||' opportunity through Alivio Search Partners. We received your résumé and application. Your reference is '||ref||E'.\n\nOur recruiting team will review your experience against the role requirements. If there is a potential fit, we will contact you about next steps.\n\nThank you,\nAlivio Search Partners'),
  (aid,'internal:'||aid,'internal',null,'New application — '||j.title,'A new application is ready for review in the Alivio Applications inbox. Reference: '||ref||E'\nReview: https://aliviosearchpartners.com/applications');
  return ref;
end $$;
create function public.ats_application_json(p_id bigint) returns jsonb language sql stable security definer set search_path = public as $$
 select jsonb_build_object('id',a.id,'public_reference',a.public_reference,'job_id',a.job_id,'job_title',coalesce(j.title,'Removed job'),'first_name',a.first_name,'last_name',a.last_name,'email',a.email,'phone',a.phone,'status',a.status,'created_at',a.created_at,'org_id',a.org_id,'role_id',a.role_id,'candidate_id',a.candidate_id,'assigned_to',a.assigned_to,'questionnaire',a.questionnaire,'resume_filename',a.resume_filename,'next_action',a.next_action,'next_action_at',a.next_action_at,'messages_stopped',a.messages_stopped,'followups_stopped',a.messages_stopped or a.replied_at is not null or coalesce(a.status in ('hired','rejected','withdrawn'),false))
 from public.applications a left join public.jobs j on j.id=a.job_id where a.id=p_id
$$;
create function public.ats_recruiter(p_actor uuid,p_body jsonb,p_followups boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare act text:=p_body->>'action'; a public.applications; u public.users; r public.roles; admin boolean; j bigint; appid bigint; n text; mapped uuid; existing_message public.application_outbox; message_key text;
begin
  select * into u from public.users where id=p_actor and is_active;
  if not found then raise exception 'forbidden' using errcode='42501'; end if;
  admin:=exists(select 1 from public.application_platform_admins where user_id=p_actor);
  if act='list' then
    return jsonb_build_object('applications',coalesce((select jsonb_agg(public.ats_application_json(x.id) order by x.created_at desc) from (select id,created_at from public.applications where public.ats_can_access(p_actor,org_id,false) order by created_at desc limit 500) x),'[]'::jsonb),
    'jobs',coalesce((select jsonb_agg(jsonb_build_object('id',jobs.id,'title',jobs.title,'role_id',m.role_id)) from public.jobs left join public.application_job_roles m on m.job_id=jobs.id left join public.roles rr on rr.id=m.role_id where admin or rr.org_id=u.org_id),'[]'::jsonb),
    'roles',coalesce((select jsonb_agg(jsonb_build_object('id',id,'title',title,'org_id',org_id)) from public.roles where admin or org_id=u.org_id),'[]'::jsonb),
    'reviewers',coalesce((select jsonb_agg(jsonb_build_object('id',id,'full_name',full_name)) from public.users where is_active and role in ('owner','admin','editor') and (admin or org_id=u.org_id)),'[]'::jsonb),'is_admin',admin);
  end if;
  if act='map-job' then
    if not admin then raise exception 'forbidden' using errcode='42501'; end if;
    j:=(p_body->>'job_id')::bigint;
    select * into r from public.roles where id=(p_body->>'role_id')::uuid;
    if not found then raise exception 'invalid_role'; end if;
    perform 1 from public.jobs where id=j for update;
    if not found then raise exception 'invalid_job'; end if;
    select role_id into mapped from public.application_job_roles where job_id=j;
    if mapped is not null and mapped<>r.id then raise exception 'job_already_mapped'; end if;
    insert into public.application_job_roles(job_id,role_id) values(j,r.id) on conflict(job_id) do nothing;
    for appid in select id from public.applications where job_id=j and org_id is null for update loop
      update public.applications set org_id=r.org_id,role_id=r.id where id=appid;
      perform public.ats_link_candidate(appid);
      insert into public.application_events(application_id,actor_id,event_type,detail) values(appid,p_actor,'mapped','Linked to role '||r.title);
    end loop;
    return jsonb_build_object('ok',true);
  end if;
  select * into a from public.applications where id=(p_body->>'id')::bigint for update;
  if not found or not public.ats_can_access(p_actor,a.org_id,act not in ('detail','resume')) then raise exception 'forbidden' using errcode='42501'; end if;
  if act='detail' then
    return jsonb_build_object('application',public.ats_application_json(a.id),
      'events',coalesce((select jsonb_agg(jsonb_build_object('id',id,'created_at',created_at,'event_type',event_type,'detail',detail) order by created_at desc) from public.application_events where application_id=a.id),'[]'::jsonb),
      'messages',coalesce((select jsonb_agg(jsonb_build_object('id',id,'created_at',created_at,'subject',subject,'body',body,'status',status,'scheduled_at',scheduled_at,'sent_at',sent_at,'last_error',last_error) order by created_at desc) from public.application_outbox where application_id=a.id),'[]'::jsonb));
  elsif act='resume' then
    return jsonb_build_object('path',a.resume_path,'filename',a.resume_filename);
  elsif act='update' then
    if p_body ? 'status' and (p_body->>'status' is null or p_body->>'status' not in ('new','reviewing','screening','interview','offer','hired','rejected','withdrawn')) then raise exception 'invalid_status'; end if;
    if p_body ? 'assigned_to' and p_body->>'assigned_to' is not null and not exists(select 1 from public.users where id=(p_body->>'assigned_to')::uuid and is_active and role in ('owner','admin','editor') and org_id=a.org_id) then raise exception 'invalid_assignee'; end if;
    if length(p_body->>'next_action')>1000 or length(p_body->>'note')>10000 then raise exception 'invalid_text'; end if;
    update public.applications set status=case when p_body ? 'status' then p_body->>'status' else status end,
      assigned_to=case when p_body ? 'assigned_to' then (p_body->>'assigned_to')::uuid else assigned_to end,
      next_action=case when p_body ? 'next_action' then p_body->>'next_action' else next_action end,
      next_action_at=case when p_body ? 'next_action_at' then (p_body->>'next_action_at')::timestamptz else next_action_at end,
      messages_stopped=messages_stopped
    where id=a.id;
    -- Explicit mapping to legacy pipeline stages; application stage remains the detailed source of truth.
    if p_body ? 'status' and a.candidate_id is not null then
      update public.candidates set pipeline_stage=case p_body->>'status' when 'new' then 'discovered' when 'reviewing' then 'scored' when 'screening' then 'engaged' when 'interview' then 'scheduled' when 'offer' then 'scheduled' else 'archived' end, updated_at=now() where id=a.candidate_id and org_id=a.org_id and role_id=a.role_id;
    end if;
    n:=nullif(trim(p_body->>'note'),'');
    if n is not null then insert into public.application_events(application_id,actor_id,event_type,detail) values(a.id,p_actor,'note',n); end if;
    if (p_body-'action'-'id'-'note')<>'{}'::jsonb then insert into public.application_events(application_id,actor_id,event_type,detail) values(a.id,p_actor,'updated',(p_body-'action'-'id'-'note')::text); end if;
  elsif act in ('stop-messages','record-reply') then
    update public.applications set messages_stopped=case when act='stop-messages' then true else messages_stopped end,replied_at=case when act='record-reply' then now() else replied_at end where id=a.id;
    insert into public.application_events(application_id,actor_id,event_type,detail) values(a.id,p_actor,act,case when act='record-reply' then 'Candidate reply recorded; future follow-ups stopped.' else 'Future candidate messages stopped.' end);
  elsif act='message' then
    if p_body->>'request_id' is null then raise exception 'invalid_request_id'; end if;
    message_key:='manual:'||a.id::text||':'||(p_body->>'request_id')::uuid::text;
    select * into existing_message from public.application_outbox where event_key=message_key;
    if found then
      if existing_message.subject is distinct from p_body->>'subject' or existing_message.body is distinct from p_body->>'body'
        or (existing_message.kind='followup') is distinct from (p_body->>'scheduled_at' is not null)
        or (existing_message.kind='followup' and existing_message.scheduled_at is distinct from (p_body->>'scheduled_at')::timestamptz) then
        raise exception 'message_conflict';
      end if;
      return jsonb_build_object('ok',true);
    end if;
    if p_body->>'scheduled_at' is not null and ((p_body->>'scheduled_at')::timestamptz<=now() or (p_body->>'scheduled_at')::timestamptz>now()+interval '90 days') then raise exception 'invalid_schedule'; end if;
    if a.messages_stopped then raise exception 'messages_stopped'; end if;
    if p_body->>'scheduled_at' is not null and (not p_followups or a.replied_at is not null or a.status in ('hired','rejected','withdrawn')) then raise exception 'followups_unavailable'; end if;
    if coalesce(length(trim(p_body->>'subject')),0) not between 1 and 200 or coalesce(length(trim(p_body->>'body')),0) not between 1 and 20000 then raise exception 'invalid_message'; end if;
    insert into public.application_outbox(application_id,event_key,kind,recipient,subject,body,scheduled_at)
    values(a.id,message_key,case when p_body->>'scheduled_at' is null then 'manual' else 'followup' end,a.email,p_body->>'subject',p_body->>'body',coalesce((p_body->>'scheduled_at')::timestamptz,now()));
    insert into public.application_events(application_id,actor_id,event_type,detail) values(a.id,p_actor,'message_queued','Email queued for delivery.');
  else raise exception 'invalid_action'; end if;
  update public.application_outbox set status='cancelled',last_error='application_stopped' where application_id=a.id and status='queued' and kind in ('manual','followup') and exists(select 1 from public.applications where id=a.id and (messages_stopped or (application_outbox.kind='followup' and (replied_at is not null or status in ('hired','rejected','withdrawn')))));
  return jsonb_build_object('ok',true);
end $$;
-- Claim a small batch atomically. A lease extends beyond the provider HTTP timeout.
create function public.ats_claim_messages(p_followups boolean) returns setof public.application_outbox
language plpgsql security definer set search_path = public as $$
begin
  update public.application_outbox o set status='cancelled',lease_token=null,lease_until=null,last_error='application_stopped'
  from public.applications a where a.id=o.application_id and o.status in ('queued','sending') and (o.lease_until is null or o.lease_until<now())
  and o.kind in ('manual','followup') and (a.messages_stopped or (o.kind='followup' and (a.replied_at is not null or a.status in ('hired','rejected','withdrawn') or not p_followups)));
  update public.application_outbox set status='failed',last_error='retry_window_expired',lease_token=null,lease_until=null
  where status in ('queued','sending') and (first_attempt_at<=now()-interval '23 hours' or attempts>=6) and (lease_until is null or lease_until<now());
  return query with pending as (
    select id from public.application_outbox where status in ('queued','sending') and scheduled_at<=now() and next_attempt_at<=now()
    and (lease_until is null or lease_until<now()) and attempts<6 and (kind<>'followup' or p_followups)
    order by scheduled_at for update skip locked limit 10
  ) update public.application_outbox o set status='sending',lease_token=gen_random_uuid(),lease_until=now()+interval '5 minutes',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now())
  from pending where o.id=pending.id returning o.*;
end $$;
create function public.ats_prepare_message(p_id uuid,p_lease uuid,p_from text,p_internal text,p_reply_domain text,p_followups boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.application_outbox; a public.applications; dest text;
begin
  select * into o from public.application_outbox where id=p_id and lease_token=p_lease and lease_until>now() and status='sending' for update;
  if not found then return null; end if;
  select * into a from public.applications where id=o.application_id for update;
  if o.kind in ('manual','followup') and (a.messages_stopped or (o.kind='followup' and (not p_followups or a.replied_at is not null or a.status in ('hired','rejected','withdrawn')))) then
    update public.application_outbox set status='cancelled',last_error='application_stopped',lease_token=null,lease_until=null where id=o.id;
    return null;
  end if;
  -- Freeze complete provider payload so retries with the same key cannot change sender or reply routing.
  if o.provider_payload is null then
    dest:=case when o.kind='internal' then p_internal else o.recipient end;
    if coalesce(dest,'')='' then raise exception 'missing_recipient'; end if;
    o.provider_payload:=jsonb_build_object('from',p_from,'to',jsonb_build_array(dest),'subject',o.subject,'text',o.body);
    if o.kind<>'internal' and coalesce(p_reply_domain,'')<>'' then
      o.provider_payload:=o.provider_payload||jsonb_build_object('reply_to','applications+'||a.reply_token::text||'@'||p_reply_domain);
    end if;
    update public.application_outbox set provider_payload=o.provider_payload where id=o.id;
  end if;
  return o.provider_payload;
end $$;
create function public.ats_finish_message(p_id uuid,p_lease uuid,p_provider_id text,p_error text,p_retry_seconds integer default null)
returns void language plpgsql security definer set search_path = public as $$
declare o public.application_outbox;
begin
  select * into o from public.application_outbox where id=p_id and lease_token=p_lease and status='sending' for update;
  if not found then return; end if;
  if p_provider_id is not null then
    update public.application_outbox set status='accepted',provider_id=p_provider_id,sent_at=now(),last_error=null,lease_token=null,lease_until=null where id=p_id;
    -- Delivery webhooks can arrive before the send response is committed.
    update public.application_outbox set status='delivered',delivered_at=now() where id=p_id and exists(select 1 from public.application_webhook_events where provider_id=p_provider_id and event_type='email.delivered');
    update public.application_outbox set status='failed',last_error='provider_delivery_failed' where id=p_id and exists(select 1 from public.application_webhook_events where provider_id=p_provider_id and event_type in ('email.bounced','email.complained','email.failed','email.suppressed'));
    update public.applications set messages_stopped=true where id=o.application_id and o.kind<>'internal' and exists(select 1 from public.application_webhook_events where provider_id=p_provider_id and event_type in ('email.bounced','email.complained','email.suppressed'));
  else
    update public.application_outbox set status=case when p_retry_seconds is not null and attempts<6 and first_attempt_at>now()-interval '23 hours' then 'queued' else 'failed' end,
      next_attempt_at=now()+make_interval(secs=>coalesce(p_retry_seconds,0)),last_error=p_error,lease_token=null,lease_until=null where id=p_id;
  end if;
end $$;
create function public.ats_webhook(p_event_id text,p_event jsonb,p_reply_domain text) returns void
language plpgsql security definer set search_path = public as $$
declare recipient text; token uuid; appid bigint; typ text:=p_event->>'type'; provider text:=p_event->'data'->>'email_id';
begin
  insert into public.application_webhook_events(id,event_type,provider_id) values(p_event_id,typ,provider) on conflict do nothing;
  if not found then return; end if;
  if typ='email.received' and coalesce(p_reply_domain,'')<>'' then
    for recipient in select jsonb_array_elements_text(p_event->'data'->'to') loop
      if lower(recipient) ~ ('^applications\+[0-9a-f-]{36}@'||replace(lower(p_reply_domain),'.','\.')||'$') then
        token:=split_part(split_part(recipient,'@',1),'+',2)::uuid;
        update public.applications set replied_at=now() where reply_token=token returning id into appid;
        if appid is not null then
          insert into public.application_events(application_id,event_type,detail) values(appid,'reply_received','Inbound email received; future candidate follow-ups stopped.');
          update public.application_outbox set status='cancelled',last_error='candidate_replied' where application_id=appid and status='queued' and kind='followup';
        end if;
      end if;
    end loop;
  elsif typ in ('email.delivered','email.bounced','email.complained','email.failed','email.suppressed') then
    update public.application_outbox set status=case when typ='email.delivered' then 'delivered' else 'failed' end,
      delivered_at=case when typ='email.delivered' then now() else delivered_at end,
      last_error=case when typ='email.delivered' then null else typ end
    where provider_id=provider and status in ('accepted','delivered');
    if typ in ('email.bounced','email.complained','email.suppressed') then
      update public.applications set messages_stopped=true where id in (select application_id from public.application_outbox where provider_id=provider and kind<>'internal');
    end if;
  end if;
end $$;
-- Every sensitive RPC is service-only, including functions invoked by other RPCs.
do $$ declare f record; begin
  for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'ats_%' loop
    execute format('revoke execute on function %s from public,anon,authenticated',f.signature);
    execute format('grant execute on function %s to service_role',f.signature);
  end loop;
end $$;
-- The RLS helper requires execute, but accepts only the caller's authenticated identity from direct callers.
-- Replace its body to prevent testing another user's access through the exposed helper.
create or replace function public.ats_can_access(p_actor uuid,p_org uuid,p_edit boolean default false)
returns boolean language sql stable security definer set search_path=public as $$
  select (auth.role()='service_role' or p_actor=auth.uid()) and exists(select 1 from public.users u where u.id=p_actor and u.is_active and
    (exists(select 1 from public.application_platform_admins a where a.user_id=u.id)
    or (u.org_id=p_org and u.role in ('owner','admin','editor'))))
$$;
grant execute on function public.ats_can_access(uuid,uuid,boolean) to authenticated;

-- Preserve onboarding while preventing forged target IDs or reassignment of existing memberships.
create or replace function public.create_organization_and_user(org_name text,org_size text,org_industry text,user_id uuid,user_full_name text,user_email text)
returns uuid language plpgsql security definer set search_path='' as $$
declare current_uid uuid:=auth.uid(); existing_org uuid; new_org uuid; normalized_size text;
begin
  if current_uid is null or user_id is distinct from current_uid then raise exception 'User mismatch' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(current_uid::text, 1));
  select org_id into existing_org from public.users where id=current_uid;
  if found then return existing_org; end if;
  if nullif(trim(org_name),'') is null then raise exception 'Organization name is required'; end if;
  normalized_size:=case when org_size in ('1-50','51-200','201-1000','1000+') then org_size else '1-50' end;
  insert into public.organizations(name,size,industry) values(trim(org_name),normalized_size,coalesce(nullif(trim(org_industry),''),'Technology')) returning id into new_org;
  insert into public.users(id,org_id,full_name,email,role) values(current_uid,new_org,coalesce(nullif(trim(user_full_name),''),'User'),user_email,'admin');
  return new_org;
end $$;
revoke execute on function public.create_organization_and_user(text,text,text,uuid,text,text) from public,anon;
grant execute on function public.create_organization_and_user(text,text,text,uuid,text,text) to authenticated;
