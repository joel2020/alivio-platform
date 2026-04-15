import AnimateInView from '../AnimateInView';

const steps = [
  {
    title: 'Source',
    description: 'Proprietary AI agents continuously discover talent from global networks and maintain fresh pipelines for every open role.',
  },
  {
    title: 'Screen',
    description: 'Autonomous workflows evaluate role fit, qualifications, and intent signals to instantly prioritize your best candidates.',
  },
  {
    title: 'Engage',
    description: 'AI agents launch personalized, multi-step outreach and adapt messaging based on response behavior in real time.',
  },
  {
    title: 'Place',
    description: 'Your team receives placement-ready shortlists and can move top talent through interviews and offers faster.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="platform-overview" style={{ padding: '72px 0', background: '#FAFAFA' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              How Alivio&apos;s AI agents transform your pipeline
            </h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              One AI-native platform orchestrates your end-to-end talent pipeline with autonomous workflows that never stop.
            </p>
          </div>
        </AnimateInView>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
          {steps.map((step, index) => (
            <AnimateInView key={step.title} delay={index * 60}>
              <div style={{ height: '100%', padding: '24px', borderRadius: '14px', border: '1px solid #E4E4E7', background: '#FFFFFF' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-tint)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '12px' }}>
                  {index + 1}
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: 'var(--text-primary)' }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{step.description}</p>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          #platform-overview .mkt-container > div:last-child { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 640px) {
          #platform-overview .mkt-container > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
