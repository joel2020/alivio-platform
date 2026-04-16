import AnimateInView from '../AnimateInView';

const resultRows = [
  { metric: 'Shortlist speed', outcome: '21-Day Avg Shortlist', impact: 'Autonomous sourcing and scoring compress time-to-shortlist without sacrificing fit.' },
  { metric: 'Retention quality', outcome: '90%+ Retention at 12 Months', impact: 'AI-ranked candidates plus recruiter validation improve long-term placement success.' },
  { metric: 'Candidate quality', outcome: 'AI-Matched Candidates Only', impact: 'Every submitted profile passes fit scoring before delivery to your hiring team.' },
  { metric: 'Commercial reliability', outcome: 'Zero Contingency Surprises', impact: 'Transparent pipeline reporting and validated shortlists reduce avoidable hiring risk.' },
];

export default function MetricsSection() {
  return (
    <section id="agency-results" style={{ padding: '72px 0', background: '#FFFFFF' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 24px' }}>
            <p className="mkt-label" style={{ margin: '0 0 14px 0' }}>PIPELINE PERFORMANCE</p>
            <h2 style={{ fontSize: '42px', letterSpacing: '-0.03em', margin: '0 0 14px 0', color: 'var(--text-primary)' }}>
              Outcomes from an AI-first recruiting system
            </h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              Alivio replaces manual recruiting operations with an always-on talent engine built for speed, quality, and retention.
            </p>
          </div>
        </AnimateInView>

        <AnimateInView delay={120}>
          <div style={{ border: '1px solid #E4E4E7', borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>Metric</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>Result</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>Business Impact</th>
                </tr>
              </thead>
              <tbody>
                {resultRows.map((row) => (
                  <tr key={row.metric} style={{ borderTop: '1px solid #E4E4E7' }}>
                    <td style={{ padding: '18px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.metric}</td>
                    <td style={{ padding: '18px 20px', fontWeight: 700, color: 'var(--accent)' }}>{row.outcome}</td>
                    <td style={{ padding: '18px 20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{row.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}
