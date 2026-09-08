import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ClipboardCheck, HeartPulse, Layers, Stethoscope, Users2 } from 'lucide-react';
import { useSeo } from '../../lib/seo';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const practices = [
  {
    icon: Stethoscope,
    title: 'Physician & Advanced Practice Recruiting',
    copy: 'Retained and contingent search for physicians, NPs, and PAs across primary care, behavioral health, and specialty medicine — sourced, screened, and reference-checked before you meet them.',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare Leadership Search',
    copy: 'CNOs, medical directors, practice administrators, and revenue-cycle leaders for health systems, clinic groups, and digital-health companies.',
  },
  {
    icon: Users2,
    title: 'Technology & Product Search',
    copy: 'Engineers, product leaders, and data teams for high-growth healthtech and AI companies — calibrated to startup velocity and equity-stage compensation.',
  },
  {
    icon: Bot,
    title: 'AI Candidate Engine Programs',
    copy: 'A monthly pipeline program powered by our AI Candidate Engine: continuous sourcing, scoring, and outreach with recruiter review on every shortlist.',
  },
] as const;

const engagement: Array<{ title: string; copy: string; points: string[]; featured?: boolean }> = [
  {
    title: 'Retained search',
    copy: 'A dedicated search for a critical role. Weekly shortlist reports, structured scorecards, and a replacement guarantee.',
    points: ['Kickoff and calibrated scorecard in week one', 'First screened shortlist within days, not weeks', 'Offer design and close management to signature'],
  },
  {
    title: 'Pipeline program',
    copy: 'Continuous hiring across a set of roles. The AI engine keeps the pipeline warm; recruiters keep the quality bar.',
    points: ['Always-on sourcing, scoring, and outreach', 'Monthly market and compensation feedback', 'One partner accountable for every hire'],
    featured: true,
  },
  {
    title: 'Project / RPO support',
    copy: 'Volume clinical or technical hiring for a launch, expansion, or backlog — priced to the project, not per head.',
    points: ['Dedicated recruiting pod', 'Shared dashboards and weekly reporting', 'Handover documentation when the project ends'],
  },
];

