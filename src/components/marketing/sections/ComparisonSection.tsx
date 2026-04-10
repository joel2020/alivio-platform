import { Check, X, Minus } from 'lucide-react';
import AnimateInView from '../AnimateInView';

const rows = [
  { feature: 'Cost per hire', agency: '$15,000–$30,000', ats: '$0 (but manual work)', alivio: 'Flat monthly fee' },
  { feature: 'Time to first candidates', agency: '2–3 weeks', ats: 'You do the work', alivio: 'Under 24 hours' },
  { feature: 'Candidate sourcing', agency: 'Manual by recruiter', ats: 'Not included', alivio: 'AI-powered, continuous' },
  { feature: 'Personalized outreach', agency: 'Sometimes', ats: 'Not included', alivio: 'AI-generated, per candidate' },
  { feature: 'Pipeline scoring', agency: 'Subjective', ats: 'Manual tags', alivio: 'AI-scored, weighted criteria' },
  { feature: 'Always running', agency: 'No — billable hours', ats: 'No — requires input', alivio: 'Yes — 24/7 agents' },
];

function StatusIcon({ type }: { type: 'good' | 'bad' | 'neutral' }) {
  if (type === 'good') return <Check size={14} color="var(--accent)" strokeWidth={3} />;
  if (type === 'bad') return <X size={14} color="var(--error)" strokeWidth={3} />;
  return <Minus size={14} color="var(--text-muted)" strokeWidth={3} />;
}

function classify(val: string): 'good' | 'bad' | 'neutral' {
  const lower = val.toLowerCase();
  if (lower.includes('ai') || lower.includes('flat') || lower.includes('under 24') || lower.includes('yes') || lower.includes('per candidate') || lower.includes('weighted') || lower.includes('continuous')) return 'good';
  if (lower.includes('not included') || lower.includes('manual') || lower.includes('no —') || lower.includes('you do')) return 'bad';
  return 'neutral';
}

export default function ComparisonSection() {
  return (
    <section style={{ padding: '60px 0', background: '#FAFAFA' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              Alivio vs. The Old Way
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 auto', maxWidth: '560px' }}>
              See how we stack up against traditional recruiting approaches.
            </p>
          </div>
        </AnimateInView>

        <AnimateInView delay={100}>
          <div className="comparison-scroll-wrap" style={{ position: 'relative' }}>
          <div style={{ overflowX: 'auto', borderRadius: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-card)', minWidth: '640px' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '20px 24px', background: 'var(--bg-subtle)' }} />
              <div style={{ padding: '20px 24px', background: 'var(--bg-subtle)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recruiting Agency</p>
              </div>
              <div style={{ padding: '20px 24px', background: 'var(--bg-subtle)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Traditional ATS</p>
              </div>
              <div style={{ padding: '20px 24px', background: '#2563EB', textAlign: 'center', borderLeft: 'none' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alivio</p>
              </div>
            </div>

            {rows.map((row, i) => (
              <div
                key={row.feature}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div style={{ padding: '16px 24px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{row.feature}</p>
                </div>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{row.agency}</p>
                </div>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{row.ats}</p>
                </div>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '8px', background: '#F0F7FF', borderLeft: '2px solid #2563EB' }}>
                  <StatusIcon type={classify(row.alivio)} />
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{row.alivio}</p>
                </div>
              </div>
            ))}
          </div>
          </div>
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}
