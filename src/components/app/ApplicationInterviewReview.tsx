import { useEffect, useState } from 'react';
import { INTERVIEW_THRESHOLD } from '../../../supabase/functions/_shared/interview-assessment';
import { interviewRequest } from '../../lib/interviews';
interface Review {
 review: { state:string;score:number|null;last_error:string|null;job_snapshot:string;approval_reason:string|null;
  rubric:{criteria:{requirement:string;job_quote:string}[];questions:string[]}|null;
  assessment:{items:{status:string;evidence:string;explanation:string}[]}|null; };
 answers:{question_index:number;confirmed_at:string}[];
}
export default function ApplicationInterviewReview({id,onChange}:{id:number;onChange:(notice:string)=>void}){
 const [data,setData]=useState<Review|null>(null),[error,setError]=useState(''),[reason,setReason]=useState(''),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;setData(null);interviewRequest<Review|null>({action:'detail',id}).then(d=>{if(active)setData(d);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[id,revision]);
 async function action(action:string){setBusy(true);setError('');try{await interviewRequest({action,id,reason});setRevision(v=>v+1);onChange(action==='approve'?'Invitation queued. Check communication history for delivery status.':'Assessment queued. Refresh after processing.');}catch(e){setError(e instanceof Error?e.message:'Unable to save.');}finally{setBusy(false);}}
 async function recording(index:number){setBusy(true);setError('');try{const {url}=await interviewRequest<{url:string}>({action:'recording',id,index});if(new URL(url).protocol!=='https:')throw new Error('Invalid recording URL.');const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noreferrer noopener';a.click();}catch(e){setError(e instanceof Error?e.message:'Unable to open recording.');}finally{setBusy(false);}}
 const r=data?.review;
 return <section className="ats-panel"><h3>AI résumé assessment & video interview</h3>
 <p>Decision support for your review. Missing résumé evidence is not proof of missing ability. No applicant is automatically rejected.</p>
 {error&&<p role="alert">{error}</p>}
 {!r&&!error&&<p>No assessment yet. Automatic assessments apply to new applications after activation.</p>}
 {r&&<><p><strong>{r.score===null?'No verified score':`${r.score}/10`}</strong> · {r.state.replace(/_/g,' ')}{r.state==='review'&&r.score!==null&&r.score>=INTERVIEW_THRESHOLD?' · Recommended for interview review':''}</p>
 {r.last_error&&<p>{r.last_error}</p>}
 <details><summary>Job posting used for this assessment</summary><p style={{whiteSpace:'pre-wrap'}}>{r.job_snapshot}</p></details>
 {r.rubric&&<><ol>{r.rubric.criteria.map((c,i)=><li key={i}><strong>{c.requirement}</strong><p>Job requirement: {c.job_quote}</p><p>{r.assessment?.items[i]?.status.replace(/_/g,' ')} — {r.assessment?.items[i]?.explanation}</p>{r.assessment?.items[i]?.evidence&&<blockquote>{r.assessment.items[i].evidence}</blockquote>}</li>)}</ol>
 <details open={r.state==='review'}><summary>Review the eight AI-generated questions</summary><ol>{r.rubric.questions.map(q=><li key={q}>{q}</li>)}</ol></details></>}
 {r.state==='review'&&<><label>Human review explanation<textarea value={reason} onChange={e=>setReason(e.target.value)} minLength={20} maxLength={2000} rows={3} placeholder="Explain the job-related evidence you verified and confirm that the interview questions are appropriate." /></label><p>{r.score!==null&&r.score<INTERVIEW_THRESHOLD?'This score is below 8/10. You can document a human override.':'Verify the evidence and questions before approving.'}</p><button className="ats-primary" disabled={busy||reason.trim().length<20} onClick={()=>void action('approve')}>Approve and send interview invitation</button></>}
 {['review','manual_review'].includes(r.state)&&<button disabled={busy} onClick={()=>void action('retry')}>Retry assessment</button>}
 {r.approval_reason&&<p>Reviewer explanation: {r.approval_reason}</p>}
 {!!data.answers.length&&<><h4>Private answer recordings</h4><p>Recordings expire 30 days after upload. Review content; do not assess appearance, accent, or emotion.</p>{data.answers.map(a=><button key={a.question_index} disabled={busy} onClick={()=>void recording(a.question_index)}>Watch answer {a.question_index+1}</button>)}</>}
 <button disabled={busy} onClick={()=>setRevision(v=>v+1)}>Refresh assessment</button></>}
 </section>;
}
