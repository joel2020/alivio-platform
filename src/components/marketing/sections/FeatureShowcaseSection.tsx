import AnimateInView from '../AnimateInView';

const useCases = [
  {
    title: 'Autonomous Candidate Sourcing',
    description: 'AI agents run 24/7 sourcing across healthcare and tech talent channels to keep every role pipeline full without cold desks.',
    outcomes: ['Continuously discovers net-new candidates', 'Expands beyond inbound applicants', 'Maintains role-level pipeline health automatically'],
  },
  {
    title: 'AI Fit Scoring Engine',
    description: 'Our models score and rank each profile against role requirements, credentials, and experience signals before recruiter review.',
    outcomes: ['Prioritizes best-fit candidates first', 'Removes manual screening bottlenecks', 'Creates explainable fit-score visibility for every profile'],
  },
  {
    title: 'Automated Multi-Channel Outreach',
    description: 'AI orchestrates personalized outreach and follow-ups, then routes high-intent responses into your active hiring workflow.',
    outcomes: ['Runs consistent messaging at scale', 'Models are tuned for DON, LNHA, MDS, Allied Health, Physicians, and Tech Leadership roles', 'Not generic tooling repurposed for healthcare recruiting'],
  },
];

export default function FeatureShowcaseSection() {
  return (
    <section id="use-cases" style={{ padding: '72px 0', background: '#FAFAFA' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 42px' }}>
            <h2 style={{ fontSize: '42px', letterSpacing: '-0.03em', margin: '0 0 14px 0', color: 'var(--text-primary)' }}>AI recruitment infrastructure, human-validated delivery</h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              We build and operate AI talent engines for healthcare and tech organizations: autonomous sourcing, fit-scored pipelines, recruiter-validated shortlists, and pipeline transparency reports.
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
