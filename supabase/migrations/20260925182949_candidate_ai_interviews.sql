alter table public.application_outbox drop constraint application_outbox_kind_check;
alter table public.application_outbox add constraint application_outbox_kind_check check(kind in ('acknowledgment','internal','manual','followup','interview'));
-- New applications only. Existing acknowledgement outbox remains the source of truth.
create table public.application_ai_reviews (
 application_id bigint primary key references public.applications(id) on delete cascade,
 job_snapshot text not null,
 state text not null default 'queued' check(state in ('queued','processing','review','manual_review','invited','in_progress','completed','human_requested','expired')),
 attempts integer not null default 0, lease_token uuid, lease_until timestamptz,
 score integer check(score between 0 and 10), rubric jsonb, assessment jsonb, model text, prompt_version text,
 last_error text, created_at timestamptz not null default now(), assessed_at timestamptz,
 approved_by uuid references auth.users(id), approved_at timestamptz, approval_reason text,
 token_hash text unique, invite_expires_at timestamptz, consent_at timestamptz,
 started_at timestamptz, deadline timestamptz, completed_at timestamptz,
 check ((score is null) = (assessment is null)),
 check (deadline is null or deadline = started_at + interval '30 minutes')
);
create index application_ai_queue on public.application_ai_reviews(state,created_at);
create table public.application_job_rubrics (snapshot_hash text primary key, rubric jsonb not null, created_at timestamptz not null default now());
create table public.application_interview_answers (
 application_id bigint not null references public.application_ai_reviews(application_id) on delete cascade,
 question_index integer not null check(question_index between 0 and 7),
 path text not null unique, content_type text not null check(content_type in ('video/webm','video/mp4')),
 confirmed_at timestamptz, created_at timestamptz not null default now(),
 primary key(application_id,question_index)
);
create table public.application_interview_cleanup(path text primary key);
create function public.ats_queue_recording_cleanup() returns trigger language plpgsql security definer set search_path=public as $$begin
 insert into public.application_interview_cleanup(path) values(old.path) on conflict do nothing;return old;end $$;
