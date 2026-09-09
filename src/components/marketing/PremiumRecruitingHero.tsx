import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DiscussSearchLink } from './RecruitingFirmSections';
import '../../styles/premium-hero.css';

// Adapted from 21st.dev's Editorial Collage Hero by felipemenezes098.
// See docs/licenses/21st-editorial-collage-hero.md for source and license.
export default function PremiumRecruitingHero() {
  return (
    <section className="premium-hero" aria-labelledby="premium-hero-heading">
      <div className="mkt-container">
        <div className="premium-hero-grid">
          <div className="premium-hero-copy">
            <p className="firm-eyebrow">Alivio Search Partners</p>
            <h1 id="premium-hero-heading">
              Specialist recruiting for <em>healthcare</em> and technology.
            </h1>
            <p className="premium-hero-intro">
              Recruiter-led search for the clinical, technical, and leadership
              talent your next chapter depends on.
            </p>
            <div className="premium-hero-actions">
              <DiscussSearchLink />
              <a href="#search-specialties" className="firm-text-link">
                Explore our expertise <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="premium-hero-signoff">
              Intelligent research. Careful assessment.<br />
              One accountable recruiting partner.
            </p>
          </div>

          <div className="premium-hero-media">
            <div className="premium-art">
              <img
                src="/images/alivio-sculpture.jpg"
                srcSet="/images/alivio-sculpture-small.jpg 600w, /images/alivio-sculpture.jpg 1122w"
                sizes="(max-width: 767px) calc(100vw - 52px), (max-width: 1199px) 46vw, 508px"
                width={1122}
                height={1402}
                alt=""
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <span className="premium-art-label" aria-hidden="true">A considered approach.</span>
            </div>
            <div className="premium-standard">
              <p className="firm-eyebrow">The Alivio standard</p>
              <p className="premium-standard-title">Clarity at every step.</p>
              <ul>
                <li>A role-specific search brief</li>
                <li>Recruiter-reviewed shortlists</li>
                <li>Weekly search reporting</li>
              </ul>
              <Link to="/#process" className="firm-text-link">
                Our approach <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <nav className="premium-practice-links" aria-label="Our recruiting expertise">
          <p>Specialist focus.<br /><span>Connected perspective.</span></p>
          <Link to="/industries/healthcare">Healthcare <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link to="/industries/technology">Technology <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link to="/nearshore-latam-recruiting">Latin America <ArrowRight size={18} aria-hidden="true" /></Link>
        </nav>
      </div>
    </section>
  );
}
