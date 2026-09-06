import { Link } from 'react-router-dom';
import { Linkedin, Mail } from 'lucide-react';
import { AlivioLogo } from '../brand/AlivioLogo';
import { CAL_COM_BOOKING_URL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../lib/demoBooking';

const productLinks = [
  { label: 'Recruitment Services', href: '/services' },
  { label: 'AI Candidate Engine', href: '/product' },
  { label: 'Healthcare Practice', href: '/industries/healthcare' },
  { label: 'Technology Practice', href: '/industries/technology' },
];

const companyLinks = [
  { label: 'About', href: '/about', external: false },
  { label: 'Careers', href: '/careers', external: false },
  { label: 'Request a Search Plan', href: '/start', external: false },
  { label: 'Book a Call', href: CAL_COM_BOOKING_URL, external: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/aliviosearchpartners/', external: true },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Responsible AI', to: '/about#responsible-ai' },
  { label: 'Accessibility', to: '/accessibility' },
];

export default function MarketingFooter() {
  return (
    <footer style={{ backgroundColor: '#09090B', color: '#A1A1AA', borderTop: '1px solid #27272A' }}>
      <div className="mkt-container" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <div className="mkt-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <AlivioLogo variant="dark" markSize={26} wordSize={17} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="https://www.linkedin.com/company/aliviosearchpartners/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: '#A1A1AA' }}><Linkedin size={18} /></a>
              <a href="https://x.com/aliviosearch" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" style={{ color: '#A1A1AA', fontSize: '14px', textDecoration: 'none' }}>X</a>
              <a href="mailto:hello@aliviosearchpartners.com" aria-label="Contact email" style={{ color: '#A1A1AA' }}><Mail size={18} /></a>
            </div>
            <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '14px' }}>Recruiting for Healthcare & Technology</p>
            <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '6px' }}>hello@aliviosearchpartners.com</p>
            <p style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '6px' }}><a href="/" style={{ color: '#A1A1AA' }}>aliviosearchpartners.com</a></p>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Recruiting</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {productLinks.map((item) => (<li key={item.label}><a href={item.href} style={{ fontSize: '14px', color: '#A1A1AA', textDecoration: 'none' }}>{item.label}</a></li>))}
            </ul>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Company</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} style={{ fontSize: '14px', color: '#A1A1AA', textDecoration: 'none' }} title={item.label === 'Book a Call' ? `${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}` : undefined}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Legal</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {legalLinks.map((item) => (<li key={item.label}><Link to={item.to} style={{ fontSize: '14px', color: '#A1A1AA', textDecoration: 'none' }}>{item.label}</Link></li>))}
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #27272A', paddingTop: '24px' }}>
          <p style={{ fontSize: '13px', color: '#A1A1AA', margin: 0 }}>© 2026 Alivio Search Partners. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
