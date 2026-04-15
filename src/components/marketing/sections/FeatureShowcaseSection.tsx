import AnimateInView from '../AnimateInView';

const useCases = [
  {
    title: 'High-volume tech hiring',
    description: 'Launch always-on sourcing and automated screening for software, product, data, and GTM roles across multiple regions.',
    outcomes: ['Keep req coverage high during hiring spikes', 'Prioritize top candidates with AI scoring', 'Scale outreach without adding recruiters'],
  },
  {
    title: 'Executive search',
    description: 'Support retained and in-house executive teams with deep candidate mapping, qualification workflows, and white-glove outreach at scale.',
    outcomes: ['Build longlists from global leadership talent pools', 'Rank candidates against strategic role criteria', 'Deliver placement-ready executive shortlists'],
  },
  {
    title: 'Niche healthcare roles',
    description: 'Find hard-to-reach licensed specialists and clinical leaders with autonomous sourcing and precision matching for complex requirements.',
    outcomes: ['Reduce manual searching for credentialed talent', 'Automate screening against strict must-haves', 'Fill specialist roles faster with lower acquisition cost'],
  },
];

export default function FeatureShowcaseSection() {
  return (
    <section id="use-cases" style={{ padding: '72px 0', background: '#FAFAFA' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 42px' }}>
            <h2 style={{ fontSize: '42px', letterSpacing: '-0.03em', margin: '0 0 14px 0', color: 'var(--text-primary)' }}>Use cases built for scale</h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              From enterprise TA teams to search firms, Alivio&apos;s AI agents for talent acquisition adapt to every hiring model.
            </p>
          </div>
        </AnimateInView>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
          {useCases.map((useCase, index) => (
            <AnimateInView key={useCase.title} delay={index * 80}>
              <article style={{ height: '100%', borderRadius: '14px', border: '1px solid #E4E4E7', background: '#FFFFFF', padding: '24px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', lineHeight: 1.3, color: 'var(--text-primary)' }}>{useCase.title}</h3>
                <p style={{ margin: '0 0 14px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{useCase.description}</p>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px' }}>
                  {useCase.outcomes.map((outcome) => (
                    <li key={outcome} style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{outcome}</li>
                  ))}
                </ul>
              </article>
            </AnimateInView>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          #use-cases .mkt-container > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
