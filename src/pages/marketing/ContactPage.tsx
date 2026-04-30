import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CAL_COM_BOOKING_URL, CONTACT_EMAIL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../lib/demoBooking';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [facility, setFacility] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    await supabase.functions.invoke('send-outreach-email', { body: { to: CONTACT_EMAIL, subject: `Website inquiry from ${name || 'Healthcare hiring team'}`, body: `Name: ${name}\nEmail: ${email}\nOrganization: ${facility}\n\nMessage:\n${message}`, from: 'Alivio Contact Form <noreply@aliviosearchpartners.com>' } });
    setName(''); setEmail(''); setFacility(''); setMessage(''); setIsSubmitting(false);
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-bold text-white mb-4" style={{ fontSize: '36px' }}>Contact Alivio Search Partners</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <form onSubmit={onSubmit} className="rounded-xl border p-6" style={{ borderColor: '#1E1E1E', backgroundColor: '#141414' }}>
            <h2 className="text-white font-semibold mb-4" style={{ fontSize: '22px' }}>Send us a message</h2>
            <div className="space-y-4">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
              <input required value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="Hospital or health system" className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Roles to fill" rows={5} className="w-full rounded border px-3 py-2 text-white" style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }} />
              <button type="submit" disabled={isSubmitting} className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5' }}>{isSubmitting ? 'Sending...' : 'Send Us a Role'}</button>
            </div>
          </form>
          <div className="rounded-xl border p-6" style={{ borderColor: '#1E1E1E', backgroundColor: '#141414' }}>
            <h2 className="text-white font-semibold mb-4" style={{ fontSize: '22px' }}>{DEMO_EVENT_TITLE}</h2>
            <p className="mb-6" style={{ color: '#A0A0A0', lineHeight: '1.7' }}>{DEMO_EVENT_DESCRIPTION}</p>
            <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5' }} title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}>Book an Intro Call →</a>
            <p className="mt-4 text-sm" style={{ color: '#A0A0A0' }}>
              Prefer email? <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#FFFFFF', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
