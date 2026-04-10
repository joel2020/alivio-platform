import { Link } from 'react-router-dom';
import { Linkedin, Twitter } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer style={{ backgroundColor: '#09090B', color: '#A1A1AA', borderTop: '1px solid #27272A' }}>
      <div className="mkt-container" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700 }}>A</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em' }}>Alivio</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: '240px', margin: '0 0 20px 0' }}>
              The AI-powered talent engine.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" aria-label="LinkedIn" style={{ color: 'var(--text-muted)', transition: 'color 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')} onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}>
                <Linkedin size={18} />
              </a>
              <a href="#" aria-label="Twitter" style={{ color: 'var(--text-muted)', transition: 'color 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')} onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}>
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px', letterSpacing: '0.02em' }}>Product</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Dashboard', 'Pipeline', 'Agents', 'Outreach', 'Scoring'].map(item => (
                <li key={item}>
                  <Link to="#" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
                  >{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px', letterSpacing: '0.02em' }}>Company</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['About', 'Blog', 'Changelog', 'Careers'].map(item => (
                <li key={item}>
                  <Link to="#" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
                  >{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px', letterSpacing: '0.02em' }}>Legal</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Privacy Policy', 'Terms of Service', 'Security'].map(item => (
                <li key={item}>
                  <Link to="#" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
                  >{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #27272A', paddingTop: '24px' }}>
          <p style={{ fontSize: '13px', color: '#71717A', margin: 0 }}>
            &copy; 2025 Alivio. All rights reserved.
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
