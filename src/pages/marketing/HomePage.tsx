import { ArrowRight, Calendar, Users, Bookmark, BriefcaseBusiness, Target, ShieldCheck, Sparkles, CircleUserRound, MapPin } from 'lucide-react';

const overviewCards = [
  { icon: BriefcaseBusiness, label: 'Active Searches', value: '24', delta: '↑ 14% vs last week' },
  { icon: Users, label: 'Candidate Matches', value: '312', delta: '↑ 18% vs last week' },
  { icon: Bookmark, label: 'Client Shortlists', value: '48', delta: '↑ 11% vs last week' },
  { icon: Calendar, label: 'Interview Pipeline', value: '76', delta: '↑ 9% vs last week' },
  { icon: Target, label: 'AI Match Score', value: '89%', delta: '↑ 6 pts vs last week' },
];

const serviceCards = [
  {
    icon: ShieldCheck,
    title: 'Healthcare Search',
    body: 'Clinical, operational, and leadership searches for hospitals, health systems, and post-acute care organizations.',
    cta: 'Explore Healthcare Search',
  },
  {
    icon: '</>',
    title: 'Technology Search',
    body: 'Engineering, product, AI, data, and GTM hiring for technology and healthtech companies.',
    cta: 'Explore Technology Search',
  },
  {
    icon: Sparkles,
    title: 'AI-Enabled Recruiting',
    body: 'Proprietary AI and data-driven intelligence to source, evaluate, and deliver the right talent faster.',
    cta: 'Learn More About Our Approach',
  },
];

export default function HomePage() {
  return (
    <div style={{ background: '#fff' }}>
      <section style={{ padding: '78px 0 26px' }}>
        <div className="mkt-container" style={{ maxWidth: '1760px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.86fr 1.14fr', gap: '42px', alignItems: 'start' }} className="hero-grid">
            <div>
              <p className="mkt-label" style={{ margin: '0 0 22px', color: '#2E55B8', letterSpacing: '0.2em' }}>AI-POWERED SEARCH. HUMAN-DRIVEN RESULTS.</p>
              <h1 style={{ fontSize: 'clamp(58px, 4.6vw, 104px)', lineHeight: 0.98, letterSpacing: '-0.028em', margin: '0 0 22px', color: '#0A1430' }}>
                AI-Powered Search for Healthcare and Technology Hiring
              </h1>
              <p style={{ margin: '0 0 28px', fontSize: '38px', lineHeight: 1.68, color: '#4F5F7B', maxWidth: '760px' }}>
                Alivio Search Partners combines senior recruiting expertise with AI-enabled sourcing to help organizations find, engage, and hire hard-to-reach talent.
              </p>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '26px' }} className="hero-cta">
                <a href="/signup" className="mkt-btn-primary-lg" style={{ minWidth: '248px', justifyContent: 'center', fontSize: '31px' }}>Book an Intro Call <ArrowRight size={18} /></a>
                <a href="/product" className="mkt-btn-secondary" style={{ minWidth: '250px', height: '56px', justifyContent: 'center', borderColor: '#C9D0DE', fontSize: '18px' }}>View Search Specialties</a>
              </div>
              <div style={{ display: 'flex', gap: '26px', color: '#4A5873', fontSize: '16px' }} className="usp-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={20} color="#2D5CE5" /> Healthcare + Tech Search</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Sparkles size={20} color="#2D5CE5" /> AI-Enabled Sourcing</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CircleUserRound size={20} color="#2D5CE5" /> Executive-Level Delivery</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={20} color="#2D5CE5" /> U.S.-Based Recruiting Partner</div>
              </div>
            </div>

            <div style={{ background: 'radial-gradient(140% 120% at 0% 0%, #0D2E69 0%, #04132F 55%, #031027 100%)', borderRadius: '18px', border: '1px solid #24467B', boxShadow: '0 12px 30px rgba(8,19,48,0.34)', padding: '22px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '30px', color: '#D9E7FF' }}>Search Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px' }} className="overview-grid">
                {overviewCards.map(({ icon: Icon, label, value, delta }) => (
                  <div key={label} style={{ border: '1px solid #2A4F8B', borderRadius: '12px', background: 'rgba(13,39,83,0.76)', padding: '14px' }}>
                    <Icon size={17} color="#BFD4FF" />
                    <p style={{ margin: '10px 0 8px', color: '#D6E4FF', fontSize: '13px' }}>{label}</p>
                    <p style={{ margin: '0 0 8px', color: '#fff', fontWeight: 700, fontSize: '26px' }}>{value}</p>
                    <p style={{ margin: 0, color: '#7CE8A2', fontSize: '13px' }}>{delta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(100deg, #081F4A 0%, #052255 45%, #02183E 100%)', padding: '20px 0 22px', color: '#fff' }}>
        <div className="mkt-container" style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 14px', fontSize: '12px', letterSpacing: '0.36em', color: '#B8C8E9' }}>TRUSTED BY LEADING ORGANIZATIONS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '12px', fontSize: '20px', fontWeight: 600, color: '#EAF0FF' }} className="trust-grid">
            {['HCA Healthcare', 'Tenet Health', 'Encompass Health', 'Cleveland Clinic', 'Epic', 'Mayo Clinic', 'ModMed'].map((name) => (
              <div key={name}>{name}</div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '34px 0 0' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' }}>
          {serviceCards.map((card) => (
            <div key={card.title} style={{ border: '1px solid #DCE3F0', borderRadius: '16px', padding: '38px', boxShadow: '0 8px 30px rgba(7,25,62,0.06)' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '34px', color: '#132647' }}>{card.title}</h3>
              <p style={{ margin: '0 0 24px', fontSize: '25px', lineHeight: 1.65, color: '#4B5D7D' }}>{card.body}</p>
              <a href="/product" style={{ color: '#2D5CE5', fontWeight: 600, textDecoration: 'none', fontSize: '25px' }}>{card.cta} <ArrowRight size={16} /></a>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 1200px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .overview-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .trust-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; row-gap: 12px; }
          .mkt-container > div[style*='repeat(3, minmax(0, 1fr))'] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .hero-cta { flex-direction: column; }
          .usp-row { flex-direction: column; gap: 12px !important; }
        }
      `}</style>
    </div>
  );
}
