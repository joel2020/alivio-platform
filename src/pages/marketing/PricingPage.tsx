import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CAL_COM_BOOKING_URL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../lib/demoBooking';

const plans = [
  { name: 'Starter', price: '$499/mo', features: ['Up to 3 active roles', 'Agents: Scout, Enrich, Signal', '500 candidates/mo', 'Email outreach only', 'Voice: — not included'] },
  { name: 'Growth', price: '$1,249/mo', features: ['Up to 10 active roles', 'All 7 agents including Voice', '2,500 candidates/mo', 'Email + LinkedIn outreach', 'Voice: included (up to 100 calls/mo)'] },
  { name: 'Scale', price: '$2,999/mo', features: ['Up to 30 active roles', 'All 7 agents including Voice', '10,000 candidates/mo', 'Multi-channel outreach', 'Voice: included (up to 500 calls/mo)'] },
];

const faqs = [
  { q: 'Do you charge per hire?', a: 'No. Alivio charges a flat monthly subscription. A single placement through a traditional agency costs $15,000–$30,000. Our Pro plan pays for itself with one hire.' },
  { q: 'Can I change plans?', a: 'Yes. Upgrade or downgrade anytime.' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center border-b" style={{ borderColor: '#1E1E1E' }}>
        <h1 className="font-bold text-white mb-4" style={{ fontSize: '48px', lineHeight: '1.1' }}>Healthcare Recruiting Software Pricing — No Per-Hire Fees</h1>
        <p className="text-xl mb-2" style={{ color: '#A0A0A0' }}>Simple Pricing for Healthcare Recruiting Teams</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.name} className="p-6 rounded-xl border" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
              <p className="font-semibold text-white mb-1">{plan.name}</p>
              <p className="text-2xl font-bold text-white mb-6">{plan.price}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => {
                  const excluded = f.toLowerCase().includes('not included');
                  return (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#A0A0A0' }}>
                      <span className="mt-0.5 flex-shrink-0 text-xs" style={{ color: excluded ? '#F87171' : '#22C55E' }}>{excluded ? '✗' : '✓'}</span>
                      {f}
                    </li>
                  );
                })}
              </ul>
              <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="block text-center px-4 py-2.5 rounded font-medium text-sm" style={{ backgroundColor: '#4F46E5', color: '#FFFFFF' }} title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}>Discuss a Search →</a>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-10">
        <h2 className="font-semibold text-white mb-8 text-center" style={{ fontSize: '28px' }}>Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <p className="text-sm font-medium text-white">{faq.q}</p>
                {openFaq === i ? <ChevronUp size={16} style={{ color: '#A0A0A0' }} /> : <ChevronDown size={16} style={{ color: '#A0A0A0' }} />}
              </button>
              {openFaq === i ? <div className="px-5 pb-5"><p className="text-sm" style={{ color: '#A0A0A0' }}>{faq.a}</p></div> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <p style={{ color: '#FFFFFF', fontSize: '24px', marginBottom: '18px' }}>Ready to stop overpaying agencies?</p>
        <p style={{ color: '#A0A0A0', marginBottom: '20px' }}>Book an intro call or email joel@aliviosearchpartners.com with the role you need to fill.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-secondary" title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}>Book an Intro Call</a>
          <a href="mailto:joel@aliviosearchpartners.com" className="mkt-btn-primary">Send Us a Role</a>
        </div>
      </section>
    </div>
  );
}
