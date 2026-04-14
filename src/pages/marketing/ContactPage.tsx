import { useEffect } from 'react';

const CAL_COM_BOOKING_URL = 'https://cal.com/alivio/intro-call30';

export default function ContactPage() {
  useEffect(() => {
    window.location.replace(CAL_COM_BOOKING_URL);
  }, []);

  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-bold text-white mb-4" style={{ fontSize: '36px', lineHeight: '1.1' }}>
          Redirecting you to our demo scheduler...
        </h1>
        <p className="mb-8" style={{ color: '#A0A0A0', lineHeight: '1.7' }}>
          If you are not redirected automatically, use the button below.
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
      </section>
    </div>
  );
}
