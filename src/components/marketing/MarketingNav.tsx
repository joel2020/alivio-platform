import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { CAL_COM_BOOKING_URL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../lib/demoBooking';

const navLinks = [
  { label: 'Search Specialties', href: '/product' },
  { label: 'Healthcare', href: '/product' },
  { label: 'Technology', href: '/product' },
  { label: 'Process', href: '/product' },
  { label: 'About', href: '/developers' },
  { label: 'Insights', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

function handleHashLink(href: string, e: React.MouseEvent, closeMenu?: () => void) {
  if (href.startsWith('/#')) {
    e.preventDefault();
    const id = href.replace('/#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    closeMenu?.();
  }
}

export default function MarketingNav() {
  const location = useLocation();
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const showStartFree = !session;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(228,228,231,0.5)' : '1px solid transparent',
          height: '64px',
          boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="mkt-container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', textDecoration: 'none' }}>
            <span style={{ fontSize: '34px', fontWeight: 700, color: '#0B1530', letterSpacing: '0.24em' }}>ALIVIO</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#2D5CE5', letterSpacing: '0.48em', marginLeft: '2px' }}>SEARCH PARTNERS</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden-mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={(e) => handleHashLink(link.href, e)}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: location.pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'color 0.15s ease, background 0.15s ease',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="mkt-btn-ghost hidden-mobile" style={{ height: '40px' }}>Sign In</Link>
            {showStartFree ? <Link to="/signup" className="mkt-btn-secondary hidden-mobile" style={{ height: '40px' }}>Start Free</Link> : null}
            <a
              href={CAL_COM_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}
              aria-label={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}
              className="mkt-btn-primary hidden-mobile"
              style={{ height: '40px' }}
            >
              Book a Call
            </a>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="mobile-only"
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '8px', borderRadius: '8px', transition: 'background 0.15s ease' }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(9,9,11,0.4)', opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'auto' : 'none', transition: 'opacity 0.3s ease' }} />

      <div style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99, background: '#FFFFFF', borderBottom: '1px solid #E4E4E7', padding: '8px 24px 24px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: mobileOpen ? 'translateY(0)' : 'translateY(-8px)', opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'auto' : 'none', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease' }}>
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} onClick={(e) => handleHashLink(link.href, e, () => setMobileOpen(false))} style={{ display: 'block', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', padding: '13px 12px', borderRadius: '10px', borderBottom: '1px solid #F4F4F5' }}>
              {link.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary" style={{ flex: 1, justifyContent: 'center' }} title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}>
            Book a Call
          </a>
          {showStartFree ? <Link to="/signup" className="mkt-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Start Free</Link> : null}
          <Link to="/login" className="mkt-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  );
}
