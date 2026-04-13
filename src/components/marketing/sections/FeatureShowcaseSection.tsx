import { Check } from 'lucide-react';
import AnimateInView from '../AnimateInView';

function PipelineMockup() {
  const candidates = [
    { name: 'Sarah Chen', role: 'Sr. Backend Eng', score: 94, color: '#10B981', bg: '#D1FAE5', status: 'Engaged', statusBg: '#D1FAE5', statusColor: '#065F46' },
    { name: 'Marcus Reid', role: 'Product Manager', score: 87, color: '#10B981', bg: '#D1FAE5', status: 'Scored', statusBg: '#FEF3C7', statusColor: '#92400E' },
    { name: 'Priya Nair', role: 'Sr. Backend Eng', score: 81, color: '#F59E0B', bg: '#FEF3C7', status: 'Sourced', statusBg: '#F4F4F5', statusColor: '#71717A' },
    { name: 'James Park', role: 'Product Manager', score: 79, color: '#F59E0B', bg: '#FEF3C7', status: 'Responded', statusBg: '#DCFCE7', statusColor: '#166534' },
    { name: 'Lin Wei', role: 'Sr. Backend Eng', score: 73, color: '#EF4444', bg: '#FEE2E2', status: 'Sourced', statusBg: '#F4F4F5', statusColor: '#71717A' },
  ];
  return (
    <div className="feature-mockup" style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>All Candidates</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>847 total · sorted by score</span>
      </div>
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 64px 90px 80px', gap: '8px', padding: '10px 0 6px', borderBottom: '1px solid var(--border)' }}>
          {['Candidate', 'Role', 'Score', 'Status', 'Action'].map(h => (
            <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
          ))}
        </div>
        {candidates.map(c => (
          <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 64px 90px 80px', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.role}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: c.color }}>{c.score}%</div>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', background: c.statusBg, color: c.statusColor }}>{c.status}</span>
            <button style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-tint)', border: 'none', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer' }}>Reach out</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutreachMockup() {
  return (
    <div className="feature-mockup" style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>SC</div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>To: Sarah Chen · sarah.chen@stripe.com</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Re: Senior Backend Engineer · Alivio generated</div>
        </div>
      </div>
      <div style={{ padding: '16px', fontSize: '13px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <p style={{ margin: '0 0 12px' }}>Hi Sarah,</p>
        <p style={{ margin: '0 0 12px' }}>
          I came across your work on{' '}
          <span style={{ background: 'var(--accent-tint)', color: 'var(--accent)', borderRadius: '3px', padding: '1px 4px', fontWeight: 600 }}>distributed caching at Stripe</span>
          {' '}— particularly your blog post on consistent hashing. It's exactly the kind of depth we're looking for.
        </p>
        <p style={{ margin: '0 0 12px' }}>
          We're building a{' '}
          <span style={{ background: 'var(--accent-tint)', color: 'var(--accent)', borderRadius: '3px', padding: '1px 4px', fontWeight: 600 }}>similar high-throughput pipeline in Rust</span>
          {' '}and I think you'd find the technical challenge genuinely interesting.
        </p>
        <p style={{ margin: 0 }}>Would you be open to a 15-minute call this week?</p>
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
        <button style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer' }}>Send now</button>
        <button style={{ fontSize: '12px', fontWeight: 500, padding: '6px 14px', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '7px', cursor: 'pointer' }}>Edit</button>
        <button style={{ fontSize: '12px', fontWeight: 500, padding: '6px 14px', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '7px', cursor: 'pointer' }}>Schedule</button>
      </div>
    </div>
  );
}

function AgentFeedMockup() {
  const events = [
    { time: '2 min ago', agent: 'Scout', text: 'Found 12 new candidates for Senior PM role', color: '#2563EB' },
    { time: '14 min ago', agent: 'Signal', text: 'Updated score for Jane Chen: 87% → 94%', color: '#0891B2' },
    { time: '31 min ago', agent: 'Engage', text: 'Sent follow-up #2 to 8 candidates for Backend role', color: '#059669' },
    { time: '1 hr ago', agent: 'Enrich', text: 'Enriched 23 profiles with GitHub activity data', color: '#D97706' },
    { time: '2 hrs ago', agent: 'Scout', text: 'Identified 34 candidates from 3 sources for DevOps role', color: '#2563EB' },
    { time: '3 hrs ago', agent: 'Signal', text: 'Re-scored pipeline for Senior Backend Eng (role criteria updated)', color: '#0891B2' },
  ];
  return (
    <div className="feature-mockup" style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Agent Activity</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          Live
        </span>
      </div>
      <div style={{ padding: '8px 0' }}>
        {events.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 16px', borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: `${e.color}18`, color: e.color, flexShrink: 0, marginTop: '1px' }}>{e.agent}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 2px' }}>{e.text}</p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{e.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  {
    label: 'PIPELINE MANAGEMENT',
    headline: 'Every Candidate, Ranked and Ready',
    description: 'See your entire pipeline organized by score, stage, and activity. No manual sorting. No guesswork.',
    bullets: [
      'AI-ranked candidate lists updated daily',
      'Filter by score, skill, availability, engagement',
      'One-click actions: advance, reject, reach out',
    ],
    mockup: <PipelineMockup />,
    reverse: false,
  },
  {
    label: 'OUTREACH',
    headline: 'Personalized Messages That Actually Get Replies',
    description: "Alivio generates outreach tailored to each candidate's background, interests, and the role. Not templates — real personalization.",
    bullets: [
      "Personalized to each candidate's profile and work",
      'Multi-channel: email and LinkedIn',
      'Automated follow-up sequences',
    ],
    mockup: <OutreachMockup />,
    reverse: true,
  },
  {
    label: 'AI AGENTS',
    headline: 'Your Recruiting System Runs While You Sleep',
    description: "Alivio's agents work continuously — scanning for new candidates, updating scores as signals change, and flagging top matches the moment they appear.",
    bullets: [
      'Continuous candidate monitoring across sources',
      'Real-time score updates based on new signals',
      'Daily digest of pipeline changes and recommendations',
    ],
    mockup: <AgentFeedMockup />,
    reverse: false,
  },
];

export default function FeatureShowcaseSection() {
  return (
    <section id="features" style={{ padding: '60px 0', background: '#FFFFFF' }}>
      <div className="mkt-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {features.map((f) => (
            <AnimateInView key={f.label} delay={0}>
              <div className="feature-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '64px',
                alignItems: 'center',
              }}>
                <div style={{ order: f.reverse ? 2 : 1 }}>
                  {f.mockup}
                </div>
                <div style={{ order: f.reverse ? 1 : 2 }}>
                  <p className="mkt-label" style={{ marginBottom: '12px' }}>{f.label}</p>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', margin: '0 0 16px 0', lineHeight: 1.3 }}>
                    {f.headline}
                  </h3>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 24px 0' }}>
                    {f.description}
                  </p>
                  <ul className="check-list">
                    {f.bullets.map(b => (
                      <li key={b}>
                        <span className="check-icon">
                          <Check size={11} color="var(--accent)" strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .feature-grid { grid-template-columns: 1fr !important; }
          .feature-grid > div { order: unset !important; }
        }
      `}</style>
    </section>
  );
}
