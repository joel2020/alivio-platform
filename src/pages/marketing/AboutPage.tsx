import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Cpu, Handshake, ShieldCheck } from 'lucide-react';
import { useSeo } from '../../lib/seo';

const values = [
  {
    icon: Compass,
    title: 'Market truth first',
    copy: 'We tell clients what the market will actually bear — compensation, timeline, and trade-offs — before the search starts, not after it stalls.',
  },
  {
    icon: Cpu,
    title: 'AI for volume, people for judgment',
    copy: 'Software sources and screens around the clock. Humans decide who is actually right for the role and why.',
  },
  {
    icon: ShieldCheck,
    title: 'Candidate data is confidential',
    copy: 'Profiles are encrypted, organization-scoped, never indexed by search engines, and never shared without consent.',
  },
  {
    icon: Handshake,
    title: 'Accountable to the hire',
    copy: 'Engagements end when the leader is performing in the seat — with replacement guarantees to back it.',
  },
] as const;

export default function AboutPage() {
  useSeo({
    title: 'About | Alivio Search Partners',
    description:
      'Alivio Search Partners is an AI-enabled recruiting firm for healthcare and technology teams, pairing an AI Candidate Engine with senior recruiters across the US and LATAM.',
    canonicalUrl: 'https://aliviosearchpartners.com/about',
  });

  return (
    <div style={{ backgroundColor: '#FAFAFA' }}>
      <section style={{ background: 'linear-gradient(180deg,#061636 0%,#04132F 100%)', padding: '120px 0 72px' }}>
        <div className="mkt-container">
          <p className="mkt-label" style={{ color: '#8FB4FF' }}>About Alivio</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(34px,4.6vw,58px)', lineHeight: 1.05, letterSpacing: '-.03em', margin: '14px 0 18px', maxWidth: 860 }}>
            A recruiting firm built like a product company.
          </h1>
          <p style={{ color: '#B9C6E4', fontSize: 18, lineHeight: 1.75, maxWidth: 700 }}>
            Alivio — Spanish for relief — exists because critical hires take too long. We rebuilt the search
            process as an operating system: AI agents that source, score, and screen continuously, and recruiters
            who own the outcome. Healthcare and technology teams get shortlists in days and a partner who is
            accountable through the first ninety days in seat.
          </p>
        </div>
      </section>

      <section style={{ padding: '72px 0' }}>
        <div className="mkt-container">
          <p className="mkt-label">How we work</p>
          <h2 style={{ fontSize: 'clamp(28px,3.4vw,44px)', letterSpacing: '-.03em', margin: '10px 0 28px' }}>The principles behind every search.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
            {values.map(({ icon: Icon, title, copy }) => (
              <div key={title} style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 26, background: '#fff', boxShadow: '0 10px 32px rgba(7,25,62,.06)' }}>
                <Icon size={26} color="#1D55C6" />
                <h3 style={{ fontSize: 19, margin: '14px 0 8px' }}>{title}</h3>
                <p style={{ color: '#4D5E7B', lineHeight: 1.7, fontSize: 15 }}>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 72px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 24, padding: 30, background: '#fff' }}>
            <h2 style={{ fontSize: 24, marginBottom: 10 }}>Where we operate</h2>
            <p style={{ color: '#4D5E7B', lineHeight: 1.75 }}>
              Searches run nationwide across the United States, with a nearshore recruiting team in Colombia that
              extends coverage across LATAM time zones. Clinical, technical, and leadership searches all run on the
              same platform and the same reporting cadence.
            </p>
          </div>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 24, padding: 30, background: '#fff' }}>
            <h2 style={{ fontSize: 24, marginBottom: 10 }}>Leadership</h2>
            <p style={{ color: '#4D5E7B', lineHeight: 1.75 }}>
              Alivio was founded by Joel Carias, who spent his career recruiting for health systems and academic
              medical centers before building the AI Candidate Engine that now powers every Alivio search.
            </p>
            <a
              href="https://www.linkedin.com/company/aliviosearchpartners/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1D55C6', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12 }}
            >
              Alivio on LinkedIn <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 80px' }}>
        <div className="mkt-container">
          <div style={{ background: 'linear-gradient(135deg,#061636,#0A2352)', borderRadius: 28, padding: 'clamp(28px,5vw,56px)', textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(26px,3.4vw,40px)', letterSpacing: '-.03em', marginBottom: 12 }}>Work with us — or for us.</h2>
            <p style={{ color: '#B9C6E4', maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.7 }}>
              Hiring teams can request a search plan today. Recruiters and clinicians can explore open positions on
              our careers board.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link>
              <Link to="/careers" className="mkt-btn-secondary" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>View Open Positions</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
