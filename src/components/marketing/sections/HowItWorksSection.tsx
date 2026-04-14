import AnimateInView from '../AnimateInView';

const steps = [
  {
    num: 1,
    title: 'Define',
    description: 'Create a role and tell Alivio what great looks like. Credentials, certifications, care setting, and non-negotiables.',
    exampleLabel: 'Role created',
    example: (
      <div style={{ padding: '14px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Director of Nursing — Long-Term Care</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['Active RN License', 'BSN required', 'ACLS certified', '10+ years leadership'].map(tag => (
            <span key={tag} style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', padding: '2px 8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px' }}>{tag}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: 2,
    title: 'Scout',
    description: 'AI scans healthcare channels continuously to build a candidate pool from credential databases, nursing networks, Vivian Health, and Doximity.',
    exampleLabel: 'Sources scanned',
    example: (
      <div style={{ padding: '14px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>142 candidates identified</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>across 4 sources in 18 minutes</div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          {['Credential DBs (74)', 'Nursing Networks (38)', 'Vivian Health (20)', 'Doximity (10)'].map(s => (
            <span key={s} style={{ fontSize: '10px', padding: '2px 7px', background: 'var(--accent-tint)', color: 'var(--accent)', borderRadius: '4px', fontWeight: 600 }}>{s}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: 3,
    title: 'Enrich',
    description: 'Every candidate profile is automatically enriched with work history, skills, social signals, and contact info.',
    exampleLabel: 'Profile enriched',
    example: (
      <div style={{ padding: '14px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>MS</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Maria Santos, RN, BSN</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>10 years ICU experience at Northwestern Memorial Hospital</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['Active RN License', 'BSN required', 'ACLS certified', 'ICU leadership'].map(s => (
            <span key={s} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-secondary)' }}>{s}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: 4,
    title: 'Signal',
    description: 'Candidates are scored for fit using weighted criteria: skills match, seniority, location, activity signals, and cultural alignment.',
    exampleLabel: 'Score breakdown',
    example: (
      <div style={{ padding: '14px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Maria Santos, RN, BSN</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>94%</span>
        </div>
        {[
          { label: 'Skills match', pct: 96 },
          { label: 'Seniority', pct: 92 },
          { label: 'Location fit', pct: 100 },
          { label: 'Activity signals', pct: 88 },
        ].map(bar => (
          <div key={bar.label} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{bar.label}</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>{bar.pct}%</span>
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
              <div style={{ width: `${bar.pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: 5,
    title: 'Engage',
    description: 'Personalized outreach sequences are generated and can be launched with one click. Emails, LinkedIn messages, follow-ups.',
    exampleLabel: 'Generated message',
    example: (
      <div style={{ padding: '14px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>To: Maria Santos, RN, BSN</div>
        <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          Hi Maria — I noticed your ICU leadership experience at Northwestern and your CCRN certification. We are working with a health system in Chicago looking for an ICU Nurse Manager. Based on your background, this could be a strong next step. Would you be open to a quick conversation?
        </div>
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ padding: '60px 0', background: '#FAFAFA' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px' }}>
            <h2 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              How Alivio Works
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, maxWidth: '560px' }}>
              Five AI agents work as your recruiting team — sourcing, enriching, scoring, and engaging candidates around the clock.
            </p>
          </div>
        </AnimateInView>

        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
          {steps.map((step, i) => (
            <AnimateInView key={step.num} delay={i * 80}>
              <div style={{ display: 'flex', gap: '32px', marginBottom: i < steps.length - 1 ? '0' : '0', position: 'relative' }}>
                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 700, flexShrink: 0, zIndex: 1,
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  }}>
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: '2px', flex: 1, background: '#E4E4E7', minHeight: '40px', marginTop: '4px', marginBottom: '4px' }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingBottom: i < steps.length - 1 ? '40px' : '0' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 8px 0', lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px 0' }}>
                    {step.description}
                  </p>
                  {step.example}
                </div>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  );
}