create trigger ats_queue_recording_cleanup before delete on public.application_interview_answers for each row execute function public.ats_queue_recording_cleanup();
do $$declare t text;begin
 foreach t in array array['application_ai_reviews','application_job_rubrics','application_interview_answers','application_interview_cleanup'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('application-interviews','application-interviews',false,15728640,array['video/webm','video/mp4']);
create policy ats_private_interview_boundary on storage.objects as restrictive for all to anon,authenticated
using(bucket_id <> 'application-interviews') with check(bucket_id <> 'application-interviews');

create function public.ats_queue_assessment() returns trigger language plpgsql security definer set search_path=public as $$
declare j jsonb;begin
 if new.resume_path is null then return new; end if;
 select to_jsonb(jobs) into j from public.jobs where id=new.job_id;
 insert into public.application_ai_reviews(application_id,job_snapshot) values(new.id,
  concat_ws(E'\n',j->>'title',j->>'description',j->>'responsibilities',j->>'qualifications'));
 return new;
end $$;
create trigger ats_queue_assessment after insert on public.applications for each row execute function public.ats_queue_assessment();

create function public.ats_claim_assessments() returns setof public.application_ai_reviews
language plpgsql security definer set search_path=public as $$
begin
 update public.application_ai_reviews set state='manual_review',last_error='assessment_retry_limit' where state='processing' and lease_until<now() and attempts>=3;
 return query update public.application_ai_reviews r set state='processing',attempts=attempts+1,lease_token=gen_random_uuid(),lease_until=now()+interval '5 minutes'
 where application_id in (select q.application_id from public.application_ai_reviews q join public.applications a on a.id=q.application_id
 where (q.state='queued' or (q.state='processing' and q.lease_until<now() and q.attempts<3)) and a.status not in ('rejected','withdrawn','hired')
 order by q.created_at for update of q skip locked limit 2) returning r.*;
end $$;

create function public.ats_interview_admin(p_actor uuid,p_id bigint,p_action text,p_reason text default '',p_hash text default '',p_link text default '')
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.applications; r public.application_ai_reviews;
begin
 select * into a from public.applications where id=p_id for update;
 if not found or not public.ats_can_access(p_actor,a.org_id,p_action<>'detail') then raise exception 'forbidden' using errcode='42501'; end if;
 select * into r from public.application_ai_reviews where application_id=p_id for update;
 if not found then return null; end if;
 if p_action='detail' then return jsonb_build_object('review',to_jsonb(r)-'token_hash'-'lease_token',
 'answers',coalesce((select jsonb_agg(jsonb_build_object('question_index',question_index,'confirmed_at',confirmed_at) order by question_index)
 from public.application_interview_answers where application_id=p_id and confirmed_at is not null),'[]'::jsonb)); end if;
 if p_action='retry' then
  if r.state not in ('manual_review','review') then raise exception 'invalid_state'; end if;
  update public.application_ai_reviews set state='queued',attempts=0,score=null,assessment=null,last_error=null where application_id=p_id;
 elsif p_action='approve' then
  if r.state in ('invited','in_progress','completed') then return jsonb_build_object('ok',true); end if;
  if r.state<>'review' or r.score is null or r.rubric is null then raise exception 'invalid_state'; end if;
  if a.messages_stopped or a.status in ('rejected','withdrawn','hired') then raise exception 'messages_stopped'; end if;
  if length(trim(p_reason))<20 or length(p_reason)>2000 or p_hash !~ '^[a-f0-9]{64}$' or
    p_link !~ '^https://aliviosearchpartners[.]com/client/interview#[a-f0-9]{64}$' then raise exception 'invalid_approval'; end if;
  update public.application_ai_reviews set state='invited',approved_by=p_actor,approved_at=now(),approval_reason=p_reason,
   token_hash=p_hash,invite_expires_at=now()+interval '7 days' where application_id=p_id;
  insert into public.application_outbox(application_id,event_key,kind,recipient,subject,body)
  values(p_id,'ai-interview:'||p_id,'interview',a.email,'Your AI video interview — Alivio Search Partners',
   'Hi '||a.first_name||E',\n\nOur recruiting team has reviewed your application and invites you to an AI-guided video interview. It includes eight role-related questions read by a synthetic voice, with recorded video answers reviewed by a person. Allow up to 30 minutes. You can choose a human interview instead, without penalty.\n\nOpen your private link within seven days:\n'||p_link||E'\n\nPlease do not share this link. The interview explains recording and privacy before you begin. Reply to this email or contact hello@aliviosearchpartners.com for help.\n\nThank you,\nAlivio Search Partners') on conflict(event_key) do nothing;
  insert into public.application_events(application_id,actor_id,event_type,detail)
   values(p_id,p_actor,'ai_interview_approved','Human review completed. Score '||r.score||'/10. Reason: '||p_reason);
 else raise exception 'invalid_action'; end if;
 return jsonb_build_object('ok',true);
end $$;

create function public.ats_interview_session(p_hash text,p_action text,p_index integer default null,p_type text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.application_ai_reviews; a public.applications; answer public.application_interview_answers; n integer;
begin
 select * into r from public.application_ai_reviews where token_hash=p_hash for update;
 if not found or r.approved_by is null or r.invite_expires_at<now() then raise exception 'invalid_interview_link'; end if;
 select * into a from public.applications where id=r.application_id;
 if a.messages_stopped or a.status in ('rejected','withdrawn','hired') then raise exception 'invalid_interview_link'; end if;
 if p_action='human' then
  if r.state in ('invited','in_progress','expired') then
   update public.application_ai_reviews set state='human_requested' where application_id=r.application_id;
   update public.applications set next_action='Candidate requested a human interview',next_action_at=now() where id=r.application_id;
   insert into public.application_events(application_id,event_type,detail) values(r.application_id,'human_interview_requested','Candidate chose a human interview; do not penalize this choice.');
  end if;
  return jsonb_build_object('state','human_requested');
 end if;
 if r.state not in ('invited','in_progress','completed','expired','human_requested') then raise exception 'invalid_interview_link'; end if;
 if r.state='in_progress' and r.deadline<=now() then
  update public.application_ai_reviews set state='expired' where application_id=r.application_id;
  r.state:='expired';
 end if;
 if p_action='start' and r.state='invited' then
  update public.application_ai_reviews set state='in_progress',consent_at=now(),started_at=now(),deadline=now()+interval '30 minutes'
   where application_id=r.application_id returning * into r;
 elsif p_action='upload' then
  if r.state<>'in_progress' or p_index is null or p_index not between 0 and 7 or p_type is null or p_type not in ('video/webm','video/mp4') then raise exception 'invalid_interview_session'; end if;
  select count(*) into n from public.application_interview_answers where application_id=r.application_id and confirmed_at is not null;
  if p_index<>n then raise exception 'invalid_question_order'; end if;
  insert into public.application_interview_answers(application_id,question_index,path,content_type)
   values(r.application_id,p_index,r.application_id||'/'||gen_random_uuid()||case when p_type='video/mp4' then '.mp4' else '.webm' end,p_type)
   on conflict(application_id,question_index) do nothing;
  select * into answer from public.application_interview_answers where application_id=r.application_id and question_index=p_index;
  if answer.content_type<>p_type then raise exception 'invalid_recording_type'; end if;
  return to_jsonb(answer);
 elsif p_action='confirm' then
  -- An answer started before the cutoff has five minutes to finish uploading. No more questions may start.
  if r.state not in ('in_progress','expired') or r.deadline+interval '5 minutes'<now() then raise exception 'invalid_interview_session'; end if;
  update public.application_interview_answers set confirmed_at=coalesce(confirmed_at,now()) where application_id=r.application_id and question_index=p_index;
 elsif p_action='finish' then
  select count(*) into n from public.application_interview_answers where application_id=r.application_id and confirmed_at is not null;
  if n<>8 then raise exception 'invalid_incomplete_interview'; end if;
  update public.application_ai_reviews set state='completed',completed_at=coalesce(completed_at,now()) where application_id=r.application_id and state in ('in_progress','expired','completed') returning * into r;
 elsif p_action not in ('info','start','answer') then raise exception 'invalid_action'; end if;
 if p_action='answer' then
  if r.state not in ('in_progress','expired') or r.deadline+interval '5 minutes'<now() then raise exception 'invalid_interview_session'; end if;
  select * into answer from public.application_interview_answers where application_id=r.application_id and question_index=p_index;
  return to_jsonb(answer);
 end if;
 return jsonb_build_object('state',r.state,'server_now',now(),'job_title',split_part(r.job_snapshot,E'\n',1),'deadline',r.deadline,
 'questions',case when r.consent_at is not null and r.state='in_progress' then r.rubric->'questions' else '[]'::jsonb end,
 'answered',coalesce((select jsonb_agg(question_index order by question_index) from public.application_interview_answers where application_id=r.application_id and confirmed_at is not null),'[]'::jsonb));
end $$;

do $$declare signature text;begin
 foreach signature in array array['ats_queue_recording_cleanup()','ats_queue_assessment()','ats_claim_assessments()','ats_interview_admin(uuid,bigint,text,text,text,text)','ats_interview_session(text,text,integer,text)'] loop
  execute 'revoke all on function public.'||signature||' from public,anon,authenticated';
  execute 'grant execute on function public.'||signature||' to service_role';
 end loop;
end $$;

-- Re-check withdrawal and opt-out immediately before provider delivery.
create or replace function public.ats_prepare_message(p_id uuid,p_lease uuid,p_from text,p_internal text,p_reply_domain text,p_followups boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.application_outbox; a public.applications; dest text;
begin
  select * into o from public.application_outbox where id=p_id and lease_token=p_lease and lease_until>now() and status='sending' for update;
  if not found then return null; end if;
  select * into a from public.applications where id=o.application_id for update;
  if o.kind in ('manual','followup','interview') and (a.messages_stopped or (o.kind='followup' and (not p_followups or a.replied_at is not null or a.status in ('hired','rejected','withdrawn'))) or (o.kind='interview' and (a.status in ('hired','rejected','withdrawn') or not exists(select 1 from public.application_ai_reviews r where r.application_id=a.id and r.state='invited' and r.invite_expires_at>now())))) then
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
