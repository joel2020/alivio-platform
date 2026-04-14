import { Link } from 'react-router-dom';
import { Linkedin, Mail, Twitter } from 'lucide-react';

const productLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Features', href: '/#features' },
];

const companyLinks = [
  { label: 'Book a Demo', href: 'https://cal.com/alivio/intro-call30', external: true },
  { label: 'Changelog', href: '/developers', external: false },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/aliviosearchpartners/', external: true },
  { label: 'X / Twitter', href: 'https://x.com/AlivioSearch', external: true },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

const linkStyle = {
  fontSize: '14px',
  color: 'var(--text-muted)',
  textDecoration: 'none',
  transition: 'color 0.15s ease',
};

export default function MarketingFooter() {
  return (
    <footer style={{ backgroundColor: '#09090B', color: '#A1A1AA', borderTop: '1px solid #27272A' }}>
      <div className="mkt-container" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700 }}>A</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em' }}>Alivio</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="https://www.linkedin.com/company/aliviosearchpartners/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: 'var(--text-muted)', transition: 'color 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')} onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}>
                <Linkedin size={18} />
              </a>
              <a href="https://x.com/AlivioSearch" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" style={{ color: 'var(--text-muted)', transition: 'color 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')} onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}>
                <Twitter size={18} />
              </a>
              <a href="mailto:hello@aliviosearchpartners.com" aria-label="Contact email" style={{ color: 'var(--text-muted)', transition: 'color 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')} onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}>
                <Mail size={18} />
              </a>
            </div>
            <p style={{ fontSize: '13px', color: '#71717A', marginTop: '14px' }}>Yonkers, NY</p>
            <p style={{ fontSize: '13px', color: '#71717A', marginTop: '6px' }}>hello@aliviosearchpartners.com</p>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px', letterSpacing: '0.02em' }}>Product</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {productLinks.map(item => (
                <li key={item.label}>
                  <a href={item.href} style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
                  >{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px', letterSpacing: '0.02em' }}>Company</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {companyLinks.map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px', letterSpacing: '0.02em' }}>Legal</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {legalLinks.map(item => (
                <li key={item.label}>
                  <Link to={item.to} style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
                  >{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #27272A', paddingTop: '24px' }}>
          <p style={{ fontSize: '13px', color: '#71717A', margin: 0 }}>
            © 2026 Alivio Search Partners. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer > div > div:first-of-type {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          footer > div > div:first-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
