import { ArrowRight, Bookmark, Briefcase, Calendar, CheckCircle2, Code2, HeartPulse, Search, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const overviewCards = [
  { icon: Briefcase, label: 'Active Searches', value: '24', change: '+14% vs last week' },
  { icon: Users, label: 'Candidate Matches', value: '312', change: '+18% vs last week' },
  { icon: Bookmark, label: 'Client Shortlists', value: '48', change: '+11% vs last week' },
  { icon: Calendar, label: 'Interview Pipeline', value: '76', change: '+9% vs last week' },
  { icon: Target, label: 'AI Match Score', value: '89%', change: '+6 pts vs last week' },
];

const candidateRows = [
  ['Sarah Mitchell, RN', 'Director of Nursing', '94%', 'Shortlisted'],
  ['Marcus Lee', 'Full-Stack Engineer', '91%', 'Matched'],
  ['Priya Raman', 'AI Technical PM', '89%', 'Submitted'],
  ['Daniel Torres', 'LNHA', '87%', 'Interview'],
];

const stages = [
  ['Sourced', '320', '92%'],
  ['Screened', '187', '70%'],
  ['Shortlisted', '96', '48%'],
  ['Submitted', '48', '30%'],
  ['Interview', '32', '22%'],
  ['Offer', '12', '12%'],
];

export default function HomePage() {
  return (
    <div style={{ background: '#fff', color: '#071226' }}>
      <section style={{ padding: '82px 0 50px', background: 'radial-gradient(circle at 80% 20%, rgba(45,92,229,0.16), transparent 30%), linear-gradient(135deg,#ffffff 0%,#f7faff 58%,#eef5ff 100%)', overflow: 'hidden' }}>
        <div className="mkt-container" style={{ maxWidth: '1320px' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: '42px', alignItems: 'center' }}>
            <div>
              <p className="mkt-label" style={{ margin: '0 0 18px', color: '#1D55C6', letterSpacing: '0.32em' }}>AI-POWERED SEARCH. HUMAN-DRIVEN RESULTS.</p>
              <h1 style={{ fontSize: 'clamp(44px, 5.6vw, 82px)', lineHeight: 0.96, letterSpacing: '-0.055em', margin: '0 0 24px', color: '#071226', fontWeight: 700 }}>
                AI-Powered Search for Healthcare and Technology Hiring
              </h1>
              <p style={{ margin: '0 0 30px', fontSize: '19px', lineHeight: 1.75, color: '#3C4A62', maxWidth: '690px' }}>
                Alivio Search Partners combines senior recruiting expertise with AI-enabled sourcing to help organizations find, engage, and hire hard-to-reach talent.
              </p>
              <div className="hero-cta" style={{ display: 'flex', gap: '14px', marginBottom: '34px' }}>
                <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ minWidth: '230px', justifyContent: 'center', background: '#061636', boxShadow: '0 18px 36px rgba(6,22,54,0.18)' }}>Book an Intro Call <ArrowRight size={18} /></a>
                <a href="#search-specialties" className="mkt-btn-secondary" style={{ minWidth: '230px', height: '56px', justifyContent: 'center', borderColor: '#B9C4D8', background: 'rgba(255,255,255,0.72)' }}>View Search Specialties</a>
              </div>
              <div className="proof-badges" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '14px', color: '#30415F', fontSize: '14px' }}>
                {[
                  ['Healthcare + Tech Search', ShieldCheck],
                  ['AI-Enabled Sourcing', Sparkles],
                  ['Executive-Level Delivery', Users],
                  ['U.S.-Based Recruiting Partner', Target],
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
                <h2 style={{ margin: 0, fontSize: '17px', color: '#F4F7FF' }}>Search Overview</h2>
                <span style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: 'rgba(255,255,255,.76)' }}>This Week⌄</span>
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
                  <a href="#process" style={{ display: 'inline-block', marginTop: 8, color: '#BFD4FF', fontSize: 13, textDecoration: 'none' }}>View all matches →</a>
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
          <p style={{ margin: '0 0 18px', fontSize: '12px', letterSpacing: '0.28em', color: '#B8C8E9', textTransform: 'uppercase' }}>Trusted by leading organizations</p>
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '18px', fontSize: '16px', fontWeight: 700, color: '#EAF0FF', alignItems: 'center' }}>
            {['HCA Healthcare', 'Tenet Health', 'Encompass Health', 'Cleveland Clinic', 'Epic', 'Mayo Clinic', 'ModMed'].map((name) => <div key={name}>{name}</div>)}
          </div>
        </div>
      </section>

      <section id="search-specialties" style={{ padding: '56px 0 20px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '28px' }} className="specialty-cards">
          {[
            [HeartPulse, 'Healthcare Search', 'Clinical, operational, and leadership searches for hospitals, health systems, skilled nursing, post-acute care, and healthcare organizations.', 'Explore Healthcare Search'],
            [Code2, 'Technology Search', 'Engineering, product, AI, data, and GTM hiring for technology, healthtech, and software companies.', 'Explore Technology Search'],
            [Sparkles, 'AI-Enabled Recruiting', 'AI-supported sourcing, evaluation, and outreach workflows designed to identify stronger candidates faster.', 'Learn More About Our Approach'],
          ].map(([Icon, title, copy, cta]) => (
            <article key={String(title)} style={{ border: '1px solid #DCE3F0', borderRadius: '20px', padding: '34px', boxShadow: '0 10px 34px rgba(7,25,62,0.07)', background: '#fff' }}>
              <div style={{ width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 18, color: '#fff', background: 'linear-gradient(135deg,#EAF2FF 0%,#0B47B7 100%)', marginBottom: 26 }}><Icon size={30} /></div>
              <h2 style={{ margin: '0 0 14px', fontSize: '25px', color: '#132647' }}>{String(title)}</h2>
              <p style={{ margin: '0 0 24px', minHeight: 98, fontSize: '16px', lineHeight: 1.68, color: '#4B5D7D' }}>{String(copy)}</p>
              <a href="#contact" style={{ color: '#1D55C6', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>{String(cta)} →</a>
            </article>
          ))}
        </div>
      </section>

      <section style={{ background: '#061636', padding: '36px 0', color: '#fff', marginTop: 28 }}>
        <div className="mkt-container stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 18, textAlign: 'center' }}>
          {[
            ['20+', 'Years of Search Excellence'],
            ['1,000+', 'Placements Completed'],
            ['95%', 'Client Retention Rate'],
            ['48-Hour', 'Targeted Shortlist Delivery'],
            ['Nationwide', 'U.S.-Based Recruiting Partner'],
          ].map(([value, label]) => <div key={label} style={{ borderLeft: '1px solid rgba(255,255,255,.1)' }}><p style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>{value}</p><p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,.62)', fontSize: 13 }}>{label}</p></div>)}
        </div>
      </section>

      <section id="process" style={{ padding: '70px 0 40px' }}>
        <div className="mkt-container">
          <p className="mkt-label" style={{ color: '#1D55C6', letterSpacing: '.24em' }}>HOW ALIVIO WORKS</p>
          <h2 style={{ margin: '12px 0 30px', fontSize: 'clamp(34px,4vw,54px)', letterSpacing: '-0.035em', color: '#101F3C', maxWidth: 850 }}>A focused search process built for speed, precision, and candidate quality.</h2>
          <div className="process-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' }}>
            {[
              ['01', 'Define the Search', 'We align on role requirements, hiring profile, compensation, market constraints, and urgency.'],
              ['02', 'Source + Vet Talent', 'Our team uses AI-enabled sourcing and human recruiter judgment to identify, engage, and evaluate top candidates.'],
              ['03', 'Deliver Shortlists', 'Clients receive curated candidate submissions with clear notes, fit rationale, and next-step recommendations.'],
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
            <h2 style={{ marginTop: 0, fontSize: 30 }}>Featured Healthcare Searches</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              {['Director of Nursing', 'LNHA / Administrator', 'MDS Coordinator', 'Allied Health', 'Physicians', 'Clinical Leadership', 'Revenue Cycle', 'Operations Leadership'].map((item) => <div key={item} style={{ border: '1px solid #DCE6F8', borderRadius: 999, background: '#fff', padding: '12px 16px', color: '#34445E', fontWeight: 600 }}>{item}</div>)}
            </div>
          </div>
          <div>
            <h2 style={{ marginTop: 0, fontSize: 30 }}>Featured Technology Searches</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              {['Full-Stack Engineers', 'AI / ML Engineers', 'Technical Product Managers', 'Data Leaders', 'HealthTech Operators', 'GTM / Sales Leadership', 'Product Leaders', 'Software Architects'].map((item) => <div key={item} style={{ border: '1px solid #DCE6F8', borderRadius: 999, background: '#fff', padding: '12px 16px', color: '#34445E', fontWeight: 600 }}>{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" style={{ padding: '58px 0 70px' }}>
        <div className="mkt-container" style={{ borderRadius: '26px', border: '1px solid #DCE4F2', background: '#061636', padding: '52px 34px', textAlign: 'center', color: '#fff', boxShadow: '0 22px 60px rgba(6,22,54,.2)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(34px,4vw,54px)', letterSpacing: '-0.035em' }}>Ready to build a stronger hiring pipeline?</h2>
          <p style={{ margin: '0 auto 26px', color: 'rgba(255,255,255,.72)', fontSize: '18px', lineHeight: 1.7, maxWidth: 720 }}>Partner with Alivio Search Partners to identify, engage, and hire the healthcare and technology talent your team needs.</p>
          <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ display: 'inline-flex', background: '#fff', color: '#061636' }}>Book an Intro Call <ArrowRight size={18} /></a>
        </div>
      </section>

      <style>{`
      @media (max-width: 1200px){.hero-grid,.dashboard-bottom,.process-grid,.specialty-lists{grid-template-columns:1fr!important}.overview-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}.trust-grid,.stats-grid,.proof-badges{grid-template-columns:repeat(2,minmax(0,1fr))!important}.specialty-cards{grid-template-columns:1fr!important}}
      @media (max-width: 768px){.overview-grid,.stats-grid,.proof-badges,.trust-grid{grid-template-columns:1fr!important}.candidate-row,.candidate-header{grid-template-columns:1fr!important}.candidate-header{display:none!important}.hero-cta{flex-direction:column}.specialty-lists div[style*="repeat(2"]{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
