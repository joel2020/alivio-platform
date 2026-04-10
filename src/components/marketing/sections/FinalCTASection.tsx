import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimateInView from '../AnimateInView';

export default function FinalCTASection() {
  return (
    <section style={{ padding: '160px 0', background: '#FAFAFA' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              Stop Overpaying for Recruiting. Start Building Your Pipeline.
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 auto 40px', maxWidth: '560px' }}>
              Alivio gives you an AI recruiting team for a fraction of what agencies charge. Start free today.
            </p>
            <Link to="/signup" className="mkt-btn-primary-lg" style={{ display: 'inline-flex' }}>
              Start Free Now
              <ArrowRight size={18} />
            </Link>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '16px 0 0 0' }}>
              No credit card required
            </p>
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}
