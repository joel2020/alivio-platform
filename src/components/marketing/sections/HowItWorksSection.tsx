import AnimateInView from '../AnimateInView';

const steps = [
  {
    title: 'AI Intake & Role Calibration',
    description: 'We configure the targeting model to your exact role requirements, licensure filters, compensation bands, and must-have experience.',
  },
  {
    title: 'Autonomous Sourcing',
    description: 'AI agents scan databases, job boards, and professional networks around the clock to build an always-on intelligent pipeline.',
  },
  {
    title: 'Intelligent Scoring',
    description: 'Candidates are ranked by fit score, credential match, and engagement likelihood before any human touches the pipeline.',
  },
  {
    title: 'Human Validation & Delivery',
    description: 'Our recruiters validate top AI-ranked matches and deliver a high-confidence shortlist your team can interview immediately.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="platform-overview" style={{ padding: '72px 0', background: '#FAFAFA' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              How your AI talent engine runs
            </h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              No manual cold outreach. No guesswork. Just a pipeline built to convert.
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
