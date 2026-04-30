import { ArrowRight, Bookmark, Calendar, CheckCircle2, Compass, Search, ShieldCheck, Target, Users } from 'lucide-react';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const overviewCards = [
  { icon: Search, label: 'Active Searches', value: '24' },
  { icon: Users, label: 'Candidate Matches', value: '312' },
  { icon: Bookmark, label: 'Client Shortlists', value: '48' },
  { icon: Calendar, label: 'Interview Pipeline', value: '76' },
  { icon: Target, label: 'AI Match Score', value: '89%' },
];

const candidateRows = [
  ['Sarah Mitchell, RN', 'Director of Nursing', '94%', 'Shortlisted'],
  ['Marcus Lee', 'Full-Stack Engineer', '91%', 'Matched'],
  ['Priya Raman', 'AI Technical PM', '89%', 'Submitted'],
  ['Daniel Torres', 'LNHA', '87%', 'Interview'],
];

export default function HomePage() {
  return (
    <div style={{ background: '#fff' }}>
      <section style={{ padding: '78px 0 42px' }}>
        <div className="mkt-container" style={{ maxWidth: '1240px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.02fr 0.98fr', gap: '34px', alignItems: 'start' }} className="hero-grid">
            <div>
              <p className="mkt-label" style={{ margin: '0 0 18px', color: '#2E55B8', letterSpacing: '0.2em' }}>ALIVIO SEARCH PARTNERS</p>
              <h1 style={{ fontSize: 'clamp(38px, 5vw, 74px)', lineHeight: 1.04, letterSpacing: '-0.03em', margin: '0 0 18px', color: '#0A1430' }}>
                Hire Critical Healthcare & Technical Talent — Faster
              </h1>
              <p style={{ margin: '0 0 26px', fontSize: '20px', lineHeight: 1.7, color: '#4F5F7B', maxWidth: '730px' }}>
                Alivio Search Partners combines senior recruiting expertise with AI-enabled sourcing to deliver qualified candidate shortlists in days, not months.
              </p>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }} className="hero-cta">
                <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ minWidth: '230px', justifyContent: 'center' }}>Book an Intro Call <ArrowRight size={18} /></a>
                <a href="#search-specialties" className="mkt-btn-secondary" style={{ minWidth: '230px', height: '56px', justifyContent: 'center', borderColor: '#C9D0DE' }}>View Search Specialties</a>
              </div>
              <p style={{ margin: 0, color: '#41526F', fontSize: '15px', fontWeight: 500 }}>Director of Nursing • LNHA • Full-Stack Engineers • AI Technical PMs</p>
            </div>

            <div style={{ background: 'radial-gradient(140% 120% at 0% 0%, #0D2E69 0%, #04132F 55%, #031027 100%)', borderRadius: '18px', border: '1px solid #24467B', boxShadow: '0 12px 30px rgba(8,19,48,0.34)', padding: '22px' }}>
              <h2 style={{ margin: '0 0 14px', fontSize: '24px', color: '#D9E7FF' }}>Active Search Intelligence</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }} className="overview-grid">
                {overviewCards.map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ border: '1px solid #2A4F8B', borderRadius: '12px', background: 'rgba(13,39,83,0.76)', padding: '12px' }}>
                    <Icon size={16} color="#BFD4FF" />
                    <p style={{ margin: '10px 0 8px', color: '#D6E4FF', fontSize: '12px' }}>{label}</p>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '24px' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div style={{ border: '1px solid #35588D', borderRadius: '12px', overflow: 'hidden' }}>
                {candidateRows.map(([name, role, score, status], idx) => (
                  <div key={name} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 80px 110px', gap: '10px', padding: '11px 12px', borderBottom: idx < candidateRows.length - 1 ? '1px solid rgba(112,148,211,0.35)' : 'none', background: 'rgba(9,31,67,0.72)', color: '#EAF1FF', fontSize: '13px' }} className="candidate-row">
                    <span>{name}</span><span>{role}</span><span style={{ color: '#91F1B2', fontWeight: 600 }}>{score}</span><span>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(100deg, #081F4A 0%, #052255 45%, #02183E 100%)', padding: '22px 0', color: '#fff' }}>
        <div className="mkt-container" style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 14px', fontSize: '12px', letterSpacing: '0.2em', color: '#B8C8E9' }}>Trusted by healthcare operators, high-growth technology teams, and founder-led organizations.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '12px', fontSize: '16px', fontWeight: 600, color: '#EAF0FF' }} className="trust-grid">
            {['Hospitals', 'Skilled Nursing Groups', 'Healthtech Companies', 'AI Startups', 'PE-Backed Operators'].map((name) => <div key={name}>{name}</div>)}
          </div>
        </div>
      </section>

      <section id="search-specialties" style={{ padding: '46px 0 20px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' }}>
          <article style={{ border: '1px solid #DCE3F0', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 30px rgba(7,25,62,0.06)' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '28px', color: '#132647' }}>Healthcare Leadership Search</h2>
            <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.65, color: '#4B5D7D' }}>Director of Nursing, LNHA, MDS, physician, allied health, and clinical leadership searches.</p>
          </article>
          <article style={{ border: '1px solid #DCE3F0', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 30px rgba(7,25,62,0.06)' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '28px', color: '#132647' }}>Technical & AI Hiring</h2>
            <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.65, color: '#4B5D7D' }}>Full-stack engineers, AI technical PMs, product leaders, and GTM talent for high-growth teams.</p>
          </article>
          <article style={{ border: '1px solid #DCE3F0', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 30px rgba(7,25,62,0.06)' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '28px', color: '#132647' }}>Candidate Pipeline Intelligence</h2>
            <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.65, color: '#4B5D7D' }}>AI-enabled sourcing, screening, matching, and client-ready shortlists built for faster hiring decisions.</p>
          </article>
        </div>
      </section>

      <section style={{ padding: '20px 0' }}>
        <div className="mkt-container" style={{ border: '1px solid #E2E8F4', borderRadius: '16px', padding: '22px', background: '#F9FBFF', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '12px' }} className="proof-grid">
          {['Nationwide search coverage', 'Healthcare + technology specialization', 'Shortlist-driven delivery', 'High-touch recruiting execution'].map((point) => <div key={point} style={{ fontWeight: 600, color: '#263859', display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle2 size={16} color="#2D5CE5" />{point}</div>)}
        </div>
      </section>

      <section id="process" style={{ padding: '30px 0 18px' }}>
        <div className="mkt-container">
          <h2 style={{ margin: '0 0 16px', fontSize: '34px', color: '#101F3C' }}>Our Search Process</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }} className="process-grid">
            {['Define the role', 'Build the target market', 'Source and engage', 'Vet and score candidates', 'Deliver client-ready shortlists', 'Support interviews and close'].map((step) => (
              <div key={step} style={{ border: '1px solid #E1E7F3', borderRadius: '12px', padding: '16px', color: '#33496D', fontWeight: 500, background: '#fff' }}><Compass size={16} color="#2D5CE5" style={{ marginBottom: '8px' }} />{step}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="healthcare" style={{ padding: '24px 0 12px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="specialties-grid">
          <div style={{ border: '1px solid #E0E6F2', borderRadius: '14px', padding: '20px' }}>
            <h2 style={{ marginTop: 0 }}>Healthcare Search Specialties</h2>
            <p style={{ margin: 0, color: '#4E607E' }}>Director of Nursing • LNHA • MDS Coordinator • Physicians • Allied Health • Clinical leadership</p>
          </div>
          <div id="technology" style={{ border: '1px solid #E0E6F2', borderRadius: '14px', padding: '20px' }}>
            <h2 style={{ marginTop: 0 }}>Technology Search Specialties</h2>
            <p style={{ margin: 0, color: '#4E607E' }}>Full-Stack Engineers • AI Technical PMs • Product leaders • Engineering leaders • GTM leaders • AI/ML talent</p>
          </div>
        </div>
      </section>

      <section id="contact" style={{ padding: '28px 0 54px' }}>
        <div className="mkt-container" style={{ borderRadius: '18px', border: '1px solid #DCE4F2', background: 'linear-gradient(180deg,#F9FBFF 0%, #FFFFFF 100%)', padding: '34px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '34px', color: '#0D1B39' }}>Ready to build a stronger candidate pipeline?</h2>
          <p style={{ margin: '0 0 20px', color: '#526381', fontSize: '18px' }}>Tell us what you’re hiring for, and we’ll map the search strategy, target market, and candidate profile.</p>
          <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ display: 'inline-flex' }}>Book an Intro Call</a>
        </div>
      </section>

      <style>{`
      @media (max-width: 1200px){.hero-grid,.process-grid{grid-template-columns:1fr!important}.overview-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}.trust-grid,.proof-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media (max-width: 900px){.specialties-grid{grid-template-columns:1fr!important}}
      @media (max-width: 768px){.overview-grid,.proof-grid{grid-template-columns:1fr!important}.candidate-row{grid-template-columns:1fr!important}.hero-cta{flex-direction:column}.trust-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
