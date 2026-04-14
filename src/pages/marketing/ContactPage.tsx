import { FormEvent, useState } from 'react';

const CAL_COM_BOOKING_URL = 'https://cal.com/alivio/intro-call30';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [facility, setFacility] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Website inquiry from ${name || 'Healthcare hiring team'}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nOrganization: ${facility}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:hello@aliviosearchpartners.com?subject=${subject}&body=${body}`;
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
              <button type="submit" className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5' }}>
                Send Message
              </button>
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
