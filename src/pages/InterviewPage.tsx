import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { interviewRequest } from '../lib/interviews';
import '../styles/applications.css';
import '../styles/interviews.css';
interface Session { state:string;job_title:string;deadline:string|null;server_now:string;questions:string[];answered:number[]; }
const stamp=(seconds:number)=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
export default function InterviewPage(){
 const [token]=useState(()=>{
  const hash=window.location.hash.slice(1);
  if(/^[a-f0-9]{64}$/.test(hash)){sessionStorage.setItem('alivio-interview',hash);history.replaceState(null,'',location.pathname);return hash;}
  return sessionStorage.getItem('alivio-interview')||'';
 });
 const [session,setSession]=useState<Session|null>(null),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [stream,setStream]=useState<MediaStream|null>(null),[recording,setRecording]=useState(false),[clip,setClip]=useState<Blob|null>(null),[preview,setPreview]=useState(''),[remaining,setRemaining]=useState(1800),[answerSeconds,setAnswerSeconds]=useState(0);
 const camera=useRef<HTMLVideoElement>(null),recorder=useRef<MediaRecorder|null>(null),upload=useRef<{path:string;token:string}|null>(null),recordStarted=useRef(0),localDeadline=useRef<number|null>(null),liveStream=useRef<MediaStream|null>(null);
 const mime=useRef('video/webm');
 function accept(next:Session){setSession(next);if(next.deadline){localDeadline.current=performance.now()+Math.max(0,Date.parse(next.deadline)-Date.parse(next.server_now));setRemaining(Math.max(0,Math.ceil((localDeadline.current-performance.now())/1000)));}}
 useEffect(()=>{
  document.title='Private AI video interview | Alivio Search Partners';
  const robots=document.createElement('meta');robots.name='robots';robots.content='noindex,nofollow';document.head.append(robots);
  const referrer=document.createElement('meta');referrer.name='referrer';referrer.content='no-referrer';document.head.append(referrer);
  let active=true;
  interviewRequest<Session>({action:'info',token}).then(s=>{if(active)accept(s);}).catch(e=>{if(active)setError(e.message);});
  return()=>{active=false;robots.remove();referrer.remove();if(recorder.current&&recorder.current.state!=='inactive'){recorder.current.onstop=null;recorder.current.stop();}liveStream.current?.getTracks().forEach(t=>t.stop());window.speechSynthesis?.cancel();};
 },[token]);
 useEffect(()=>{if(camera.current)camera.current.srcObject=stream;},[stream]);
 useEffect(()=>{if(!clip){setPreview('');return;}const url=URL.createObjectURL(clip);setPreview(url);return()=>URL.revokeObjectURL(url);},[clip]);
 useEffect(()=>{const timer=setInterval(()=>{
  const seconds=localDeadline.current===null?1800:Math.max(0,Math.ceil((localDeadline.current-performance.now())/1000));setRemaining(seconds);
  if(recorder.current?.state==='recording'){
   const elapsed=Math.floor((performance.now()-recordStarted.current)/1000);setAnswerSeconds(elapsed);
   if(seconds===0||elapsed>=180)recorder.current.stop();
  }
  if(seconds===0){liveStream.current?.getTracks().forEach(t=>t.stop());window.speechSynthesis?.cancel();}
 },250);return()=>clearInterval(timer);},[]);
 useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(recording||clip){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[recording,clip]);
 async function enableCamera(){
  setBusy(true);setError('');
  try{
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('This browser does not support video recording. Please choose a human interview or use a current desktop browser.');
   const type=['video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(t=>MediaRecorder.isTypeSupported(t));
   if(!type)throw new Error('Video recording is unavailable in this browser. Please choose a human interview.');
   mime.current=type;
   const media=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480}},audio:true});
   liveStream.current=media;
   try{const s=await interviewRequest<Session>({action:'start',token,consent:true});accept(s);if(s.state!=='in_progress')throw new Error('This session has ended. You may request a human interview.');}
   catch(e){media.getTracks().forEach(t=>t.stop());throw e;}
   setStream(media);
  }catch(e){setError(e instanceof Error?e.message:'Camera or microphone access was unavailable.');}finally{setBusy(false);}
 }
 const index=session?.answered.length||0;
 async function record(){
  if(!stream||remaining<=0)return;
  setBusy(true);setError('');
  try{
   const reservation=await interviewRequest<{path:string;token:string}|{recovered:Session}>({action:'upload',token,index,type:mime.current.split(';')[0]});
   if('recovered' in reservation){accept(reservation.recovered);return;}
   upload.current=reservation;
   const chunks:BlobPart[]=[];let size=0;
   const r=new MediaRecorder(stream,{mimeType:mime.current,videoBitsPerSecond:350000,audioBitsPerSecond:32000});
   r.ondataavailable=e=>{if(e.data.size){chunks.push(e.data);size+=e.data.size;if(size>14*1024*1024&&r.state==='recording')r.stop();}};
   r.onstop=()=>{setRecording(false);if(!size){setError('No audio or video was recorded. Please try again or request a human interview.');return;}setClip(new Blob(chunks,{type:mime.current.split(';')[0]}));};
   r.onerror=()=>setError('Recording stopped unexpectedly. Review your answer or choose a human interview.');
   recorder.current=r;recordStarted.current=performance.now();setAnswerSeconds(0);setClip(null);r.start(1000);setRecording(true);
  }catch(e){setError(e instanceof Error?e.message:'Unable to record.');}finally{setBusy(false);}
 }
 async function save(){
  if(!clip||!upload.current)return;
  setBusy(true);setError('');
  try{
   const result=await supabase.storage.from('application-interviews').uploadToSignedUrl(upload.current.path,upload.current.token,clip,{contentType:clip.type});
   // A timed-out upload may already exist. The server verifies it before advancing.
   try{accept(await interviewRequest<Session>({action:'confirm',token,index}));}catch(e){if(result.error)throw new Error('Upload did not finish. Your recording is still here; retry Save answer.');throw e;}
   setClip(null);upload.current=null;
   if(index===7){accept(await interviewRequest<Session>({action:'finish',token}));liveStream.current?.getTracks().forEach(t=>t.stop());window.speechSynthesis?.cancel();}
  }catch(e){setError(e instanceof Error?e.message:'Unable to save. Your recording is still available to retry.');}finally{setBusy(false);}
 }
 async function human(){
  setBusy(true);setError('');
  try{await interviewRequest({action:'human',token});if(recorder.current?.state==='recording'){recorder.current.onstop=null;recorder.current.stop();}liveStream.current?.getTracks().forEach(t=>t.stop());window.speechSynthesis?.cancel();setSession(s=>s?{...s,state:'human_requested'}:s);setClip(null);}
  catch(e){setError(e instanceof Error?e.message:'Unable to send your request.');}finally{setBusy(false);}
 }
 function speak(){if(!session?.questions[index])return;window.speechSynthesis?.cancel();window.speechSynthesis?.speak(new SpeechSynthesisUtterance(session.questions[index]));}
 const active=session?.state==='in_progress',terminal=session&&['completed','human_requested'].includes(session.state);
 return <main className="ats-page interview-page">
 <p className="ats-eyebrow">Alivio Search Partners · Private interview</p><h1>Your AI-guided video interview</h1>
 {session&&<p className="interview-role">{session.job_title}</p>}
 {error&&<div className="ats-alert" role="alert">{error}</div>}
 {!session&&!error&&<p role="status">Opening your private interview…</p>}
 {session?.state==='completed'&&<section className="ats-panel"><h2>Thank you. Your answers are saved.</h2><p>A recruiter will review your answers and contact you about next steps. This interview does not make a hiring decision.</p></section>}
 {session?.state==='human_requested'&&<section className="ats-panel"><h2>Your human-interview request is saved.</h2><p>Our recruiting team will contact you. Choosing a human interview does not count against your application.</p></section>}
 {session&&!terminal&&<>
 <section className="ats-panel"><h2>Before you begin</h2><p>AI generated eight questions about the role. A synthetic voice can read them aloud. You will record video answers for a recruiter to review. This is a structured interview, with up to three minutes per answer and a maximum of 30 minutes total.</p><p>With your consent, your camera and microphone record only while an answer is in progress. Recordings are stored privately for up to 30 days. A person reviews your answers; we do not analyze facial expressions, emotion, appearance, or accent. You can stop and request a human interview at any point.</p><p>Use a quiet place and a stable connection. The timer continues if you reload or leave. Unsaved recordings are lost if you close this page.</p><p><a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy information</a> · <a href="mailto:hello@aliviosearchpartners.com">Request help or deletion</a></p>
 {!active&&session.state==='invited'&&<label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I consent to AI-generated questions and the recording and storage of my video answers for recruiter review.</label>}
 <div className="interview-actions">{!stream&&['invited','in_progress'].includes(session.state)&&<button className="ats-primary" disabled={busy||(!active&&!consent)||remaining<=0} onClick={()=>void enableCamera()}>{active?'Enable camera and resume':'Start 30-minute interview'}</button>}<button disabled={busy} onClick={()=>void human()}>Request a human interview instead</button></div></section>
 {(active||session.state==='expired')&&<section className="ats-panel"><div className="interview-timer" role="timer" aria-label="Interview time remaining">{stamp(remaining)} remaining</div>
 {(remaining<=0||session.state==='expired')&&<p role="status">The 30-minute interview has ended. You can finish uploading an answer already recorded for five minutes after the deadline, or request a human interview.</p>}
 {index<8&&<><h2>Question {index+1} of 8</h2><p className="interview-question">{session.questions[index]||'No further questions are available.'}</p><button disabled={recording||remaining<=0||!session.questions[index]} onClick={speak}>Read question aloud</button></>}
 <video ref={camera} autoPlay muted playsInline aria-label="Your camera preview" hidden={!stream||!!clip}/>
 {preview&&<video src={preview} controls playsInline aria-label="Review your recorded answer"/>}
 {recording&&<p role="status">Recording · {stamp(answerSeconds)} / 3:00</p>}
 <div className="interview-actions">{recording?<button onClick={()=>recorder.current?.stop()}>Stop recording</button>:!clip&&index<8?<button className="ats-primary" disabled={busy||!stream||remaining<=0} onClick={()=>void record()}>Record answer</button>:null}
 {clip&&<button className="ats-primary" disabled={busy} onClick={()=>void save()}>{busy?'Saving…':'Save answer and continue'}</button>}
 {clip&&remaining>0&&<button disabled={busy} onClick={()=>setClip(null)}>Discard and record again</button>}
 {index===8&&session.state!=='completed'&&<button disabled={busy} onClick={()=>{setBusy(true);void interviewRequest<Session>({action:'finish',token}).then(accept).catch(e=>setError(e.message)).finally(()=>setBusy(false));}}>Finish interview</button>}
 </div><p>{index} of 8 answers saved. Uploads may take a moment.</p></section>}
 </>}
 </main>;
}
