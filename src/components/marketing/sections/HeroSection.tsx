import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

const CANDIDATES = [
  {
    name: 'Maria Santos, RN, BSN',
    role: 'Director of Nursing',
    score: 94,
    scoreBg: '#F0FDF4',
    scoreColor: '#10B981',
    status: 'Interview',
    statusBg: '#F0FDF4',
    statusColor: '#059669',
  },
  {
    name: 'James Holloway, RN',
    role: 'Director of Nursing',
    score: 88,
    scoreBg: '#FFFBEB',
    scoreColor: '#D97706',
    status: 'Screening',
    statusBg: '#F4F4F5',
    statusColor: '#71717A',
  },
  {
    name: 'Danielle Brooks, MSN',
    role: 'Director of Nursing',
    score: 91,
    scoreBg: '#F0FDF4',
    scoreColor: '#10B981',
    status: 'Engaged',
    statusBg: '#EFF6FF',
    statusColor: '#2563EB',
  },
  {
    name: 'Alyssa Turner, RN',
    role: 'Director of Nursing',
    score: 77,
    scoreBg: '#FFFBEB',
    scoreColor: '#D97706',
    status: 'Screening',
    statusBg: '#F4F4F5',
    statusColor: '#71717A',
  },
];

const NAV_ITEMS = [
  'Dashboard',
  'Pipeline',
  'Roles',
  'Outreach',
  'Agents',
];

function DashboardMockup() {
  const [hovered, setHovered] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <div
      className="mockup-3d"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
        transform: hovered
          ? 'perspective(1400px) rotateY(-2deg) rotateX(1deg)'
          : 'perspective(1400px) rotateY(-6deg) rotateX(3deg)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        width: '100%',
      }}
    >
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E4E4E7',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          height: '44px',
          background: '#F9FAFB',
          borderBottom: '1px solid #E4E4E7',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 'auto' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            fontWeight: 500,
            color: '#A1A1AA',
            letterSpacing: '-0.01em',
            pointerEvents: 'none',
          }}
        >
          Alivio OS — Dashboard
        </div>
      </div>

      {/* App shell */}
      <div style={{ display: 'flex', height: '370px', position: 'relative' }}>
        {/* Sidebar */}
        <div
          style={{
            width: '160px',
            background: '#FFFFFF',
            borderRight: '1px solid #F4F4F5',
            padding: '16px 0',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '0 14px 14px',
              borderBottom: '1px solid #F4F4F5',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  background: '#2563EB',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                A
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#09090B', letterSpacing: '-0.01em' }}>
                Alivio
              </span>
            </div>
          </div>

          <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {NAV_ITEMS.map((label) => {
              const active = label === 'Dashboard';
              return (
                <div
                  key={label}
                  style={{
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#09090B' : '#71717A',
                    background: active ? '#F4F4F5' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'default',
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          <div style={{ margin: '14px 8px 0', padding: '10px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F4F4F5' }}>
            <div style={{ fontSize: '9px', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '7px' }}>
              Agents Active
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {['Scout', 'Enrich', 'Signal', 'Engage'].map((a) => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: '#71717A', fontWeight: 500 }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            background: '#FAFAFA',
            padding: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Page title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090B', letterSpacing: '-0.01em' }}>
                Director of Nursing · Long-Term Care
              </div>
              <div style={{ fontSize: '10px', color: '#A1A1AA', marginTop: '1px', fontWeight: 500 }}>
                142 credentialed candidates identified
              </div>
            </div>
            <div
              style={{
                background: '#2563EB',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: '7px',
                cursor: 'default',
              }}
            >
              + Source Candidates
            </div>
          </div>

          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Active Candidates', value: '847' },
              { label: 'Interviews', value: '23' },
              { label: 'Offers', value: '8' },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E4E7',
                  borderRadius: '12px',
                  padding: '14px 14px 12px',
                }}
              >
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#09090B',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#71717A', marginTop: '4px' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Candidate table */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E4E4E7',
              borderRadius: '12px',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 68px 78px',
                padding: '9px 14px',
                background: '#F4F4F5',
                borderBottom: '1px solid #E4E4E7',
              }}
            >
              {['Candidate', 'Score', 'Status'].map((h) => (
                <div
                  key={h}
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#A1A1AA',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {CANDIDATES.map((c, idx) => (
              <div
                key={c.name}
                onMouseEnter={() => setHoveredRow(c.name)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 68px 78px',
                  padding: '10px 14px',
                  borderBottom: '1px solid #F4F4F5',
                  alignItems: 'center',
                  gap: '4px',
                  background: hoveredRow === c.name ? '#F9FAFB' : 'transparent',
                  borderLeft: idx === 0 ? '2px solid #2563EB' : '2px solid transparent',
                  transition: 'background 0.1s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#09090B', lineHeight: 1.3 }}>
                    {c.name}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 7px',
                      background: c.scoreBg,
                      color: c.scoreColor,
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '6px',
                    }}
                  >
                    {c.score}%
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 7px',
                      background: c.statusBg,
                      color: c.statusColor,
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function HeroSection() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero-section" style={{ paddingTop: '140px', paddingBottom: '100px', background: 'var(--bg-base)' }}>
      <div className="mkt-container">
        <div
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '45% 55%',
            gap: '72px',
            alignItems: 'center',
          }}
        >
          {/* Left column — copy */}
          <div>
            <div
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                transitionDelay: '0.05s',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  background: 'var(--accent-tint)',
                  border: '1px solid var(--accent-subtle)',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  marginBottom: '28px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'inline-block',
                  }}
                />
                Trusted by healthcare hiring teams
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.035em',
                color: 'var(--text-primary)',
                margin: '0 0 24px 0',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                transitionDelay: '0.15s',
              }}
            >
              Fill Hard-to-Staff Healthcare Roles in Days, Not Months
            </h1>

            <p
              style={{
                fontSize: '18px',
                fontWeight: 400,
                lineHeight: 1.65,
                color: 'var(--text-secondary)',
                maxWidth: '480px',
                margin: '0 0 40px 0',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                transitionDelay: '0.25s',
              }}
            >
              Alivio gives your team an AI-powered system that sources, scores, and engages qualified nurses, clinicians, and healthcare leaders around the clock — so roles get filled before they become crises.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '20px',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                transitionDelay: '0.35s',
              }}
            >
              <Link to="/signup" className="mkt-btn-primary">
                Start Free
                <ArrowRight size={16} />
              </Link>
              <a
                href="/#how-it-works"
                className="mkt-btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play size={14} fill="currentColor" style={{ opacity: 0.6 }} />
                See How It Works
              </a>
            </div>

            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                opacity: heroVisible ? 1 : 0,
                transition: 'opacity 0.6s ease-out',
                transitionDelay: '0.5s',
              }}
            >
              No credit card required · Setup in 5 minutes · Cancel anytime
            </p>
          </div>

          {/* Right column — mockup */}
          <div
            className="hero-mockup-wrap"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
              transitionDelay: '0.25s',
            }}
          >
            <DashboardMockup />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 56px !important; }
          .hero-mockup-wrap { max-width: 600px; margin: 0 auto; }
        }
        @media (max-width: 768px) {
          .hero-section { padding-top: 100px !important; padding-bottom: 64px !important; }
          .hero-mockup-wrap { max-width: 480px; }
        }
        @media (max-width: 768px) {
          .mockup-3d {
            transform: none !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
          }
        }
      `}</style>
    </section>
  );
}
