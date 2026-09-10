// Real local PostgreSQL tests. No production records or external mail.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const modulePath = process.env.ATS_PGLITE_MODULE;
const uid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
test('historical import protects source, tenancy, idempotency and every outgoing message kind', { skip: !modulePath }, async () => {
  const { PGlite } = await import(modulePath); const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema storage;
      create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create function auth.role() returns text language sql as $$select current_setting('request.jwt.claim.role',true)$$;
      create table auth.users(id uuid primary key);
      create table public.organizations(id uuid primary key default gen_random_uuid(),name text,size text,industry text);
      create table public.users(id uuid primary key references auth.users,org_id uuid not null references organizations,full_name text not null,email text not null,role text,is_active boolean not null default true);
      create table public.roles(id uuid primary key,org_id uuid not null references organizations,title text,status text default 'active');
      create table public.jobs(id bigint generated always as identity primary key,title text not null);
      create table public.candidates(id uuid primary key default gen_random_uuid(),org_id uuid not null references organizations,role_id uuid not null references roles,full_name text not null,email text,phone text,location text,source text,pipeline_stage text default 'discovered' check(pipeline_stage in ('discovered','scored','voice_qualified','engaged','responded','scheduled','archived')),profile_data jsonb,created_at timestamptz default now(),updated_at timestamptz default now());
      create table public.applications(id bigint generated always as identity primary key,job_id bigint references jobs,first_name text not null,last_name text not null,email text not null,phone text,linkedin_url text,resume_url text,status text default 'pending',created_at timestamptz default now(),user_id uuid);
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;
      grant usage on schema public,auth,storage to anon,authenticated,service_role;
      grant select,insert,update,delete on all tables in schema public,storage to authenticated;
      create policy broad_storage_read on storage.objects for select to authenticated using(true);
      alter table public.users enable row level security;
      create policy self_update on public.users for all to authenticated using(auth.uid()=id) with check(auth.uid()=id);
    `);
    await db.exec(await readFile(new URL('../../supabase/migrations/20260909051734_candidate_ats_email_workflow.sql', import.meta.url), 'utf8'));
    await db.exec(`grant all on all tables in schema public,storage to service_role; grant all on all sequences in schema public to service_role;
      insert into auth.users values('${uid(1)}'),('${uid(2)}'),('${uid(3)}'),('${uid(4)}');
      insert into organizations(id) values('${uid(10)}'),('${uid(20)}');
      insert into public.users(id,org_id,full_name,email,role) values('${uid(1)}','${uid(10)}','Admin','admin@example.test','admin'),('${uid(2)}','${uid(20)}','Other','other@example.test','admin'),('${uid(3)}','${uid(10)}','Viewer','viewer@example.test','viewer'),('${uid(4)}','${uid(10)}','Platform','platform@example.test','owner');
      insert into roles values('${uid(11)}','${uid(10)}','Synthetic role','active'),('${uid(21)}','${uid(20)}','Other role','active');
      insert into jobs(title) values('Synthetic public job'),('Triage job');
      insert into application_platform_admins values('${uid(4)}');
      insert into storage.objects(bucket_id,name) values('application-resumes','secret.pdf'),('other','okay');
      set request.jwt.claim.role='service_role'; set role service_role;
    `);

    await db.exec('reset role');
    await db.exec(await readFile(new URL('../../supabase/migrations/20260910230212_historical_resume_import.sql', import.meta.url), 'utf8'));
    await db.exec('set role service_role');
    const rpc = async (fn, args) => (await db.query(`select public.${fn}(${args.map((_, i) => '$' + (i + 1)).join(',')}) as result`, args)).rows[0].result;
    const h = 'a'.repeat(64), path = `historical/${uid(10)}/${h}.pdf`;
    const payload = { first_name: 'Synthetic', last_name: null, email: null, batch: 'test', upload_sha256: h, original_sha256: h,
      sources: [{url:'https://mail.google.com/mail/u/0/#all/synthetic', message_id:'synthetic'}], notes:['Verified synthetic résumé'], flags:['missing_candidate_email'] };
    const ingest = (actor=1, p=payload, object=path) => rpc('ats_import_resume', [uid(actor), JSON.stringify(p), object, 'resume.pdf']);
    assert.equal(await rpc('ats_import_scope', [uid(1)]), uid(10));
    await assert.rejects(rpc('ats_import_scope', [uid(3)]), /forbidden/);
    await assert.rejects(ingest(), /invalid_upload/);
    await db.query('insert into storage.objects(bucket_id,name) values($1,$2)', ['application-resumes', path]);
    await assert.rejects(ingest(3), /forbidden/);
    await assert.rejects(ingest(2), /invalid_upload/, 'cannot import into another organization');
    for (const field of ['job_id','role_id','consent_at','questionnaire','org_id']) {
      await assert.rejects(ingest(1, {...payload, [field]: 'invented'}), /invalid_historical_metadata/);
    }
    await assert.rejects(ingest(1, {...payload, flags:['identity_requires_review']}), /invalid_historical_review/);
    const result = await ingest(); assert.equal(result.status, 'imported');
    assert.equal((await ingest()).id, result.id); assert.equal((await ingest()).status,'existing');
    const row = (await db.query('select * from applications')).rows[0];
    for (const field of ['job_id','role_id','candidate_id','consent_at','consent_version','questionnaire','questionnaire_version','email','last_name']) assert.equal(row[field],null,field);
    assert.equal(row.messages_stopped,true);
    assert.equal((await db.query('select count(*)::int n from application_outbox')).rows[0].n,0);
    assert.equal((await db.query('select count(*)::int n from application_events')).rows[0].n,1,'retries do not create duplicate audit events');
    const source2 = {url:'https://drive.google.com/file/d/synthetic/view', file_id:'synthetic'};
    await ingest(1,{...payload,sources:[...payload.sources,source2]});
    await ingest(1,{...payload,sources:[source2,...payload.sources]});
    assert.equal((await db.query('select historical_metadata from applications')).rows[0].historical_metadata.sources.length,2);
    await assert.rejects(ingest(1,{...payload,first_name:'Different'}),/import_identity_conflict/);
    assert.equal((await db.query('select count(*)::int n from applications')).rows[0].n,1);
    for (const kind of ['acknowledgment','internal','manual','followup']) {
      await assert.rejects(db.query('insert into application_outbox(application_id,event_key,kind,subject,body) values($1,$2,$3,$4,$5)',[result.id,kind,kind,'Synthetic','Synthetic']), /messages_stopped/, kind);
    }
    await assert.rejects(db.query('update applications set messages_stopped=false where id=$1',[result.id]), /applications_historical_integrity/);
    await assert.rejects(db.query('update applications set historical_resume_sha256=null,historical_metadata=null where id=$1',[result.id]), /invalid_historical_mutation/);
    const otherHash='b'.repeat(64), otherPath=`historical/${uid(10)}/${otherHash}.pdf`;
    await db.query('insert into storage.objects(bucket_id,name) values($1,$2)', ['application-resumes',otherPath]);
    assert.equal((await ingest(1,{...payload,upload_sha256:otherHash},otherPath)).status,'imported','distinct versions preserved');
    assert.equal((await db.query('select count(*)::int n from candidates')).rows[0].n,0,'no job matches invented');
    assert.equal((await rpc('ats_application_page',[uid(2),null])).applications.length,0);
    assert.equal((await rpc('ats_application_page',[uid(3),null])).applications.length,0);
    const page=await rpc('ats_application_page',[uid(1),null]); assert.equal(page.applications.length,2);
    assert.equal((await rpc('ats_application_page',[uid(1),page.applications[0].id])).applications.length,1);
    assert.match(page.applications[0].job_title,/Historical/);
    await db.exec('reset role; set role authenticated');
    await assert.rejects(ingest(),/permission denied/);
    await assert.rejects(rpc('ats_import_scope',[uid(1)]),/permission denied/);
    await assert.rejects(rpc('ats_application_page',[uid(1),null]),/permission denied/);
  } finally { await db.close(); }
});
