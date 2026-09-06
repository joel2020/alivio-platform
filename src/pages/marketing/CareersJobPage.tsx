import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, CheckCircle2, MapPin } from 'lucide-react';
import { supabase, supabaseFunctionsUrl } from '../../lib/supabase';
import { useSeo } from '../../lib/seo';

interface JobDetail {
  id: number;
  title: string;
  location: string | null;
  salary: string | null;
  type: string | null;
  category: string | null;
  description: string | null;
  responsibilities: string[] | null;
  qualifications: string[] | null;
  created_at: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #DCE4F2',
  background: '#fff',
  fontSize: 16,
};

export default function CareersJobPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    resume_url: '',
    message: '',
    website: '', // honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (submitted || submitError) feedbackRef.current?.focus(); }, [submitted, submitError]);

  useSeo({
    title: job ? `${job.title} | Careers | Alivio Search Partners` : 'Open Position | Alivio Search Partners',
    description: job?.description?.slice(0, 155) ?? 'Apply for an open position with Alivio Search Partners.',
    canonicalUrl: `https://aliviosearchpartners.com/careers/${id ?? ''}`,
    structuredData: job
      ? {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.description ?? job.title,
          datePosted: job.created_at,
          employmentType: job.type ?? undefined,
          hiringOrganization: {
            '@type': 'Organization',
            name: 'Alivio Search Partners',
            sameAs: 'https://aliviosearchpartners.com',
          },
          jobLocation: job.location
            ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location } }
            : undefined,
        }
      : undefined,
  });

  useEffect(() => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('jobs')
      .select('id,title,location,salary,type,category,description,responsibilities,qualifications,created_at')
      .eq('id', numericId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setNotFound(true);
        } else {
          setJob(data as JobDetail);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!job || submitting) return;
    if (!form.linkedin_url.trim() && !form.resume_url.trim()) {
      setSubmitError('Add a LinkedIn URL or resume link so we can review your background.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${supabaseFunctionsUrl}/public-intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'application', job_id: job.id, ...form }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.ok !== true) {
        setSubmitError(res.status === 429
          ? 'Please wait a moment before trying again, or email hello@aliviosearchpartners.com.'
          : 'We could not confirm your application. Your details are still here. Please try again or email hello@aliviosearchpartners.com.');
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError('We could not connect. Your details are still here. Check your connection and try again, or email hello@aliviosearchpartners.com.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#FAFAFA', minHeight: '60vh', paddingTop: 140 }}>
        <div className="mkt-container"><p style={{ color: '#4D5E7B' }}>Loading position…</p></div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div style={{ backgroundColor: '#FAFAFA', minHeight: '60vh', paddingTop: 140 }}>
        <div className="mkt-container">
          <h1 style={{ fontSize: 28, marginBottom: 10 }}>Position not found</h1>
          <p style={{ color: '#4D5E7B', marginBottom: 18 }}>This role may have been filled or removed.</p>
          <Link to="/careers" className="mkt-btn-primary">Back to open positions</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FAFAFA' }}>
      <section style={{ background: 'linear-gradient(180deg,#061636 0%,#04132F 100%)', padding: '110px 0 52px' }}>
        <div className="mkt-container">
          <Link to="/careers" style={{ color: '#8FB4FF', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <ArrowLeft size={14} /> All open positions
          </Link>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px,3.8vw,46px)', lineHeight: 1.1, letterSpacing: '-.03em', marginBottom: 12 }}>{job.title}</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#B9C6E4', fontSize: 14 }}>
            {job.location ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {job.location}</span> : null}
            {job.type ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> {job.type}</span> : null}
            {job.salary ? <span>{job.salary}</span> : null}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 0 80px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 24, alignItems: 'start' }}>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 28, background: '#fff' }}>
            {job.description ? (
              <>
                <h2 style={{ fontSize: 20, marginBottom: 10 }}>About the role</h2>
                <p style={{ color: '#4D5E7B', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.description}</p>
              </>
            ) : null}
            {job.responsibilities?.length ? (
              <>
                <h2 style={{ fontSize: 20, margin: '22px 0 10px' }}>What you&apos;ll do</h2>
                <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
                  {job.responsibilities.map((item) => (
                    <li key={item} style={{ display: 'flex', gap: 10, color: '#233657', lineHeight: 1.65, fontSize: 15 }}>
                      <CheckCircle2 size={16} color="#1D55C6" style={{ flexShrink: 0, marginTop: 3 }} /> {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {job.qualifications?.length ? (
              <>
                <h2 style={{ fontSize: 20, margin: '22px 0 10px' }}>What you&apos;ll bring</h2>
                <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
                  {job.qualifications.map((item) => (
                    <li key={item} style={{ display: 'flex', gap: 10, color: '#233657', lineHeight: 1.65, fontSize: 15 }}>
                      <CheckCircle2 size={16} color="#1D55C6" style={{ flexShrink: 0, marginTop: 3 }} /> {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 28, background: '#fff', position: 'sticky', top: 90 }}>
            {submitted ? (
              <div ref={feedbackRef} role="status" tabIndex={-1}>
                <CheckCircle2 size={30} color="#188653" />
                <h2 style={{ fontSize: 20, margin: '12px 0 8px' }}>Application received.</h2>
                <p style={{ color: '#4D5E7B', lineHeight: 1.7 }}>
                  Thanks — a recruiter will review your application and reach out if there&apos;s a fit. You can also
                  explore other <Link to="/careers" style={{ color: '#1D55C6' }}>open positions</Link>.
                </p>
              </div>
            ) : (
              <form onSubmit={(event) => void handleSubmit(event)} aria-busy={submitting}>
                <h2 style={{ fontSize: 20, marginBottom: 14 }}>Apply for this role</h2>
                <div className="mkt-form-fields">
                  <div className="mkt-form-row">
                    <label className="mkt-field">First name<input required name="first_name" autoComplete="given-name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} style={inputStyle} /></label>
                    <label className="mkt-field">Last name<input required name="last_name" autoComplete="family-name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} style={inputStyle} /></label>
                  </div>
                  <label className="mkt-field">Email<input required type="email" name="email" autoComplete="email" spellCheck={false} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} /></label>
                  <label className="mkt-field">Phone (optional)<input type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} /></label>
                  <label className="mkt-field">LinkedIn URL<input type="url" name="linkedin_url" autoComplete="url" placeholder="https://www.linkedin.com/in/your-name" aria-describedby="application-profile-note" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} style={inputStyle} /></label>
                  <label className="mkt-field">Resume link<input type="url" name="resume_url" placeholder="https://…" aria-describedby="application-profile-note" value={form.resume_url} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} style={inputStyle} /></label>
                  <p id="application-profile-note" className="mkt-form-note">Provide either a LinkedIn URL or a resume link that our recruiters can open.</p>
                  <label className="mkt-field">Message (optional)<textarea name="message" rows={4} placeholder="Anything we should know?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={inputStyle} /></label>
                  {/* Honeypot — hidden from real users */}
                  <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} style={{ position: 'absolute', left: -9999, height: 0, opacity: 0 }} aria-hidden="true" />
                  <p className="mkt-form-note">We use your details to review your application. Read our <Link to="/privacy">privacy policy</Link>.</p>
                  {submitError ? <div ref={feedbackRef} role="alert" tabIndex={-1} style={{ color: '#B4232A', fontSize: 14 }}>{submitError}</div> : null}
                  <button type="submit" disabled={submitting} className="mkt-btn-primary" style={{ opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Submitting…' : 'Submit application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
