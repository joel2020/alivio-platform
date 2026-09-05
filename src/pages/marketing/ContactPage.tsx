import { FormEvent, useEffect, useRef, useState } from 'react';
import { supabaseFunctionsUrl } from '../../lib/supabase';
import { CAL_COM_BOOKING_URL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../lib/demoBooking';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [facility, setFacility] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (submitted || error) feedbackRef.current?.focus(); }, [submitted, error]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${supabaseFunctionsUrl}/public-intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'lead',
          source: 'contact-page',
          name,
          email,
          company: facility,
          message,
          website,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.ok !== true) {
        setError(res.status === 429 ? 'Please wait a moment before trying again, or email hello@aliviosearchpartners.com.' : 'We could not confirm your message. Your details are still here. Please try again or email hello@aliviosearchpartners.com.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('We could not connect. Your details are still here. Check your connection and try again, or email hello@aliviosearchpartners.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#061636' }}>
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-bold text-white mb-4" style={{ fontSize: '36px' }}>Contact Alivio Search Partners</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border p-6" style={{ borderColor: '#24467B', backgroundColor: '#0A2352' }}>
            {submitted ? (
              <div ref={feedbackRef} role="status" tabIndex={-1}>
                <h2 className="text-white font-semibold mb-3" style={{ fontSize: '22px' }}>Message received.</h2>
                <p style={{ color: '#C1D0EB', lineHeight: '1.7' }}>
                  Thanks for reaching out — a member of the team will get back to you within one business day. Need
                  to talk sooner? Book a call on the right.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} aria-busy={isSubmitting}>
                <h2 className="text-white font-semibold mb-4" style={{ fontSize: '22px' }}>Send us a message</h2>
                <p style={{ color: '#C1D0EB', fontSize: 14, marginBottom: 16 }}>All fields are required.</p>
                <div className="space-y-4">
                  <label className="mkt-field text-white" htmlFor="contact-name">Full name
                  <input id="contact-name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#061636', borderColor: '#536B96' }} /></label>
                  <label className="mkt-field text-white" htmlFor="contact-email">Work email
                  <input id="contact-email" name="email" autoComplete="email" spellCheck={false} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#061636', borderColor: '#536B96' }} /></label>
                  <label className="mkt-field text-white" htmlFor="contact-company">Organization
                  <input id="contact-company" name="company" autoComplete="organization" required value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="Hospital, health system, or company" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#061636', borderColor: '#536B96' }} /></label>
                  <label className="mkt-field text-white" htmlFor="contact-message">Roles to fill
                  <textarea id="contact-message" name="message" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Roles to fill" rows={5} className="w-full rounded border px-3 py-2 text-white" style={{ background: '#061636', borderColor: '#536B96' }} /></label>
                  <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" name="website" className="mkt-honeypot" />
                  <p style={{ color: '#C1D0EB', fontSize: 13 }}>We use these details to respond to your inquiry. Please leave out candidate records and sensitive personal information. <a href="/privacy" style={{ color: '#BFD4FF', textDecoration: 'underline' }}>Privacy policy</a></p>
                  {error ? <div ref={feedbackRef} role="alert" tabIndex={-1} style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</div> : null}
                  <button type="submit" disabled={isSubmitting} className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="rounded-xl border p-6" style={{ borderColor: '#24467B', backgroundColor: '#0A2352' }}>
            <h2 className="text-white font-semibold mb-4" style={{ fontSize: '22px' }}>{DEMO_EVENT_TITLE}</h2>
            <p className="mb-6" style={{ color: '#C1D0EB', lineHeight: '1.7' }}>{DEMO_EVENT_DESCRIPTION}</p>
            <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5' }} title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}>Book a Hiring Strategy Call →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
