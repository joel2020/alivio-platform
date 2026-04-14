import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import AnimateInView from '../AnimateInView';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    tagline: 'For exploring the platform',
    features: ['1 active role', 'Up to 50 sourced candidates', 'Basic scoring', 'Email outreach'],
    cta: 'Start Free',
    ctaLink: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$799',
    period: '/month',
    tagline: 'For teams ready to hire',
    features: [
      'Unlimited roles',
      'Unlimited sourced candidates',
      'Advanced scoring + signals',
      'Multi-channel outreach',
      'Agent activity dashboard',
      'Priority support',
    ],
    cta: 'Start Free',
    ctaLink: '/signup',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'For organizations with complex hiring needs',
    features: [
      'Everything in Pro',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantees',
      'Volume pricing',
    ],
    cta: 'Contact Us',
    ctaLink: '/contact',
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" style={{ padding: '60px 0', background: '#FFFFFF' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 auto', maxWidth: '560px' }}>
              No placement fees. No per-seat surprises. One plan that scales with you.
            </p>
          </div>
        </AnimateInView>

        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'stretch' }}>
          {plans.map((plan, i) => (
            <AnimateInView key={plan.name} delay={i * 80} style={{ height: '100%' }}>
              <div
                className="pricing-card"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E4E7',
                  borderTop: plan.highlight ? '3px solid #2563EB' : '1px solid #E4E4E7',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: plan.highlight
                    ? '0 4px 16px rgba(37,99,235,0.10), 0 2px 6px rgba(0,0,0,0.04)'
                    : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}>
                {plan.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#2563EB',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 14px',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </span>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{plan.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', margin: '12px 0 8px' }}>
                    <span style={{ fontSize: plan.price === 'Custom' ? '32px' : '40px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>{plan.period}</span>}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{plan.tagline}</p>
                  {plan.name === 'Pro' && (
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '10px 0 0 0', fontWeight: 500 }}>
                      Pays for itself with one hire. Traditional agencies charge $15,000-$30,000 per placement.
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginBottom: '24px', flex: 1 }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', background: 'var(--accent-tint)', borderRadius: '50%', flexShrink: 0 }}>
                          <Check size={10} color="var(--accent)" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={plan.ctaLink}
                  className={plan.highlight ? 'mkt-btn-primary' : 'mkt-btn-secondary'}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {plan.cta}
                </Link>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pricing-grid { grid-template-columns: 1fr !important; max-width: 480px; margin: 0 auto; }
        }
      `}</style>
    </section>
  );
}
