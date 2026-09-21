import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { DiscussSearchLink } from './RecruitingFirmSections';
import '../../styles/premium-hero.css';

// Adapted from 21st.dev's Editorial Collage Hero by felipemenezes098.
// See docs/licenses/21st-editorial-collage-hero.md for source and license.
const expertise = [
  { title: 'Healthcare', href: '/industries/healthcare' },
  { title: 'Technology', href: '/industries/technology' },
  { title: 'Leadership', href: '/industries/executive' },
  { title: 'LATAM', href: '/nearshore-latam-recruiting' },
  { title: 'Offshore', href: '/offshore-recruitment' },
];

export default function PremiumRecruitingHero() {
  return (
    <section className="premium-hero" aria-labelledby="home-heading">
      <div className="mkt-container">
        <div className="premium-hero-grid">
          <div className="premium-hero-copy">
            <p className="firm-eyebrow"><span className="recruiting-dot" /> A specialized recruiting firm</p>
            <h1 id="home-heading">Hire Better Talent <span>Without Wasting Months</span> on the Search</h1>
            <p className="premium-hero-intro">
              Alivio Search Partners is a specialized recruiting firm helping healthcare organizations, technology companies, and growing businesses find qualified professionals through targeted search, direct outreach, and hands-on candidate vetting — across the U.S., Latin America, and offshore markets.
            </p>
            <div className="premium-hero-actions">
              <DiscussSearchLink />
              <Link to="/jobs" className="firm-text-link">View Open Jobs <ArrowUpRight size={19} aria-hidden="true" /></Link>
            </div>
            <p className="premium-hero-signoff">Focused search. Personal attention. The right fit.</p>
          </div>

          <div className="premium-hero-media">
            <figure className="premium-art">
              <img
                src="/images/recruiting-conversation.jpg"
                width={1000}
                height={1500}
                alt="Professionals collaborating in a thoughtful working conversation"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <figcaption>People make the difference.</figcaption>
            </figure>
            <div className="premium-standard">
              <p className="firm-eyebrow">The Alivio approach</p>
              <p className="premium-standard-title">A personal search.<br />A considered shortlist.</p>
              <ul>
                {['Direct sourcing', 'Hands-on candidate vetting', 'Clear communication'].map(item => (
                  <li key={item}><Check size={15} aria-hidden="true" />{item}</li>
                ))}
              </ul>
              <Link to="/#process" className="firm-text-link">How we work <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>

        <nav className="premium-practice-links" aria-label="Our recruiting expertise">
          <p>Specialized search.<br /><span>U.S. & international.</span></p>
          {expertise.map(item => <Link to={item.href} key={item.href}>{item.title}<ArrowUpRight size={18} aria-hidden="true" /></Link>)}
        </nav>
      </div>
    </section>
  );
}
