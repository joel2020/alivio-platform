import { requireAuth } from '../_shared/auth.ts';
import { ApplicationError, boundedText, readBoundedBody, sha256 } from '../_shared/application-validation.ts';
import { adminClient, emailReady, failure, json, rpcError, enqueueWorker } from '../_shared/application-runtime.ts';

const BUCKET = 'application-interviews';
Deno.serve(async (req: Request) => {
 if (req.method === 'OPTIONS') return json(req, { ok: true });
 if (req.method !== 'POST') return json(req, { error: 'Method not allowed.' }, 405);
 try {
  const db = adminClient();
  const body = JSON.parse(new TextDecoder().decode(await readBoundedBody(req, 12000)));
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApplicationError('Invalid request.');
  const action = String(body.action);
  if (['detail','approve','retry','recording'].includes(action)) {
   const user = await requireAuth(req);
   if (!Number.isSafeInteger(body.id) || body.id < 1) throw new ApplicationError('Invalid application.');
   const rate = await db.rpc('ats_rate_limit', { p_key: `interview:recruiter:${user.id}`, p_limit: 120, p_seconds: 3600 }); rpcError(rate.error);
   if (!rate.data) throw new ApplicationError('Too many requests. Try again later.',429);
   if (action==='approve' && (!emailReady() || Deno.env.get('APPLICATION_AI_INTERVIEWS_ENABLED')!=='true')) throw new ApplicationError('Interview invitations are not activated.',503);
   const reason = action==='approve' ? boundedText(body.reason,'review explanation',2000) : '';
   if (action==='approve' && reason.trim().length<20) throw new ApplicationError('Explain your review of the résumé evidence and questions in at least 20 characters.');
   const token = action==='approve' ? [...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('') : '';
   const result = await db.rpc('ats_interview_admin',{ p_actor:user.id,p_id:body.id,p_action:action==='recording'?'detail':action,
    p_reason:reason,p_hash:token ? await sha256(token) : '',p_link:token?`https://aliviosearchpartners.com/client/interview#${token}`:'' }); rpcError(result.error);
   if (action==='recording') {
    if (!Number.isInteger(body.index) || body.index<0 || body.index>7) throw new ApplicationError('Invalid answer.');
    const answer=await db.from('application_interview_answers').select('path,confirmed_at').eq('application_id',body.id).eq('question_index',body.index).maybeSingle(); rpcError(answer.error);
    if (!answer.data?.confirmed_at) throw new ApplicationError('This recording is unavailable or has expired.',404);
    const signed=await db.storage.from(BUCKET).createSignedUrl(answer.data.path,60); rpcError(signed.error);
   if (!signed.data) throw new Error('storage_url_unavailable');
    return json(req,{ data:{url:signed.data.signedUrl} });
   }
   if (action==='approve' || action==='retry') enqueueWorker();
   return json(req,{data:result.data});
  }
  if (!['info','start','human','upload','confirm','finish'].includes(action) || typeof body.token!=='string' || !/^[a-f0-9]{64}$/.test(body.token)) throw new ApplicationError('Invalid interview link.',404);
  if (action==='start' && body.consent!==true) throw new ApplicationError('Please consent to AI questions and video recording before starting.');
  if (['upload','confirm'].includes(action) && (!Number.isInteger(body.index) || body.index<0 || body.index>7)) throw new ApplicationError('Invalid answer.');
  if (action==='upload' && !['video/webm','video/mp4'].includes(body.type)) throw new ApplicationError('Unsupported recording format.');
  const hash=await sha256(body.token), ip=await sha256(`${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}:${req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown'}`);
  const limited=await db.rpc('ats_rate_limit',{p_key:`interview:ip:${ip}`,p_limit:120,p_seconds:60}); rpcError(limited.error);
  const rate=await db.rpc('ats_rate_limit',{p_key:`interview:token:${hash}`,p_limit:60,p_seconds:60}); rpcError(rate.error);
  if (!limited.data || !rate.data) throw new ApplicationError('Too many requests. Try again shortly.',429);
  const invoke = async (operation:string) => {
   const r=await db.rpc('ats_interview_session',{p_hash:hash,p_action:operation,p_index:body.index??null,p_type:body.type??null});
   if (r.error?.message.startsWith('invalid_')) throw new ApplicationError('This interview link or session is unavailable. Contact hello@aliviosearchpartners.com for help.',409);
   rpcError(r.error);return r.data;
  };
  if (action==='confirm') {
   const answer=await invoke('answer');
   if (!answer?.path) throw new ApplicationError('Start this answer before uploading.',409);
   const slash=answer.path.lastIndexOf('/');
   const files=await db.storage.from(BUCKET).list(answer.path.slice(0,slash),{search:answer.path.slice(slash+1),limit:10}); rpcError(files.error);
   const file=files.data?.find((f:{name:string})=>f.name===answer.path.slice(slash+1));
   if (!file || !file.metadata?.size || Number(file.metadata.size)>15728640 || file.metadata.mimetype!==answer.content_type) throw new ApplicationError('The recording has not finished uploading. Retry the upload.',409);
  }
  const result=await invoke(action);
  if (action==='upload') {
   // Recover an upload that finished before a browser reload or an uncertain response.
   const slash=result.path.lastIndexOf('/');
   const files=await db.storage.from(BUCKET).list(result.path.slice(0,slash),{search:result.path.slice(slash+1),limit:10}); rpcError(files.error);
   const existing=files.data?.find((f:{name:string})=>f.name===result.path.slice(slash+1));
   if(existing?.metadata?.size && Number(existing.metadata.size)<=15728640 && existing.metadata.mimetype===result.content_type)
    return json(req,{data:{recovered:await invoke('confirm')}});
   const signed=await db.storage.from(BUCKET).createSignedUploadUrl(result.path,{upsert:false});rpcError(signed.error);
   if (!signed.data) throw new Error('storage_url_unavailable');
   return json(req,{data:{path:result.path,token:signed.data.token}});
  }
  return json(req,{data:result});
 } catch(error) {
  if (error instanceof SyntaxError) return json(req,{error:'Invalid request.'},400);
  return failure(req,error);
 }
});
