import { Link } from 'react-router-dom';
import { AlivioLogo } from '../brand/AlivioLogo';
import { ArrowUpRight } from 'lucide-react';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

export default function MarketingFooter() {
  return <footer className="recruiting-footer"><div className="mkt-container">
    <div className="recruiting-footer-grid"><div><Link to="/" title="Alivio Search Partners home"><AlivioLogo variant="dark" markSize={36} wordSize={26} /></Link><p>Specialized recruiting.<br />Personal attention. Lasting fit.</p><a href="mailto:hello@aliviosearchpartners.com">hello@aliviosearchpartners.com</a><p className="recruiting-footer-caption">Healthcare, technology, and professional search in the U.S. Nearshore recruiting across Latin America.</p></div>
    <nav aria-label="Recruiting"><h2>Recruiting</h2><Link to="/employers">For Employers</Link><Link to="/candidates">For Candidates</Link><Link to="/jobs">View Open Jobs</Link><Link to="/nearshore-latam-recruiting">Nearshore LATAM Recruiting</Link><Link to="/employers#engagement-models">Contingency & Retained Search</Link><a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer">Book a Recruiting Call <ArrowUpRight size={14} aria-hidden="true" /></a></nav>
    <nav aria-label="Industries"><h2>Our expertise</h2><Link to="/industries/healthcare">Healthcare Recruiting</Link><Link to="/industries/technology">Technology Recruiting</Link><Link to="/industries/executive">Executive & Leadership Search</Link><Link to="/industries">All Industries</Link></nav>
    <nav aria-label="Company"><h2>Alivio</h2><Link to="/about">About Us</Link><Link to="/contact">Contact</Link><Link to="/recruiting-agency-westchester">Westchester Recruiting</Link><Link to="/recruiting-agency-medellin">Medellín Recruiting</Link><Link to="/blog">Recruiting Insights</Link><a href="https://www.linkedin.com/company/aliviosearchpartners/" target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></a><Link to="/login">Client Sign In</Link></nav></div>
    <div className="recruiting-footer-bottom"><p>© {new Date().getFullYear()} Alivio Search Partners. All rights reserved.</p><nav aria-label="Legal"><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link><Link to="/accessibility">Accessibility</Link></nav></div>
  </div></footer>;
}
