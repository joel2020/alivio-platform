import { FormEvent, useState } from 'react';
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      if (!res.ok) {
        setError(payload.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-bold text-white mb-4" style={{ fontSize: '36px' }}>Contact Alivio Search Partners</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border p-6" style={{ borderColor: '#1E1E1E', backgroundColor: '#141414' }}>
            {submitted ? (
              <div>
                <h2 className="text-white font-semibold mb-3" style={{ fontSize: '22px' }}>Message received.</h2>
                <p style={{ color: '#A0A0A0', lineHeight: '1.7' }}>
                  Thanks for reaching out — a member of the team will get back to you within one business day. Need
                  to talk sooner? Book a call on the right.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <h2 className="text-white font-semibold mb-4" style={{ fontSize: '22px' }}>Send us a message</h2>
                <div className="space-y-4">
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-label="Full name" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" aria-label="Work email" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
                  <input required value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="Hospital, health system, or company" aria-label="Organization" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
                  <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Roles to fill" aria-label="Roles to fill" rows={5} className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
                  <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" style={{ position: 'absolute', left: -9999, height: 0, opacity: 0 }} />
                  {error ? <p style={{ color: '#F87171', fontSize: '14px' }}>{error}</p> : null}
                  <button type="submit" disabled={isSubmitting} className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="rounded-xl border p-6" style={{ borderColor: '#1E1E1E', backgroundColor: '#141414' }}>
            <h2 className="text-white font-semibold mb-4" style={{ fontSize: '22px' }}>{DEMO_EVENT_TITLE}</h2>
            <p className="mb-6" style={{ color: '#A0A0A0', lineHeight: '1.7' }}>{DEMO_EVENT_DESCRIPTION}</p>
            <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5' }} title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}>Book a Demo →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
