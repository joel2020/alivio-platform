import AnimateInView from '../AnimateInView';

const problems = [
  {
    title: 'Agencies charge $20K+ per hire',
    description: "You're paying 20–25% of salary for a process that takes 45–60 days and delivers mixed results.",
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    title: 'Your ATS is a filing cabinet, not a recruiting tool',
    description: 'Greenhouse and Lever track applications. They don\'t find candidates. You still have to do all the work.',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    title: 'Manual sourcing doesn\'t scale',
    description: 'Your team spends 15+ hours per week on LinkedIn doing work an AI system can do in minutes.',
    color: '#F97316',
    bg: '#FFF7ED',
  },
];

export default function ProblemSection() {
  return (
    <section style={{ padding: '60px 0', background: '#FFFFFF' }}>
      <div className="mkt-container">
        <div className="problem-grid" style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '80px', alignItems: 'start' }}>
          <AnimateInView>
            <p className="mkt-label" style={{ marginBottom: '16px' }}>The Problem</p>
            <h2 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--text-primary)', margin: 0 }}>
              Recruiting Is Broken. You're Paying for It.
            </h2>
          </AnimateInView>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {problems.map((p, i) => (
              <AnimateInView key={p.title} delay={i * 100}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: p.bg, border: `1px solid ${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{p.title}</p>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{p.description}</p>
                  </div>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .problem-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
