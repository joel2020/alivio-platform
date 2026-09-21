import { FormEvent, useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { supabaseFunctionsUrl } from '../../lib/supabase';
import { useSeo } from '../../lib/seo';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: 10,
  border: '1px solid #DCE4F2',
  background: '#fff',
  fontSize: 16,
  color: '#102344',
};

const services = [
  'Retained executive / leadership search',
  'Physician or advanced practice recruiting',
  'Nursing / clinical staff pipeline',
  'Technology & product search',
  'Contingency and contract recruiting',
  'LATAM recruitment',
  'Offshore recruitment',
  'Not sure yet — advise me',
];

export default function StartPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    service: services[0],
    message: '',
    website: '', // honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (submitted || error) feedbackRef.current?.focus(); }, [submitted, error]);

  useSeo({
    title: 'Request a Search Plan | Alivio Search Partners',
    description:
      'Tell us about the roles you need to fill. Get a search plan with market mapping, compensation guidance, and a realistic timeline — before you commit to anything.',
    canonicalUrl: 'https://aliviosearchpartners.com/start',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${supabaseFunctionsUrl}/public-intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'lead', source: 'start-page', ...form }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.ok !== true) {
        setError(res.status === 429 ? 'Please wait a moment before trying again, or email hello@aliviosearchpartners.com.' : 'We could not confirm your request. Your details are still here. Please try again or email hello@aliviosearchpartners.com.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('We could not connect. Your details are still here. Check your connection and try again, or email hello@aliviosearchpartners.com.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '70vh' }}>
      <section style={{ background: 'linear-gradient(180deg,#061636 0%,#04132F 100%)', padding: '120px 0 56px' }}>
        <div className="mkt-container">
          <p className="mkt-label" style={{ color: '#8FB4FF' }}>Start a search</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(32px,4.4vw,54px)', lineHeight: 1.05, letterSpacing: '-.03em', margin: '14px 0 14px', maxWidth: 760 }}>
            Request a search plan.
          </h1>
          <p style={{ color: '#B9C6E4', fontSize: 17, lineHeight: 1.7, maxWidth: 640 }}>
            Share the basics below. Within one business day you&apos;ll get a plan covering market mapping,
            compensation guidance, and a realistic timeline — no commitment required.
          </p>
        </div>
      </section>

      <section style={{ padding: '44px 0 80px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 24, alignItems: 'start' }}>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 28, background: '#fff' }}>
            {submitted ? (
              <div ref={feedbackRef} role="status" tabIndex={-1}>
                <CheckCircle2 size={30} color="#188653" />
                <h2 style={{ fontSize: 21, margin: '12px 0 8px' }}>Request received.</h2>
                <p style={{ color: '#4D5E7B', lineHeight: 1.7 }}>
                  Thanks — we&apos;ll review your roles and send a search plan within one business day. Want to talk
                  sooner?{' '}
                  <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#1D55C6' }}>
                    Book a call now
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={(event) => void handleSubmit(event)} aria-busy={submitting}>
                <p className="mkt-form-note" style={{ margin: '0 0 20px' }}>Fields marked * are required.</p>
                <div className="mkt-form-fields">
                  <div className="mkt-form-row">
                    <label className="mkt-field" htmlFor="search-name">Full name *
                      <input id="search-name" name="name" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                    </label>
                    <label className="mkt-field" htmlFor="search-email">Work email *
                      <input id="search-email" name="email" required type="email" autoComplete="email" spellCheck={false} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                    </label>
                  </div>
                  <div className="mkt-form-row">
                    <label className="mkt-field" htmlFor="search-company">Company *
                      <input id="search-company" name="company" required autoComplete="organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={inputStyle} />
                    </label>
                    <label className="mkt-field" htmlFor="search-role">Your title (optional)
                      <input id="search-role" name="role" autoComplete="organization-title" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle} />
                    </label>
                  </div>
                  <label className="mkt-field" htmlFor="search-service">Service needed
                    <select id="search-service" name="service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} style={inputStyle}>
                      {services.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="mkt-field" htmlFor="search-message">Roles to fill *
                    <textarea id="search-message" name="message" required rows={5} placeholder="Which roles, locations, and hiring timelines should we plan for?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={inputStyle} />
                  </label>
                  <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="mkt-honeypot" aria-hidden="true" />
                  <p className="mkt-form-note">We use these details to respond to your inquiry. Please leave out candidate records and sensitive personal information. <a href="/privacy">Privacy policy</a></p>
                  {error ? <div ref={feedbackRef} role="alert" tabIndex={-1} style={{ color: '#B4232A', fontSize: 14 }}>{error}</div> : null}
                  <button type="submit" disabled={submitting} className="mkt-btn-primary-lg" style={{ opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Sending…' : 'Request my search plan'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 28, background: '#fff' }}>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>What you&apos;ll get</h2>
              <ul style={{ display: 'grid', gap: 10, padding: 0, listStyle: 'none' }}>
                {[
                  'A market map of the talent pool for your roles',
                  'Compensation guidance grounded in current searches',
                  'A realistic timeline to a screened shortlist',
                  'The engagement model that fits — retained, program, or project',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 10, color: '#233657', lineHeight: 1.6, fontSize: 15 }}>
                    <CheckCircle2 size={16} color="#1D55C6" style={{ flexShrink: 0, marginTop: 3 }} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#061636,#0A2352)', borderRadius: 20, padding: 28 }}>
              <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Prefer to talk first?</h2>
              <p style={{ color: '#B9C6E4', lineHeight: 1.7, marginBottom: 14, fontSize: 15 }}>
                Book a 30-minute hiring strategy call and bring a real open role.
              </p>
              <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary">Book a call</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
