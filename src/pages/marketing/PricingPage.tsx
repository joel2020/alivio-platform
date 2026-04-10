import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$499/mo',
    popular: false,
    cta: 'Start Free →',
    ctaLink: '/signup',
    features: [
      'Up to 3 active roles',
      'Agents: Scout, Enrich, Signal',
      '500 candidates/mo',
      'Email outreach only',
      'Voice: not included',
      'Basic Cortex learning',
      'Integrations: CSV Export, Zapier',
      '2 users',
      'Support: Docs + Community',
      'Self-serve onboarding',
    ],
  },
  {
    name: 'Growth',
    price: '$1,249/mo',
    popular: true,
    cta: 'Start Free →',
    ctaLink: '/signup',
    features: [
      'Up to 10 active roles',
      'All 7 agents including Voice',
      '2,500 candidates/mo',
      'Email + LinkedIn outreach',
      'Voice: included (up to 100 calls/mo)',
      'Advanced Cortex learning',
      'Integrations: + ATS, HRIS, Calendar',
      '5 users',
      'Support: Priority Email',
      'Self-serve + guided onboarding',
    ],
  },
  {
    name: 'Scale',
    price: '$2,999/mo',
    popular: false,
    cta: 'Start Free →',
    ctaLink: '/signup',
    features: [
      'Up to 30 active roles',
      'All 7 agents including Voice',
      '10,000 candidates/mo',
      'Multi-channel outreach',
      'Voice: included (up to 500 calls/mo)',
      'Advanced + custom Cortex models',
      'Integrations: + API Access, Webhooks',
      '15 users',
      'Support: Dedicated Slack',
      'Guided setup',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    popular: false,
    cta: 'Contact Sales →',
    ctaLink: '#',
    features: [
      'Unlimited roles',
      'All 7 agents + custom',
      'Unlimited candidates',
      'Multi-channel + custom',
      'Voice: unlimited + custom flows',
      'Dedicated Cortex instance',
      'Custom integrations',
      'Unlimited users',
      'Dedicated CSM + SLA',
      'White-glove implementation',
    ],
  },
];

const allInclude = [
  '14-day free trial',
  'No credit card required',
  'Full platform access during trial',
  'SOC 2 Type II compliant',
  'GDPR-ready data handling',
  '99.9% uptime SLA (Growth+)',
];

const faqs = [
  { q: 'Do you charge per hire?', a: 'No. Subscription platform. Cost decreases as you hire more.' },
  { q: 'Can I change plans?', a: 'Yes. Upgrade or downgrade anytime.' },
  { q: 'What about candidate volume limits?', a: 'Agents pause sourcing. Upgrade or wait for next cycle.' },
  { q: 'Is there a contract?', a: 'Month-to-month. Annual at 20% discount.' },
  { q: 'Do I need technical resources?', a: 'No. Designed for non-technical hiring teams.' },
  { q: 'How does voice calling work?', a: 'AI agent calls candidates for credential verification and scheduling. Available on Growth plan and above.' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center border-b" style={{ borderColor: '#1E1E1E' }}>
        <h1 className="font-bold text-white mb-4" style={{ fontSize: '56px', lineHeight: '1.05' }}>Pricing</h1>
        <p className="text-xl mb-2" style={{ color: '#A0A0A0' }}>Transparent, subscription-based access. Scale as you hire.</p>
        <p className="text-sm" style={{ color: '#6B6B6B' }}>No per-hire fees. No retainers. No hidden costs.</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="p-6 rounded-xl border relative"
              style={{
                backgroundColor: '#141414',
                borderColor: plan.popular ? '#4F46E5' : '#1E1E1E',
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#4F46E5' }}>
                    Popular
                  </span>
                </div>
              )}
              <p className="font-semibold text-white mb-1">{plan.name}</p>
              <p className="text-2xl font-bold text-white mb-6">{plan.price}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#A0A0A0' }}>
                    <span className="mt-0.5 flex-shrink-0 text-xs" style={{ color: '#22C55E' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.ctaLink}
                className="block text-center px-4 py-2.5 rounded font-medium text-sm transition-all"
                style={{
                  backgroundColor: plan.popular ? '#4F46E5' : 'transparent',
                  color: '#FFFFFF',
                  border: plan.popular ? 'none' : '1px solid #1E1E1E',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-xl border" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
          <p className="text-sm font-semibold text-white mb-4">All plans include:</p>
          <div className="grid md:grid-cols-3 gap-3">
            {allInclude.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm" style={{ color: '#A0A0A0' }}>
                <span style={{ color: '#22C55E' }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="font-semibold text-white mb-8 text-center" style={{ fontSize: '28px' }}>Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <p className="text-sm font-medium text-white">{faq.q}</p>
                {openFaq === i ? <ChevronUp size={16} style={{ color: '#A0A0A0' }} /> : <ChevronDown size={16} style={{ color: '#A0A0A0' }} />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm" style={{ color: '#A0A0A0' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
