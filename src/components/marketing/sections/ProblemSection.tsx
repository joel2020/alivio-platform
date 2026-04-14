import AnimateInView from '../AnimateInView';

const problems = [
  {
    title: 'Agency fees eat 20-25% of first-year salary — for roles that still take 60+ days to fill',
    description: 'High placement fees continue to drain budgets while critical healthcare seats stay open for months.',
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    title: 'Your ATS tracks applicants. It does not find the RNs, DONs, and clinical directors you actually need',
    description: 'Your team still has to source and qualify licensed, credentialed talent manually.',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    title: 'You are posting on Indeed and waiting. Meanwhile the role is uncovered and patient care suffers',
    description: 'When key clinical roles stay open, burnout rises and quality-of-care risk increases.',
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
