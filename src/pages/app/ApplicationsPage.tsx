import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, RefreshCw, Search, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import '../../styles/applications.css';
import { INTERVIEW_THRESHOLD } from '../../../supabase/functions/_shared/interview-assessment';
import ApplicationInterviewReview from '../../components/app/ApplicationInterviewReview';

interface Application {
  ai_review?: { state: string; score: number | null } | null;
  id: number; public_reference: string | null; job_id: number; job_title: string;
  first_name: string; last_name: string; email: string; phone: string | null;
  status: string; created_at: string; org_id: string | null; role_id: string | null;
  candidate_id: string | null; assigned_to: string | null;
  questionnaire: Record<string, string> | null; resume_filename: string | null;
  next_action: string | null; next_action_at: string | null; messages_stopped: boolean; followups_stopped?: boolean;
}
interface Inbox {
  applications: Application[];
  jobs: { id: number; title: string; role_id: string | null }[];
  roles: { id: string; title: string; org_id: string }[];
  reviewers: { id: string; full_name: string }[];
  is_admin: boolean; email_ready: boolean; followups_ready: boolean;
}
interface Detail {
  application: Application;
  events: { id: string; created_at: string; event_type: string; detail: string }[];
  messages: { id: string; created_at: string; subject: string; body: string; status: string; scheduled_at: string | null; sent_at: string | null; last_error: string | null }[];
}
const stages = ['new', 'reviewing', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];
const labels: Record<string, string> = { location: 'Location and work arrangement', experience: 'Relevant experience', skills: 'Skills, licenses, and certifications', availability: 'Availability', interest: 'Interest in the role' };
const emptyInbox: Inbox = { applications: [], jobs: [], roles: [], reviewers: [], is_admin: false, email_ready: false, followups_ready: false };
const display = (value: string) => value.replace(/_/g, ' ').replace(/^./, letter => letter.toUpperCase());
const date = (value: string | null) => value ? new Date(value).toLocaleString() : '—';
const localDate = (value: string | null) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';

async function request<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('candidate-applications', { body });
  if (error || data?.error) {
    let message = data?.error || 'Unable to complete this action. Please try again.';
    if (error && 'context' in error && error.context instanceof Response) {
      const payload = await error.context.clone().json().catch(() => null);
      if (typeof payload?.error === 'string') message = payload.error;
    }
    throw Object.assign(new Error(message), { status: error && 'context' in error && error.context instanceof Response ? error.context.status : 500 });
  }
  return data as T;
}

