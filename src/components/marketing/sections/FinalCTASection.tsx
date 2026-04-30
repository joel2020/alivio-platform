import { ArrowRight } from 'lucide-react';
import AnimateInView from '../AnimateInView';
import { CAL_COM_BOOKING_URL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../../lib/demoBooking';

export default function FinalCTASection() {
  return (
    <section style={{ padding: '96px 0', background: '#FFFFFF' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              Ready to install your AI talent engine?
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 auto 34px', maxWidth: '640px' }}>
              Alivio&apos;s AI agents run your recruiting pipeline around the clock so your team can focus on interviews, offers, and closing.
            </p>
            <a
              href={CAL_COM_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mkt-btn-primary-lg"
              style={{ display: 'inline-flex' }}
              title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}
            >
              Discuss a Search
              <ArrowRight size={18} />
            </a>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '16px 0 0 0' }}>
              Or email joel@aliviosearchpartners.com with the role you need to fill.
            </p>
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}
