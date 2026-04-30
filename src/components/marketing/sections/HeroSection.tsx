import { ArrowRight } from 'lucide-react';
import { CAL_COM_BOOKING_URL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../../lib/demoBooking';

const workflowBullets = [
  {
    title: 'Autonomous candidate sourcing',
    description: 'AI agents continuously scan healthcare and tech talent data to surface net-new, role-aligned candidates 24/7.',
  },
  {
    title: 'AI fit scoring engine',
    description: 'Each profile is fit-scored against requirements, credentials, trajectory, and response intent before recruiter review.',
  },
  {
    title: 'Automated multi-channel outreach',
    description: 'Always-on agents run personalized outreach sequences across channels and adapt messaging by engagement signals.',
  },
  {
    title: 'Human-validated shortlists',
    description: 'Expert recruiters validate top-ranked candidates so hiring teams receive quality-controlled shortlists in 21-30 days.',
  },
];

export default function HeroSection() {
  return (
    <section style={{ padding: '88px 0 72px', background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)' }}>
      <div className="mkt-container" style={{ maxWidth: '1120px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
          <p className="mkt-label" style={{ margin: '0 0 18px 0' }}>INTELLIGENT TALENT DELIVERY</p>
          <h1
            style={{
              fontSize: 'clamp(40px, 6vw, 68px)',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              margin: '0 0 20px 0',
              color: 'var(--text-primary)',
            }}
          >
            AI Agents That Source, Score, and Deliver Candidates - 24/7
          </h1>
          <p style={{ fontSize: '20px', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 auto 34px', maxWidth: '760px' }}>
            Alivio operates an always-on hiring engine for healthcare and tech teams, delivering shortlist-ready candidates in 21-30 days with 90%+ 12-month retention.
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
          <a
            href={CAL_COM_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mkt-btn-primary-lg"
            style={{ display: 'inline-flex' }}
            title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}
          >
            Book an Intro Call
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
