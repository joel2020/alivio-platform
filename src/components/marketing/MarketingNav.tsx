import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Product', href: '/product' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <span style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700 }}>A</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Alivio</span>
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
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--text-primary)';
                  (e.target as HTMLElement).style.background = 'var(--bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = location.pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)';
                  (e.target as HTMLElement).style.background = 'transparent';
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="mkt-btn-ghost hidden-mobile" style={{ height: '40px' }}>Sign In</Link>
            <Link to="/contact" className="mkt-btn-secondary hidden-mobile" style={{ height: '40px' }}>Book a Demo</Link>
            <Link to="/signup" className="mkt-btn-sm-primary">Start Free</Link>
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

      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 98,
          background: 'rgba(9,9,11,0.4)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Slide-out drawer */}
      <div
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 99,
          background: '#FFFFFF',
          borderBottom: '1px solid #E4E4E7',
          padding: '8px 24px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-8px)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={(e) => handleHashLink(link.href, e, () => setMobileOpen(false))}
              style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '13px 12px',
                borderRadius: '10px',
                borderBottom: '1px solid #F4F4F5',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F9FAFB')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/contact" className="mkt-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Book a Demo</Link>
          <Link to="/signup" className="mkt-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Start Free</Link>
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
