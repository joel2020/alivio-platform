import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';

const CAL_COM_BOOKING_URL = 'https://cal.com/alivio/intro-call30';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [facility, setFacility] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState(null);
    setIsSubmitting(true);

    const subject = `Website inquiry from ${name || 'Healthcare hiring team'}`;
    const body = (
      `Name: ${name}\nEmail: ${email}\nOrganization: ${facility}\n\nMessage:\n${message}`
    );

    const { error } = await supabase.functions.invoke<{ data?: { id: string } }>('send-outreach-email', {
      body: {
        to: 'hello@aliviosearchpartners.com',
        subject,
        body,
        from: 'Alivio Contact Form <noreply@aliviosearchpartners.com>',
      },
    });

    if (error) {
      setSubmitState({
        kind: 'error',
        message: 'Sorry — something went wrong while sending your message. Please try again.',
      });
      setIsSubmitting(false);
      return;
    }

    setName('');
    setEmail('');
    setFacility('');
    setMessage('');
    setSubmitState({
      kind: 'success',
      message: 'Thanks — your message has been sent. Our team will get back to you soon.',
    });
    setIsSubmitting(false);
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-bold text-white mb-4" style={{ fontSize: '36px', lineHeight: '1.1' }}>
          Contact Alivio Search Partners
        </h1>
        <p className="mb-10" style={{ color: '#A0A0A0', lineHeight: '1.7', maxWidth: '720px' }}>
          Tell us which nursing or clinical roles your facility needs to fill. We will show you how Alivio can cut time-to-fill with healthcare-specific AI agents.
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <form onSubmit={onSubmit} className="rounded-xl border p-6" style={{ borderColor: '#1E1E1E', backgroundColor: '#141414' }}>
            <h2 className="text-white font-semibold mb-4" style={{ fontSize: '22px' }}>Send us a message</h2>
            <div className="space-y-4">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
              <input required value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="Hospital or health system" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Roles to fill (RN, ICU, Med-Surg, etc.)" rows={5} className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-block px-6 py-3 rounded font-medium text-white"
                style={{ backgroundColor: '#4F46E5', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              {submitState && (
                <p
                  role="status"
                  style={{ color: submitState.kind === 'success' ? '#22C55E' : '#F87171', fontSize: '14px', lineHeight: 1.5 }}
                >
                  {submitState.message}
                </p>
              )}
            </div>
          </form>

          <div className="rounded-xl border p-6" style={{ borderColor: '#1E1E1E', backgroundColor: '#141414' }}>
            <h2 className="text-white font-semibold mb-4" style={{ fontSize: '22px' }}>Book a live demo</h2>
            <p className="mb-6" style={{ color: '#A0A0A0', lineHeight: '1.7' }}>
              Prefer a walkthrough now? Schedule directly on Cal.com.
            </p>
            <a
              href={CAL_COM_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded font-medium text-white"
              style={{ backgroundColor: '#4F46E5' }}
            >
              Book a Demo →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
