import { ArrowRight, Bookmark, Briefcase, Calendar, Code2, HeartPulse, ShieldCheck, Sparkles, Stethoscope, Target, Users } from 'lucide-react';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const overviewCards = [
  { icon: Briefcase, label: 'Active Searches', value: '24', change: '+14%' },
  { icon: Users, label: 'Candidate Matches', value: '312', change: '+18%' },
  { icon: Bookmark, label: 'Shortlists', value: '48', change: '+11%' },
  { icon: Calendar, label: 'Interviews', value: '76', change: '+9%' },
  { icon: Target, label: 'Match Score', value: '89%', change: '+6 pts' },
];

const candidateRows = [
  ['Priya Raman', 'AI Technical PM', '94%', 'Shortlisted'],
  ['Marcus Lee', 'Full-Stack Engineer', '91%', 'Matched'],
  ['Dr. Elena Brooks', 'Emergency Medicine Physician', '90%', 'Submitted'],
  ['Sarah Mitchell, RN', 'Director of Nursing', '88%', 'Interview'],
];

const stages = [
  ['Sourced', '320', '92%'],
  ['Screened', '187', '70%'],
  ['Shortlist', '96', '48%'],
  ['Submit', '48', '30%'],
  ['Interview', '32', '22%'],
  ['Offer', '12', '12%'],
];

const specialties = [
  [Code2, 'Technology Search', 'Engineering, AI, product, data, and GTM search for software, healthtech, and AI-driven companies.', '/industries/technology'],
  [Stethoscope, 'Physician Recruiting', 'Targeted physician search for emergency medicine, hospitalist, medical director, gastroenterology, psychiatry, and specialty roles.', '/blog/emergency-medicine-physician-recruiting'],
  [HeartPulse, 'Healthcare Leadership Search', 'Clinical and operational leadership searches including DON, LNHA, MDS, revenue cycle, and operations leaders.', '/industries/healthcare'],
  [Sparkles, 'AI Candidate Engine', 'A productized AI recruiting engine for sourcing, outreach, matching, dashboards, shortlists, and monthly optimization.', '/platform'],
];

