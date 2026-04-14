import { ArrowRight } from 'lucide-react';
import AnimateInView from '../AnimateInView';
import { CAL_COM_BOOKING_URL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../../lib/demoBooking';

export default function FinalCTASection() {
  return (
    <section style={{ padding: '160px 0', background: '#FAFAFA' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              Fill More Clinical Roles Without Paying Agency Placement Fees
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 auto 40px', maxWidth: '560px' }}>
              Fill your next Director of Nursing in under 14 days — for one flat monthly fee, with no agency commissions.
            </p>
            <a
              href={CAL_COM_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mkt-btn-primary-lg"
              style={{ display: 'inline-flex' }}
              title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}
            >
              Book a Demo
              <ArrowRight size={18} />
            </a>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '16px 0 0 0' }}>
              A 30-minute demo for healthcare HR leaders.
            </p>
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}