export default function ServicesPage() {
  useSeo({
    title: 'Recruitment Services | Alivio Search Partners',
    description:
      'Retained search, pipeline programs, and AI-powered recruiting for healthcare and technology teams: physicians, clinical leadership, engineers, and product leaders.',
    canonicalUrl: 'https://aliviosearchpartners.com/services',
  });

  return (
    <div style={{ backgroundColor: '#FAFAFA' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#061636 0%,#04132F 100%)', padding: '120px 0 72px' }}>
        <div className="mkt-container">
          <p className="mkt-label" style={{ color: '#8FB4FF' }}>Recruitment services</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(34px,4.6vw,58px)', lineHeight: 1.05, letterSpacing: '-.03em', margin: '14px 0 18px', maxWidth: 820 }}>
            The search firm that shows up with a pipeline, not a proposal.
          </h1>
          <p style={{ color: '#B9C6E4', fontSize: 18, lineHeight: 1.75, maxWidth: 680 }}>
            Every engagement runs on the same operating system: AI agents do the sourcing, scoring, and first-pass
            screening around the clock, and senior recruiters own strategy, judgment, and the close.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link>
            <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-secondary mkt-btn-on-dark" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>
              Book a Hiring Strategy Call
            </a>
          </div>
        </div>
      </section>

      {/* Practices */}
      <section style={{ padding: '72px 0' }}>
        <div className="mkt-container">
          <p className="mkt-label">What we recruit</p>
          <h2 style={{ fontSize: 'clamp(28px,3.4vw,44px)', letterSpacing: '-.03em', margin: '10px 0 28px' }}>Four practices. One quality bar.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 18 }}>
            {practices.map(({ icon: Icon, title, copy }) => (
              <div key={title} style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 26, background: '#fff', boxShadow: '0 10px 32px rgba(7,25,62,.06)' }}>
                <Icon size={26} color="#1D55C6" />
                <h3 style={{ fontSize: 20, margin: '14px 0 8px' }}>{title}</h3>
                <p style={{ color: '#4D5E7B', lineHeight: 1.7, fontSize: 15 }}>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="search-page search-page-section search-page-tint">
        <div className="mkt-container search-page-reading">
          <h2>Hiring across Latin America</h2>
          <p>Explore <Link to="/nearshore-latam-recruiting" className="search-page-link">nearshore LATAM recruiting</Link> for technology and operations roles, or focus your search on <Link to="/recruiting-agency-medellin" className="search-page-link">bilingual and technical talent in Medellín</Link>.</p>
        </div>
      </section>

      {/* Engagement models */}
      <section id="engagement-models" style={{ padding: '72px 0', background: '#F6F9FF', scrollMarginTop: 88 }}>
        <div className="mkt-container">
          <p className="mkt-label">How engagements work</p>
          <h2 style={{ fontSize: 'clamp(28px,3.4vw,44px)', letterSpacing: '-.03em', margin: '10px 0 8px' }}>Pick the shape. Keep the standard.</h2>
          <p style={{ color: '#4D5E7B', maxWidth: 640, lineHeight: 1.75 }}>
            Pricing is scoped to the engagement — no seat licenses, no self-serve tier. Every model includes the AI
            Candidate Engine, human recruiter review, and weekly reporting.
          </p>
          <p><Link to="/pricing" className="search-page-link">Compare pricing and engagement options</Link></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 18, marginTop: 30 }}>
            {engagement.map((tier) => (
              <div
                key={tier.title}
                style={{
                  border: tier.featured ? '2px solid #1D55C6' : '1px solid #DCE4F2',
                  borderRadius: 20,
                  padding: 26,
                  background: '#fff',
                  boxShadow: '0 10px 32px rgba(7,25,62,.06)',
                  position: 'relative',
                }}
              >
                {tier.featured ? (
                  <span style={{ position: 'absolute', top: -12, left: 22, background: '#1D55C6', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999 }}>
                    Most common
                  </span>
                ) : null}
                <h3 style={{ fontSize: 21, margin: '4px 0 8px' }}>{tier.title}</h3>
                <p style={{ color: '#4D5E7B', lineHeight: 1.7, fontSize: 15 }}>{tier.copy}</p>
                <ul style={{ marginTop: 14, display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
                  {tier.points.map((point) => (
                    <li key={point} style={{ display: 'flex', gap: 10, color: '#233657', fontSize: 14, lineHeight: 1.6 }}>
                      <ClipboardCheck size={15} color="#1D55C6" style={{ flexShrink: 0, marginTop: 3 }} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI + human */}
      <section style={{ padding: '72px 0' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 20 }}>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 24, padding: 30, background: '#fff' }}>
            <Layers size={28} color="#1D55C6" />
            <h2 style={{ fontSize: 24, margin: '12px 0 8px' }}>What the AI does</h2>
            <p style={{ color: '#4D5E7B', lineHeight: 1.75 }}>
              Sources across licensed and technical talent pools continuously, scores every candidate against the
              role scorecard, drafts outreach, and keeps the pipeline warm with automated follow-ups — with every
              action logged for review.
            </p>
          </div>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 24, padding: 30, background: '#fff' }}>
            <Users2 size={28} color="#1D55C6" />
            <h2 style={{ fontSize: 24, margin: '12px 0 8px' }}>What the humans do</h2>
            <p style={{ color: '#4D5E7B', lineHeight: 1.75 }}>
              Senior recruiters run calibration, validate motivation and compensation fit, conduct interviews and
              references, and manage offers to signature. Nothing reaches your inbox unreviewed.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="mkt-container">
          <div style={{ background: 'linear-gradient(135deg,#061636,#0A2352)', borderRadius: 28, padding: 'clamp(28px,5vw,56px)', textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(26px,3.4vw,40px)', letterSpacing: '-.03em', marginBottom: 12 }}>
              Tell us about the role. We&apos;ll show you the market.
            </h2>
            <p style={{ color: '#B9C6E4', maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.7 }}>
              Send the basics and get a search plan with market mapping, comp guidance, and a realistic timeline —
              before you commit to anything.
            </p>
            <Link to="/start" className="mkt-btn-primary-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Request a Search Plan <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
