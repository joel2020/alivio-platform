import { ArrowRight } from 'lucide-react';

const workflowBullets = [
  {
    title: 'Source globally',
    description: 'Autonomous AI agents scan 800M+ profiles and surface qualified candidates in every market.',
  },
  {
    title: 'Screen, score, rank',
    description: 'AI-native platform workflows evaluate fit, prioritize top talent, and keep your shortlist placement-ready.',
  },
  {
    title: 'Engage with precision',
    description: 'Automated candidate sourcing 24/7 meets personalized outreach built for higher reply rates.',
  },
  {
    title: 'Place faster',
    description: 'Move from requisition to shortlist in days with AI agents for talent acquisition running continuously.',
  },
];

export default function HeroSection() {
  return (
    <section style={{ padding: '88px 0 72px', background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)' }}>
      <div className="mkt-container" style={{ maxWidth: '1120px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
          <p className="mkt-label" style={{ margin: '0 0 18px 0' }}>AI RECRUITMENT PLATFORM</p>
          <h1
            style={{
              fontSize: 'clamp(40px, 6vw, 68px)',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              margin: '0 0 20px 0',
              color: 'var(--text-primary)',
            }}
          >
            Scale Recruiting 24/7 with AI Agents
          </h1>
          <p style={{ fontSize: '20px', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 auto 34px', maxWidth: '760px' }}>
            Alivio is the AI recruitment platform that runs your talent pipeline 24/7—so agencies, HR teams, and enterprise recruiters can scale hiring without adding headcount.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', margin: '0 auto 36px', maxWidth: '980px' }}>
          {workflowBullets.map((item) => (
            <div key={item.title} style={{ padding: '22px', borderRadius: '14px', border: '1px solid #E4E4E7', background: '#FFFFFF' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '19px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {item.title}
              </h3>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{item.description}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/signup" className="mkt-btn-primary-lg" style={{ display: 'inline-flex' }}>
            Start Free Trial
            <ArrowRight size={18} />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mkt-container > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