export default function HomePage() {
  return (
    <div style={{ background: '#fff', color: '#071226' }}>
      <section style={{ padding: '56px 0 36px', background: 'radial-gradient(circle at 80% 20%, rgba(45,92,229,0.14), transparent 30%), linear-gradient(135deg,#ffffff 0%,#f7faff 58%,#eef5ff 100%)', overflow: 'hidden' }}>
        <div className="mkt-container" style={{ maxWidth: '1180px' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: '30px', alignItems: 'center' }}>
            <div>
              <p className="mkt-label" style={{ margin: '0 0 12px', color: '#1D55C6', letterSpacing: '0.22em', fontSize: 11 }}>AI-POWERED SEARCH. HUMAN-DRIVEN RESULTS.</p>
              <h1 style={{ fontSize: 'clamp(36px, 4.4vw, 58px)', lineHeight: 1.02, letterSpacing: '-0.04em', margin: '0 0 16px', color: '#071226', fontWeight: 750 }}>
                Venture-Backed HealthTech Hiring, Built for AI Product Velocity
              </h1>
              <p style={{ margin: '0 0 22px', fontSize: '17px', lineHeight: 1.6, color: '#3C4A62', maxWidth: '650px' }}>
                Alivio helps founders and startup leadership teams hire full-stack engineers, AI-forward product leaders, and healthcare operators who can ship fast inside regulated environments.
              </p>
              <div className="hero-cta" style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
                <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ minWidth: '180px', height: 48, justifyContent: 'center', background: '#061636', boxShadow: '0 12px 26px rgba(6,22,54,0.16)' }}>Book a Hiring Strategy Call <ArrowRight size={16} /></a>
                <a href="#ai-engine" className="mkt-btn-secondary" style={{ minWidth: '160px', height: 48, justifyContent: 'center', borderColor: '#B9C4D8', background: 'rgba(255,255,255,0.72)' }}>See Startup Search Model</a>
                <a href="/start" className="mkt-btn-secondary" style={{ minWidth: '150px', height: 48, justifyContent: 'center', borderColor: '#B9C4D8', background: 'rgba(255,255,255,0.72)' }}>Request a Search Plan</a>
              </div>
              <div className="proof-badges" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px', color: '#30415F', fontSize: '13px', maxWidth: 560 }}>
                {[
                  ['HealthTech + AI Startup Search', ShieldCheck],
                  ['AI Candidate Engine', Sparkles],
                  ['48-Hour Speed-to-Slate', Users],
                  ['Retention-Focused Hiring', Target],
                ].map(([label, Icon]) => (
                  <div key={String(label)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #E0E8F8', boxShadow: '0 6px 14px rgba(20,50,100,0.05)', color: '#1D55C6' }}><Icon size={14} /></span>
                    <span>{String(label)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'radial-gradient(140% 120% at 0% 0%, #0D2E69 0%, #04132F 55%, #031027 100%)', borderRadius: '18px', border: '1px solid #24467B', boxShadow: '0 18px 46px rgba(8,19,48,0.3)', padding: '16px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: '15px', color: '#F4F7FF' }}>AI Candidate Engine</h2>
                <span style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', borderRadius: 8, padding: '5px 8px', fontSize: 11, color: 'rgba(255,255,255,.76)' }}>Live Pipeline</span>
              </div>
              <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px', marginBottom: '10px' }}>
                {overviewCards.map(({ icon: Icon, label, value, change }) => (
                  <div key={label} style={{ border: '1px solid rgba(125,166,244,.22)', borderRadius: '11px', background: 'rgba(255,255,255,.045)', padding: '10px' }}>
                    <Icon size={14} color="#BFD4FF" />
                    <p style={{ margin: '8px 0 5px', color: 'rgba(255,255,255,.72)', fontSize: '10px' }}>{label}</p>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '21px' }}>{value}</p>
                    <p style={{ margin: '5px 0 0', color: '#7EE6A6', fontSize: '10px' }}>↑ {change}</p>
                  </div>
                ))}
              </div>
              <div className="dashboard-bottom" style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 10 }}>
                <div style={{ border: '1px solid rgba(125,166,244,.2)', borderRadius: '12px', background: 'rgba(255,255,255,.035)', padding: '12px' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: 13, color: '#F4F7FF' }}>Top Matches</h3>
                  {candidateRows.map(([name, role, score, status]) => (
                    <div key={name} className="candidate-row" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr .4fr .7fr', gap: 7, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,.1)', color: '#EAF1FF', fontSize: 11 }}>
                      <span>{name}</span><span style={{ color: 'rgba(255,255,255,.74)' }}>{role}</span><span style={{ color: '#7EE6A6', fontWeight: 700 }}>{score}</span><span>{status}</span>
                    </div>
                  ))}
                </div>
                <div style={{ border: '1px solid rgba(125,166,244,.2)', borderRadius: '12px', background: 'rgba(255,255,255,.035)', padding: '12px' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 13, color: '#F4F7FF' }}>Pipeline</h3>
                  <div style={{ display: 'grid', gap: 11 }}>
                    {stages.map(([stage, count, width]) => (
                      <div key={stage} style={{ display: 'grid', gridTemplateColumns: '58px 1fr 30px', gap: 7, alignItems: 'center', fontSize: 11 }}>
                        <span>{stage}</span>
                        <span style={{ height: 6, borderRadius: 999, background: '#0B2453', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width, background: '#6F9CFF', borderRadius: 999 }} /></span>
                        <span style={{ textAlign: 'right', color: 'rgba(255,255,255,.8)' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(100deg, #081F4A 0%, #052255 45%, #02183E 100%)', padding: '18px 0', color: '#fff' }}>
        <div className="mkt-container" style={{ textAlign: 'center', maxWidth: 1180 }}>
          <p style={{ margin: '0 0 12px', fontSize: '11px', letterSpacing: '0.22em', color: '#B8C8E9', textTransform: 'uppercase' }}>built for high-growth healthcare + ai teams</p>
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '12px', fontSize: '13px', fontWeight: 700, color: '#EAF0FF', alignItems: 'center' }}>
            {['Seed to Series B HealthTech', 'AI-Native Product Teams', 'Behavioral Health Platforms', 'Provider Operators', 'Revenue Cycle Teams', 'Clinical Software Builders', 'Founder-Led Startups'].map((name) => <div key={name}>{name}</div>)}
          </div>
        </div>
      </section>

      <section id="ai-engine" style={{ padding: '46px 0', background: '#061636', color: '#fff' }}>
        <div className="mkt-container ai-engine-grid" style={{ maxWidth: 1180, display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 24, alignItems: 'center' }}>
          <div>
            <p className="mkt-label" style={{ color: '#9DBBFF', fontSize: 11 }}>PRODUCTIZED AI RECRUITING INFRASTRUCTURE</p>
            <h2 style={{ fontSize: 'clamp(28px,3.2vw,42px)', lineHeight: 1.06, letterSpacing: '-0.035em', margin: '10px 0 14px' }}>The Alivio AI Candidate Engine</h2>
            <p style={{ color: 'rgba(255,255,255,.74)', fontSize: 16, lineHeight: 1.6 }}>Alivio can support individual searches, or install a repeatable AI-enabled candidate engine for teams that need consistent sourcing, outreach, matching, and pipeline visibility.</p>
            <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ marginTop: 18, display: 'inline-flex', height: 48, background: '#fff', color: '#061636' }}>Get a Pipeline Audit</a>
          </div>
          <div className="engine-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
            {['AI-enabled sourcing engine', 'Role scorecards', 'Candidate matching', 'Personalized outreach', 'Pipeline dashboards', 'Shortlist reports', 'Monthly optimization', 'Human oversight'].map((item) => (
              <div key={item} style={{ border: '1px solid rgba(157,187,255,.22)', borderRadius: 14, padding: 14, background: 'rgba(255,255,255,.045)', color: '#EAF1FF', fontWeight: 700, fontSize: 13 }}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="search-specialties" style={{ padding: '46px 0 24px' }}>
        <div className="mkt-container specialty-cards" style={{ maxWidth: 1180, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
          {specialties.map(([Icon, title, copy, href]) => (
            <article key={String(title)} style={{ border: '1px solid #DCE3F0', borderRadius: '18px', padding: '20px', boxShadow: '0 8px 24px rgba(7,25,62,0.05)', background: '#fff' }}>
              <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, color: '#fff', background: 'linear-gradient(135deg,#EAF2FF 0%,#0B47B7 100%)', marginBottom: 16 }}><Icon size={22} /></div>
              <h2 style={{ margin: '0 0 10px', fontSize: '19px', color: '#132647' }}>{String(title)}</h2>
              <p style={{ margin: '0 0 16px', minHeight: 106, fontSize: '14px', lineHeight: 1.55, color: '#4B5D7D' }}>{String(copy)}</p>
              <a href={String(href)} style={{ color: '#1D55C6', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>Explore →</a>
            </article>
          ))}
        </div>
      </section>

      <section style={{ background: '#061636', padding: '26px 0', color: '#fff', marginTop: 18 }}>
        <div className="mkt-container stats-grid" style={{ maxWidth: 1180, display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 14, textAlign: 'center' }}>
          {[
            ['20+', 'Years Search Experience'],
            ['1,000+', 'Placements Supported'],
            ['48-Hour', 'Shortlist Sprint'],
            ['AI + Human', 'Quality Control'],
            ['Nationwide', 'U.S. + Nearshore'],
          ].map(([value, label]) => <div key={label} style={{ borderLeft: '1px solid rgba(255,255,255,.1)' }}><p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{value}</p><p style={{ margin: '5px 0 0', color: 'rgba(255,255,255,.62)', fontSize: 12 }}>{label}</p></div>)}
        </div>
      </section>

      <section id="process" style={{ padding: '50px 0 28px' }}>
        <div className="mkt-container" style={{ maxWidth: 1180 }}>
          <p className="mkt-label" style={{ color: '#1D55C6', letterSpacing: '.22em', fontSize: 11 }}>HOW ALIVIO WORKS</p>
          <h2 style={{ margin: '10px 0 22px', fontSize: 'clamp(28px,3.2vw,42px)', letterSpacing: '-0.035em', color: '#101F3C', maxWidth: 820 }}>A focused AI search process built for technology, physician, and healthcare hiring.</h2>
          <div className="process-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }}>
            {[
              ['01', 'Define the Search', 'Align on role requirements, compensation, market constraints, candidate profile, and urgency.'],
              ['02', 'Activate the Engine', 'Build target lists, scorecards, outreach workflows, and AI-assisted matching logic.'],
              ['03', 'Deliver Shortlists', 'Curated submissions with fit rationale, risk notes, compensation context, and next steps.'],
            ].map(([num, title, text]) => (
              <div key={title} style={{ border: '1px solid #E1E7F3', borderRadius: 16, padding: 20, color: '#33496D', background: '#F8FBFF' }}>
                <p style={{ color: '#1D55C6', fontWeight: 800, margin: '0 0 12px', fontSize: 13 }}>{num}</p>
                <h3 style={{ color: '#102344', fontSize: 19, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ margin: 0, lineHeight: 1.55, fontSize: 14 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 22px', background: '#F6F9FF' }}>
        <div className="mkt-container specialty-lists" style={{ maxWidth: 1180, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px' }}>
          <div>
            <h2 style={{ marginTop: 0, fontSize: 25 }}>Hard-to-Fill Roles We Support</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
              {['Full-Stack Engineers', 'AI / ML Engineers', 'Technical Product Managers', 'Engineering Leaders', 'Clinical Operations Leaders', 'Revenue Cycle Leaders', 'Healthcare Compliance-Aware Operators', 'Healthcare Product Leaders'].map((item) => <div key={item} style={{ border: '1px solid #DCE6F8', borderRadius: 999, background: '#fff', padding: '10px 13px', color: '#34445E', fontWeight: 600, fontSize: 13 }}>{item}</div>)}
            </div>
          </div>
          <div>
            <h2 style={{ marginTop: 0, fontSize: 25 }}>Built for High-Growth Healthcare and AI Teams</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
              {['HealthTech startups scaling after a fundraise', 'AI-native software teams building in regulated markets', 'Behavioral health platforms modernizing documentation workflows', 'Healthcare providers hiring technical + operational talent', 'Digital health teams balancing product velocity and compliance', 'Clinical software teams with audit-ready documentation needs', 'Operations teams scaling reimbursement-sensitive functions', 'Hybrid and on-site hiring for critical product roles'].map((item) => <div key={item} style={{ border: '1px solid #DCE6F8', borderRadius: 999, background: '#fff', padding: '10px 13px', color: '#34445E', fontWeight: 600, fontSize: 13 }}>{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '42px 0 22px' }}>
        <div className="mkt-container case-grid" style={{ maxWidth: 1180, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
          {[
            ['For companies like JotPsych', 'If you are building AI-powered behavioral health workflows, you need product and engineering talent that can ship quickly while respecting documentation integrity, reimbursement logic, and compliance requirements. We map and recruit on-site or hybrid-ready Full-Stack Engineers and AI-forward Technical PMs who can execute immediately after a raise.'],
            ['Physician group', 'Mapped passive physicians for a hard-to-fill specialty search with compensation and schedule sensitivity.'],
            ['Multi-site healthcare operator', 'Created a leadership pipeline for DON, administrator, and clinical operations searches.'],
          ].map(([title, copy]) => <div key={title} style={{ border: '1px solid #DCE4F2', borderRadius: 16, padding: 20, background: '#fff' }}><h3 style={{ marginTop: 0, marginBottom: 8, color: '#102344', fontSize: 18 }}>{title}</h3><p style={{ color: '#4D5E7B', lineHeight: 1.55, fontSize: 14, margin: 0 }}>{copy}</p></div>)}
        </div>
      </section>

      <section id="contact" style={{ padding: '28px 0 54px' }}>
        <div className="mkt-container" style={{ maxWidth: 1000, borderRadius: '24px', border: '1px solid #DCE4F2', background: '#061636', padding: '38px 28px', textAlign: 'center', color: '#fff', boxShadow: '0 16px 44px rgba(6,22,54,.18)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(28px,3.4vw,42px)', letterSpacing: '-0.035em' }}>Need to make critical hires before your next board update?</h2>
          <p style={{ margin: '0 auto 20px', color: 'rgba(255,255,255,.72)', fontSize: '16px', lineHeight: 1.6, maxWidth: 720 }}>Alivio gives founders, CTOs, CFOs, and VP Product leaders a focused recruiting partner for technical and operational healthcare hiring—optimized for speed, precision, and long-term fit.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ display: 'inline-flex', height: 48, background: '#fff', color: '#061636' }}>Book Founder Intake Call <ArrowRight size={16} /></a>
            <a href="/platform" className="mkt-btn-secondary" style={{ display: 'inline-flex', height: 48, color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}>See How We Run Search</a>
          </div>
        </div>
      </section>

      <style>{`
      @media (max-width: 1200px){.hero-grid,.dashboard-bottom,.process-grid,.specialty-lists,.ai-engine-grid{grid-template-columns:1fr!important}.overview-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}.trust-grid,.stats-grid,.proof-badges,.engine-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}.specialty-cards,.case-grid{grid-template-columns:1fr!important}}
      @media (max-width: 768px){.overview-grid,.stats-grid,.proof-badges,.trust-grid,.engine-cards{grid-template-columns:1fr!important}.candidate-row{grid-template-columns:1fr!important}.hero-cta{flex-direction:column}.specialty-lists div[style*="repeat(2"]{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