export default function ApplicationsPage() {
  const [inbox, setInbox] = useState<Inbox>(emptyInbox);
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [jobFilter, setJobFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [since, setSince] = useState('');
  const [revision, setRevision] = useState(0);
  const [edit, setEdit] = useState({ status: 'new', assigned_to: '', next_action: '', next_action_at: '', note: '' });
  const [message, setMessage] = useState({ subject: '', body: '', scheduled_at: '' });
  const [mapping, setMapping] = useState({ job_id: '', role_id: '' });
  const initializedApplication = useRef<number | null>(null);
  const pendingMessage = useRef<Record<string, unknown> | null>(null);
  const [messageLocked, setMessageLocked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const result = await request<{ data: Inbox }>({ action: 'list' }); setInbox(result.data); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load applications.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    if (selected === null) return;
    setDetailLoading(true);
    request<{ data: Detail }>({ action: 'detail', id: selected }).then(result => {
      if (cancelled) return;
      const application = result.data.application;
      setDetail(result.data);
      if (initializedApplication.current !== selected) {
        setEdit({ status: application.status, assigned_to: application.assigned_to || '', next_action: application.next_action || '', next_action_at: localDate(application.next_action_at), note: '' });
        setMessage({ subject: '', body: '', scheduled_at: '' });
        initializedApplication.current = selected;
        pendingMessage.current = null; setMessageLocked(false);
      }
    }).catch(e => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [selected, revision]);

  async function act(body: Record<string, unknown>, success: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      await request(body);
      if (body.action === 'update') setEdit(value => ({ ...value, note: value.note === body.note ? '' : value.note }));
      if (body.action === 'message') { setMessage({ subject: '', body: '', scheduled_at: '' }); pendingMessage.current = null; setMessageLocked(false); }
      setNotice(success); await load(); setRevision(value => value + 1);
    } catch (e) {
      if (body.action === 'message' && e instanceof Error && 'status' in e && [400, 413, 415, 422].includes(Number(e.status))) { pendingMessage.current = null; setMessageLocked(false); }
      setError(e instanceof Error ? e.message : 'Unable to save changes.');
    }
    finally { setBusy(false); }
  }
  function queueMessage() {
    if (!application) return;
    pendingMessage.current ??= { action: 'message', request_id: crypto.randomUUID(), id: application.id, subject: message.subject, body: message.body, ...(message.scheduled_at ? { scheduled_at: new Date(message.scheduled_at).toISOString() } : {}) };
    setMessageLocked(true);
    void act(pendingMessage.current, 'Email queued. Check the communication history for delivery status.');
  }
  async function openResume() {
    if (selected === null) return;
    setBusy(true); setError('');
    try {
      const result = await request<{ data: { url: string } }>({ action: 'resume', id: selected });
      const url = new URL(result.data.url);
      if (url.protocol !== 'https:') throw new Error('The résumé download could not be verified.');
      const link = document.createElement('a'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.click();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to open résumé.'); }
    finally { setBusy(false); }
  }
  function applyTemplate(template: string) {
    const application = detail?.application;
    if (!application) return;
    const greeting = `Hi ${application.first_name},\n\n`;
    const closing = '\n\nThank you,\nAlivio Search Partners';
    const templates: Record<string, { subject: string; body: string }> = {
      screening: { subject: `Next steps — ${application.job_title}`, body: `${greeting}Thank you for your application. We would like to arrange a brief conversation about your experience and the ${application.job_title} opportunity. Please reply with your availability.${closing}` },
      interview: { subject: `Interview availability — ${application.job_title}`, body: `${greeting}We would like to coordinate an interview for the ${application.job_title} opportunity. Please reply with a few times that work for you, including your time zone.${closing}` },
      followup: { subject: `Following up — ${application.job_title}`, body: `${greeting}We are following up on our recent message about the ${application.job_title} opportunity. Please let us know if you are still interested or if your availability has changed.${closing}` },
      update: { subject: `Application update — ${application.job_title}`, body: `${greeting}Thank you for your interest in the ${application.job_title} opportunity. Our team is continuing its review. We appreciate your patience.${closing}` },
      rejection: { subject: `Your application — ${application.job_title}`, body: `${greeting}Thank you for the time you invested in applying for the ${application.job_title} opportunity. After reviewing the requirements for this position, we will not be progressing your application for this role. We appreciate your interest in Alivio Search Partners.${closing}` },
    };
    const chosen = templates[template];
    if (chosen) setMessage({ ...chosen, scheduled_at: '' });
  }

  const filtered = useMemo(() => inbox.applications.filter(application =>
    (!search || `${application.first_name} ${application.last_name} ${application.email} ${application.job_title}`.toLowerCase().includes(search.toLowerCase())) &&
    (!recommendedOnly || (application.ai_review?.state === 'review' && (application.ai_review.score ?? 0) >= INTERVIEW_THRESHOLD)) &&
    (!stageFilter || application.status === stageFilter) && (!jobFilter || String(application.job_id) === jobFilter) &&
    (!ownerFilter || application.assigned_to === ownerFilter || (ownerFilter === 'unassigned' && !application.assigned_to)) &&
    (!since || application.created_at.slice(0, 10) >= since)
  ), [inbox.applications, search, stageFilter, jobFilter, ownerFilter, since, recommendedOnly]);
  const application = detail?.application;

  return <div className="ats-page">
    <header className="ats-heading"><div><p className="ats-eyebrow">Candidate relationships</p><h1>Applications</h1><p>Review applicants, coordinate next steps, and keep every conversation in context.</p></div><div className="ats-toolbar"><Link to="/dashboard/crm">Client CRM <ArrowUpRight size={15} /></Link><button onClick={() => { setError(''); void load(); setRevision(value => value + 1); }} disabled={loading || busy}><RefreshCw size={15} /> Refresh</button></div></header>
    {error && <div className="ats-alert" role="alert">{error}</div>}
    {notice && <div className="ats-notice" role="status">{notice}</div>}
    {!loading && !inbox.email_ready && <div className="ats-notice">Email delivery needs a configured sender. Applications remain saved; queued messages show their delivery status here.</div>}
    <div className="ats-summary"><div><strong>{inbox.applications.length}</strong><span>Applications loaded</span></div><div><strong>{inbox.applications.filter(item => item.status === 'new').length}</strong><span>New applications</span></div><div><strong>{inbox.applications.filter(item => item.next_action_at && Date.parse(item.next_action_at) < Date.now() && !['hired', 'rejected', 'withdrawn'].includes(item.status)).length}</strong><span>Next actions overdue</span></div></div>
    {inbox.is_admin && <details className="ats-mapping"><summary>Connect public jobs to recruiting roles</summary><p>Link a public posting to its internal role so new and unassigned applications reach the correct organization. Existing assigned applications keep their ownership.</p><form onSubmit={event => { event.preventDefault(); void act({ action: 'map-job', job_id: Number(mapping.job_id), role_id: mapping.role_id }, 'Job linked to its recruiting role.'); }}><label>Public job<select aria-label="Public job" required value={mapping.job_id} onChange={event => setMapping({ ...mapping, job_id: event.target.value })}><option value="">Choose a public job</option>{inbox.jobs.map(job => <option key={job.id} value={job.id}>{job.title}{job.role_id ? ' · Linked' : ' · Needs mapping'}</option>)}</select></label><label>Recruiting role<select aria-label="Recruiting role" required value={mapping.role_id} onChange={event => setMapping({ ...mapping, role_id: event.target.value })}><option value="">Choose a role</option>{inbox.roles.map(role => <option key={role.id} value={role.id}>{role.title} · {role.org_id.slice(0, 8)}</option>)}</select></label><button disabled={busy} type="submit">Connect job</button></form></details>}
    <label><input type="checkbox" checked={recommendedOnly} onChange={e=>setRecommendedOnly(e.target.checked)} /> Show 8/10+ assessments awaiting human interview approval</label>
    <div className="ats-filters"><label className="ats-search"><span><Search size={14} /> Search applicants</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, email, or role" /></label><label>Stage<select aria-label="Stage" value={stageFilter} onChange={event => setStageFilter(event.target.value)}><option value="">All stages</option>{stages.map(stage => <option key={stage} value={stage}>{display(stage)}</option>)}</select></label><label>Job<select aria-label="Job" value={jobFilter} onChange={event => setJobFilter(event.target.value)}><option value="">All jobs</option>{inbox.jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label><label>Assigned to<select aria-label="Assigned to" value={ownerFilter} onChange={event => setOwnerFilter(event.target.value)}><option value="">Everyone</option><option value="unassigned">Unassigned</option>{inbox.reviewers.map(reviewer => <option key={reviewer.id} value={reviewer.id}>{reviewer.full_name}</option>)}</select></label><label>Applied since<input type="date" value={since} onChange={event => setSince(event.target.value)} /></label></div>
    <div className="ats-workspace"><section className="ats-inbox" aria-label="Application inbox" aria-busy={loading}><div className="ats-list-heading">{filtered.length} applications</div>{loading ? <p role="status" className="ats-empty">Loading applications…</p> : filtered.length === 0 ? <p className="ats-empty">No applications match these filters. New submissions from Careers will appear here.</p> : filtered.map(item => <button key={item.id} className={`ats-applicant ${selected === item.id ? 'is-selected' : ''}`} aria-pressed={selected === item.id} disabled={busy} onClick={() => { setSelected(item.id); setError(''); setNotice(''); }}><span className="ats-applicant-heading"><strong>{item.first_name} {item.last_name}</strong><span className="ats-stage">{display(item.status || 'new')}</span></span><span>{item.job_title}</span><small>{new Date(item.created_at).toLocaleDateString()}{!item.org_id ? ' · Admin triage' : ''}{item.next_action ? ` · ${item.next_action}` : ''}</small></button>)}</section>
      <section className="ats-detail" aria-label="Application details" aria-busy={detailLoading}>{detailLoading ? <p className="ats-empty" role="status">Loading applicant details…</p> : !application ? <div className="ats-empty"><FileText size={30} /><h2>Select an application</h2><p>Review the résumé, screening answers, and communication history in one place.</p></div> : <>
        <header className="ats-detail-heading"><div><p className="ats-eyebrow">{application.public_reference || 'Legacy application'}</p><h2>{application.first_name} {application.last_name}</h2><p>{application.job_title}</p><p className="ats-contact">{application.email}{application.phone ? ` · ${application.phone}` : ''}</p></div><span className="ats-stage">{display(application.status || 'new')}</span></header>
        <div className="ats-toolbar"><button disabled={busy || !application.resume_filename} onClick={() => void openResume()}><FileText size={15} /> {application.resume_filename ? 'Open résumé' : 'No uploaded résumé'}</button>{application.candidate_id && <Link to={`/candidates/${application.candidate_id}`}>Candidate profile <ArrowUpRight size={15} /></Link>}{application.role_id && <Link to={`/roles/${application.role_id}/pipeline`}>Role pipeline <ArrowUpRight size={15} /></Link>}</div>
        <form className="ats-panel" onSubmit={event => { event.preventDefault(); void act({ action: 'update', id: application.id, ...edit, assigned_to: edit.assigned_to || null, next_action_at: edit.next_action_at ? new Date(edit.next_action_at).toISOString() : null }, 'Application updated.'); }}><h3>Recruiter workflow</h3><div className="ats-form-grid"><label>Application stage<select aria-label="Application stage" value={edit.status} onChange={event => setEdit({ ...edit, status: event.target.value })}>{!stages.includes(edit.status) && <option value={edit.status}>{display(edit.status)}</option>}{stages.map(stage => <option key={stage} value={stage}>{display(stage)}</option>)}</select></label><label>Assigned recruiter<select aria-label="Assigned recruiter" value={edit.assigned_to} onChange={event => setEdit({ ...edit, assigned_to: event.target.value })}><option value="">Unassigned</option>{inbox.reviewers.map(reviewer => <option key={reviewer.id} value={reviewer.id}>{reviewer.full_name}</option>)}</select></label><label>Next action<input value={edit.next_action} maxLength={300} placeholder="For example, review clinical experience" onChange={event => setEdit({ ...edit, next_action: event.target.value })} /></label><label>Next action due<input type="datetime-local" value={edit.next_action_at} onChange={event => setEdit({ ...edit, next_action_at: event.target.value })} /></label></div><label>Internal note<textarea aria-label="Internal note" rows={3} value={edit.note} maxLength={5000} placeholder="Add context for the recruiting team" onChange={event => setEdit({ ...edit, note: event.target.value })} /></label><button className="ats-primary" disabled={busy} type="submit">Save changes</button></form>
        <ApplicationInterviewReview key={application.id} id={application.id} onChange={message => { setNotice(message); void load(); setRevision(value=>value+1); }} />
        <section className="ats-panel"><h3>Application questionnaire</h3>{application.questionnaire && Object.keys(application.questionnaire).length ? <dl className="ats-answers">{Object.entries(application.questionnaire).map(([key, answer]) => <div key={key}><dt>{labels[key] || display(key)}</dt><dd>{answer}</dd></div>)}</dl> : <p>This application predates the questionnaire.</p>}</section>
        <form className="ats-panel" onSubmit={event => { event.preventDefault(); queueMessage(); }}><h3><Mail size={17} /> Candidate email</h3><p>To: {application.email}</p><fieldset disabled={busy || messageLocked}><label>Start from a template<select aria-label="Start from a template" defaultValue="" onChange={event => applyTemplate(event.target.value)}><option value="">Write a message or choose a template</option><option value="screening">Screening conversation</option><option value="interview">Interview availability</option><option value="followup">Follow-up</option><option value="update">Application update</option><option value="rejection">Not progressing</option></select></label><label>Subject<input required maxLength={200} value={message.subject} onChange={event => setMessage({ ...message, subject: event.target.value })} /></label><label>Message<textarea aria-label="Message" required rows={7} maxLength={10000} value={message.body} onChange={event => setMessage({ ...message, body: event.target.value })} /></label><label>Schedule for (optional)<input type="datetime-local" disabled={!inbox.followups_ready || application.messages_stopped || application.followups_stopped} value={message.scheduled_at} onChange={event => setMessage({ ...message, scheduled_at: event.target.value })} /></label></fieldset>{messageLocked && <p className="ats-help">If the response was interrupted, retry this same email request. Editing is paused until its outcome is confirmed.</p>}{!inbox.followups_ready && <p className="ats-help">Scheduled follow-ups are unavailable until reply detection is connected. You can send a reviewed message now.</p>}{application.messages_stopped && <p className="ats-help">Candidate emails are stopped for this application.</p>}<button className="ats-primary" type="submit" disabled={busy || !inbox.email_ready || application.messages_stopped}>{messageLocked ? 'Retry same email' : 'Queue email'}</button><p className="ats-help">Stage changes alone do not send emails. Review the message before queuing it.</p></form>
        <section className="ats-panel"><h3>Communication history</h3><div className="ats-toolbar"><button disabled={busy} onClick={() => void act({ action: 'record-reply', id: application.id }, 'Reply recorded. Scheduled follow-ups stopped.')}>Record candidate reply</button><button disabled={busy || application.messages_stopped} onClick={() => void act({ action: 'stop-messages', id: application.id }, 'Candidate emails stopped.')}>Stop candidate emails</button></div>{detail?.messages.length ? <ol className="ats-history">{detail.messages.map(item => <li key={item.id}><div><strong>{item.subject}</strong><span className="ats-stage">{['accepted', 'sent'].includes(item.status) ? 'Accepted by email provider' : display(item.status)}</span></div><small>{date(item.sent_at || item.scheduled_at || item.created_at)}</small><details><summary>Read message</summary><p>{item.body}</p></details>{item.last_error && <p className="ats-message-error">{item.last_error}</p>}</li>)}</ol> : <p>No emails recorded for this application.</p>}</section>
        <section className="ats-panel"><h3>Activity and notes</h3>{detail?.events.length ? <ol className="ats-history">{detail.events.map(event => <li key={event.id}><strong>{display(event.event_type)}</strong><small>{date(event.created_at)}</small><p>{event.detail}</p></li>)}</ol> : <p>No recruiter activity yet.</p>}</section>
      </>}</section></div>
  </div>;
}
