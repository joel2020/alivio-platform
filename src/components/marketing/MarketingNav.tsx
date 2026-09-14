import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AlivioLogo } from '../brand/AlivioLogo';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const navLinks = [
  { label: 'Employers', href: '/employers' },
  { label: 'Candidates', href: '/candidates' },
  { label: 'Industries', href: '/industries' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'About', href: '/about' },
  { label: 'Nearshore LATAM', href: '/nearshore-latam-recruiting' },
  { label: 'Contact', href: '/contact' },
];
const practiceLinks = [
  { label: 'Healthcare recruiting', href: '/industries/healthcare' },
  { label: 'Technology recruiting', href: '/industries/technology' },
  { label: 'Executive & leadership search', href: '/industries/executive' },
];

export default function MarketingNav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); }, [location.pathname, location.hash]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1200px)');
    const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    const background = Array.from(document.querySelectorAll<HTMLElement>('main, footer, .skip-link'));
    const previousInert = background.map(element => element.inert);
    document.body.style.overflow = 'hidden';
    background.forEach(element => { element.inert = true; });
    panel?.querySelector<HTMLElement>('button, a')?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button'));
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      document.removeEventListener('keydown', handleKey);
    };
  }, [mobileOpen]);

  const isCurrent = (href: string) => href.includes('#')
    ? `${location.pathname}${location.hash}` === href
    : location.pathname === href;

  const closeMenu = () => { setMobileOpen(false); toggleRef.current?.focus(); };

  return (
    <>
      <nav className="mkt-navigation" aria-label="Main navigation">
        <div className="mkt-container mkt-nav-inner">
          <Link to="/" className="mkt-nav-logo" title="Alivio Search Partners — home">
            <AlivioLogo variant="light" markSize={32} wordSize={23} />
          </Link>
          <div className="mkt-desktop-nav">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}>
                {link.label}
              </Link>
            ))}
            <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary">Book a Recruiting Call</a>
          </div>
          <button ref={toggleRef} type="button" className="mkt-menu-toggle" onClick={() => setMobileOpen(open => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-navigation">
            {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <>
          <div className="mkt-menu-backdrop" onClick={closeMenu} aria-hidden="true" />
          <div id="mobile-navigation" ref={panelRef} className="mkt-mobile-panel" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="mkt-mobile-panel-heading">
              <strong>Explore Alivio</strong>
              <button type="button" className="mkt-menu-close" onClick={closeMenu} aria-label="Close navigation menu"><X size={24} aria-hidden="true" /></button>
            </div>
            <nav aria-label="Mobile navigation">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} aria-current={isCurrent(link.href) ? 'page' : undefined}>{link.label}</Link>
              ))}
            </nav>
            <div className="mkt-mobile-practices">
              <p>Our practices & coverage</p>
              <nav aria-label="Recruiting practices">{practiceLinks.map(link => <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}>{link.label}</Link>)}</nav>
            </div>
            <div className="mkt-mobile-actions">
              <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary" onClick={closeMenu}>Book a Recruiting Call</a>
              <Link to="/jobs" className="mkt-btn-secondary" onClick={() => setMobileOpen(false)}>View Open Jobs</Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
