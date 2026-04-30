import { ArrowRight, Bookmark, Briefcase, Calendar, Code2, HeartPulse, ShieldCheck, Sparkles, Stethoscope, Target, Users } from 'lucide-react';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const overviewCards = [
  { icon: Briefcase, label: 'Active Searches', value: '24', change: '+14% vs last week' },
  { icon: Users, label: 'Candidate Matches', value: '312', change: '+18% vs last week' },
  { icon: Bookmark, label: 'Client Shortlists', value: '48', change: '+11% vs last week' },
  { icon: Calendar, label: 'Interview Pipeline', value: '76', change: '+9% vs last week' },
  { icon: Target, label: 'AI Match Score', value: '89%', change: '+6 pts vs last week' },
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
  ['Shortlisted', '96', '48%'],
  ['Submitted', '48', '30%'],
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
      <section style={{ padding: '84px 0 54px', background: 'radial-gradient(circle at 80% 20%, rgba(45,92,229,0.16), transparent 30%), linear-gradient(135deg,#ffffff 0%,#f7faff 58%,#eef5ff 100%)', overflow: 'hidden' }}>
        <div className="mkt-container" style={{ maxWidth: '1320px' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: '42px', alignItems: 'center' }}>
            <div>
              <p className="mkt-label" style={{ margin: '0 0 18px', color: '#1D55C6', letterSpacing: '0.32em' }}>AI-POWERED SEARCH. HUMAN-DRIVEN RESULTS.</p>
              <h1 style={{ fontSize: 'clamp(44px, 5.6vw, 82px)', lineHeight: 0.96, letterSpacing: '-0.055em', margin: '0 0 24px', color: '#071226', fontWeight: 700 }}>
                AI-Powered Search for Technology, Physician, and Healthcare Hiring
              </h1>
              <p style={{ margin: '0 0 30px', fontSize: '19px', lineHeight: 1.75, color: '#3C4A62', maxWidth: '720px' }}>
                Alivio Search Partners helps healthcare systems, physician groups, and technology companies hire hard-to-find talent using an AI-enabled recruiting engine with senior human recruiter oversight.
              </p>
              <div className="hero-cta" style={{ display: 'flex', gap: '14px', marginBottom: '34px', flexWrap: 'wrap' }}>
                <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ minWidth: '210px', justifyContent: 'center', background: '#061636', boxShadow: '0 18px 36px rgba(6,22,54,0.18)' }}>Book an Intro Call <ArrowRight size={18} /></a>
                <a href="#ai-engine" className="mkt-btn-secondary" style={{ minWidth: '190px', height: '56px', justifyContent: 'center', borderColor: '#B9C4D8', background: 'rgba(255,255,255,0.72)' }}>See the AI Engine</a>
                <a href="/start" className="mkt-btn-secondary" style={{ minWidth: '190px', height: '56px', justifyContent: 'center', borderColor: '#B9C4D8', background: 'rgba(255,255,255,0.72)' }}>Start a Search</a>
              </div>
              <div className="proof-badges" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '14px', color: '#30415F', fontSize: '14px' }}>
                {[
                  ['Technology + Physician Search', ShieldCheck],
                  ['AI Candidate Engine', Sparkles],
                  ['Client-Ready Shortlists', Users],
                  ['U.S. + Nearshore Reach', Target],
                ].map(([label, Icon]) => (
                  <div key={String(label)} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ width: 38, height: 38, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #E0E8F8', boxShadow: '0 8px 20px rgba(20,50,100,0.06)', color: '#1D55C6' }}><Icon size={17} /></span>
                    <span>{String(label)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'radial-gradient(140% 120% at 0% 0%, #0D2E69 0%, #04132F 55%, #031027 100%)', borderRadius: '20px', border: '1px solid #24467B', boxShadow: '0 24px 60px rgba(8,19,48,0.34)', padding: '20px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: '17px', color: '#F4F7FF' }}>AI Candidate Engine</h2>
                <span style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: 'rgba(255,255,255,.76)' }}>Live Pipeline⌄</span>
              </div>
              <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
                {overviewCards.map(({ icon: Icon, label, value, change }) => (
                  <div key={label} style={{ border: '1px solid rgba(125,166,244,.22)', borderRadius: '13px', background: 'rgba(255,255,255,.045)', padding: '14px' }}>
                    <Icon size={17} color="#BFD4FF" />
                    <p style={{ margin: '12px 0 8px', color: 'rgba(255,255,255,.76)', fontSize: '12px' }}>{label}</p>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '27px' }}>{value}</p>
                    <p style={{ margin: '8px 0 0', color: '#7EE6A6', fontSize: '11px' }}>↑ {change}</p>
                  </div>
                ))}
              </div>
              <div className="dashboard-bottom" style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 12 }}>
                <div style={{ border: '1px solid rgba(125,166,244,.2)', borderRadius: '13px', background: 'rgba(255,255,255,.035)', padding: '15px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#F4F7FF' }}>Top Candidate Matches</h3>
                  <div className="candidate-header" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1.1fr .45fr .75fr', gap: 8, color: 'rgba(255,255,255,.45)', fontSize: 11, textTransform: 'uppercase', marginBottom: 8 }}>
                    <span>Candidate</span><span>Role</span><span>Match</span><span>Status</span>
                  </div>
                  {candidateRows.map(([name, role, score, status]) => (
                    <div key={name} className="candidate-row" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1.1fr .45fr .75fr', gap: 8, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,.1)', color: '#EAF1FF', fontSize: 12 }}>
                      <span>{name}</span><span style={{ color: 'rgba(255,255,255,.74)' }}>{role}</span><span style={{ color: '#7EE6A6', fontWeight: 700 }}>{score}</span><span><span style={{ borderRadius: 6, background: 'rgba(76,129,255,.16)', padding: '4px 7px', color: '#DCE8FF' }}>{status}</span></span>
                    </div>
                  ))}
                </div>
                <div style={{ border: '1px solid rgba(125,166,244,.2)', borderRadius: '13px', background: 'rgba(255,255,255,.035)', padding: '15px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#F4F7FF' }}>Pipeline by Stage</h3>
                  <div style={{ display: 'grid', gap: 14 }}>
                    {stages.map(([stage, count, width]) => (
                      <div key={stage} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 34px', gap: 10, alignItems: 'center', fontSize: 12 }}>
                        <span>{stage}</span>
                        <span style={{ height: 7, borderRadius: 999, background: '#0B2453', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width, background: '#6F9CFF', borderRadius: 999 }} /></span>
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

      <section style={{ background: 'linear-gradient(100deg, #081F4A 0%, #052255 45%, #02183E 100%)', padding: '25px 0', color: '#fff' }}>
        <div className="mkt-container" style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 18px', fontSize: '12px', letterSpacing: '0.28em', color: '#B8C8E9', textTransform: 'uppercase' }}>Built for high-stakes hiring teams</p>
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '18px', fontSize: '16px', fontWeight: 700, color: '#EAF0FF', alignItems: 'center' }}>
            {['Hospitals', 'Physician Groups', 'HealthTech Companies', 'AI Startups', 'Skilled Nursing Operators', 'PE-Backed Healthcare Groups', 'Founder-Led Tech Teams'].map((name) => <div key={name}>{name}</div>)}
          </div>
        </div>
      </section>

      <section id="ai-engine" style={{ padding: '72px 0', background: '#061636', color: '#fff' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 32, alignItems: 'center' }} className="ai-engine-grid">
          <div>
            <p className="mkt-label" style={{ color: '#9DBBFF' }}>PRODUCTIZED AI RECRUITING INFRASTRUCTURE</p>
            <h2 style={{ fontSize: 'clamp(34px,4vw,56px)', lineHeight: 1.02, letterSpacing: '-0.04em', margin: '12px 0 18px' }}>The Alivio AI Candidate Engine</h2>
            <p style={{ color: 'rgba(255,255,255,.74)', fontSize: 18, lineHeight: 1.75 }}>Alivio can support individual searches, or install a repeatable AI-enabled candidate engine for hiring teams that need consistent sourcing, outreach, matching, and pipeline visibility.</p>
            <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ marginTop: 22, display: 'inline-flex', background: '#fff', color: '#061636' }}>Get a Candidate Pipeline Audit</a>
          </div>
          <div className="engine-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
            {['AI-enabled sourcing engine', 'Role scorecards and fit criteria', 'Candidate matching and prioritization', 'Personalized outreach workflows', 'Pipeline dashboards and reporting', 'Client-ready shortlist reports', 'Monthly search optimization', 'Human recruiter oversight'].map((item) => (
              <div key={item} style={{ border: '1px solid rgba(157,187,255,.22)', borderRadius: 16, padding: 18, background: 'rgba(255,255,255,.045)', color: '#EAF1FF', fontWeight: 700 }}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="search-specialties" style={{ padding: '64px 0 34px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '20px' }} className="specialty-cards">
          {specialties.map(([Icon, title, copy, href]) => (
            <article key={String(title)} style={{ border: '1px solid #DCE3F0', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 34px rgba(7,25,62,0.07)', background: '#fff' }}>
              <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 18, color: '#fff', background: 'linear-gradient(135deg,#EAF2FF 0%,#0B47B7 100%)', marginBottom: 22 }}><Icon size={28} /></div>
              <h2 style={{ margin: '0 0 14px', fontSize: '22px', color: '#132647' }}>{String(title)}</h2>
              <p style={{ margin: '0 0 24px', minHeight: 118, fontSize: '15px', lineHeight: 1.68, color: '#4B5D7D' }}>{String(copy)}</p>
              <a href={String(href)} style={{ color: '#1D55C6', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Explore →</a>
            </article>
          ))}
        </div>
      </section>

      <section style={{ background: '#061636', padding: '36px 0', color: '#fff', marginTop: 28 }}>
        <div className="mkt-container stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 18, textAlign: 'center' }}>
          {[
            ['20+', 'Years of Search Experience'],
            ['1,000+', 'Placements Supported'],
            ['48-Hour', 'Targeted Shortlist Sprint'],
            ['AI + Human', 'Quality Control'],
            ['Nationwide', 'U.S. + Nearshore Reach'],
          ].map(([value, label]) => <div key={label} style={{ borderLeft: '1px solid rgba(255,255,255,.1)' }}><p style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>{value}</p><p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,.62)', fontSize: 13 }}>{label}</p></div>)}
        </div>
      </section>

      <section id="process" style={{ padding: '70px 0 40px' }}>
        <div className="mkt-container">
          <p className="mkt-label" style={{ color: '#1D55C6', letterSpacing: '.24em' }}>HOW ALIVIO WORKS</p>
          <h2 style={{ margin: '12px 0 30px', fontSize: 'clamp(34px,4vw,54px)', letterSpacing: '-0.035em', color: '#101F3C', maxWidth: 900 }}>A focused AI search process built for technology, physician, and healthcare hiring.</h2>
          <div className="process-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' }}>
            {[
              ['01', 'Define the Search', 'We align on role requirements, compensation, market constraints, candidate profile, and urgency.'],
              ['02', 'Activate the Engine', 'We build target lists, scorecards, outreach workflows, and AI-assisted matching logic for the search.'],
              ['03', 'Deliver Shortlists', 'Clients receive curated submissions with fit rationale, risk notes, compensation context, and next-step recommendations.'],
            ].map(([num, title, text]) => (
              <div key={title} style={{ border: '1px solid #E1E7F3', borderRadius: 18, padding: 26, color: '#33496D', background: '#F8FBFF' }}>
                <p style={{ color: '#1D55C6', fontWeight: 800, margin: '0 0 18px' }}>{num}</p>
                <h3 style={{ color: '#102344', fontSize: 22, margin: '0 0 10px' }}>{title}</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0 26px', background: '#F6F9FF' }}>
        <div className="mkt-container specialty-lists" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          <div>
            <h2 style={{ marginTop: 0, fontSize: 30 }}>Featured Technology Searches</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              {['Full-Stack Engineers', 'AI / ML Engineers', 'Technical Product Managers', 'Data Leaders', 'HealthTech Operators', 'GTM / Sales Leadership', 'Product Leaders', 'Software Architects'].map((item) => <div key={item} style={{ border: '1px solid #DCE6F8', borderRadius: 999, background: '#fff', padding: '12px 16px', color: '#34445E', fontWeight: 600 }}>{item}</div>)}
            </div>
          </div>
          <div>
            <h2 style={{ marginTop: 0, fontSize: 30 }}>Physician & Healthcare Searches</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              {['Emergency Medicine Physician', 'Hospitalist', 'Medical Director', 'Gastroenterologist', 'Psychiatrist', 'Director of Nursing', 'LNHA / Administrator', 'Revenue Cycle Leader'].map((item) => <div key={item} style={{ border: '1px solid #DCE6F8', borderRadius: 999, background: '#fff', padding: '12px 16px', color: '#34445E', fontWeight: 600 }}>{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '58px 0 30px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 18 }} className="case-grid">
          {[
            ['VC-backed AI startup', 'Built a targeted engineering and product shortlist for a technical team that needed senior candidates beyond inbound applicants.'],
            ['Physician group', 'Mapped and contacted passive physicians for a hard-to-fill specialty search with compensation and schedule sensitivity.'],
            ['Multi-site healthcare operator', 'Created a leadership pipeline for DON, administrator, and clinical operations searches across multiple locations.'],
          ].map(([title, copy]) => <div key={title} style={{ border: '1px solid #DCE4F2', borderRadius: 18, padding: 24, background: '#fff' }}><h3 style={{ marginTop: 0, color: '#102344' }}>{title}</h3><p style={{ color: '#4D5E7B', lineHeight: 1.7 }}>{copy}</p></div>)}
        </div>
      </section>

      <section id="contact" style={{ padding: '40px 0 70px' }}>
        <div className="mkt-container" style={{ borderRadius: '26px', border: '1px solid #DCE4F2', background: '#061636', padding: '52px 34px', textAlign: 'center', color: '#fff', boxShadow: '0 22px 60px rgba(6,22,54,.2)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(34px,4vw,54px)', letterSpacing: '-0.035em' }}>Ready to build an AI-powered candidate pipeline?</h2>
          <p style={{ margin: '0 auto 26px', color: 'rgba(255,255,255,.72)', fontSize: '18px', lineHeight: 1.7, maxWidth: 760 }}>Partner with Alivio Search Partners to source, evaluate, and hire technology, physician, and healthcare talent with a more modern search engine.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ display: 'inline-flex', background: '#fff', color: '#061636' }}>Book an Intro Call <ArrowRight size={18} /></a>
            <a href="/platform" className="mkt-btn-secondary" style={{ display: 'inline-flex', color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}>See the AI Engine</a>
          </div>
        </div>
      </section>

      <style>{`
      @media (max-width: 1200px){.hero-grid,.dashboard-bottom,.process-grid,.specialty-lists,.ai-engine-grid{grid-template-columns:1fr!important}.overview-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}.trust-grid,.stats-grid,.proof-badges,.engine-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}.specialty-cards,.case-grid{grid-template-columns:1fr!important}}
      @media (max-width: 768px){.overview-grid,.stats-grid,.proof-badges,.trust-grid,.engine-cards{grid-template-columns:1fr!important}.candidate-row,.candidate-header{grid-template-columns:1fr!important}.candidate-header{display:none!important}.hero-cta{flex-direction:column}.specialty-lists div[style*="repeat(2"]{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
