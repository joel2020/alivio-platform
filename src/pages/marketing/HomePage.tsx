import { practices, candidateBenefits } from '../../lib/recruitingContent';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { DiscussSearchLink, SearchInvitation } from '../../components/marketing/RecruitingFirmSections';
import { Benefits, SearchProcess } from '../../components/marketing/RecruitingContent';

export default function HomePage() {
  return (
    <div className="firm-page recruiting-home">
      <section className="recruiting-hero" aria-labelledby="home-heading">
        <div className="mkt-container recruiting-hero-grid">
          <div className="recruiting-hero-copy">
            <p className="firm-eyebrow"><span className="recruiting-dot" /> A specialized recruiting firm</p>
            <h1 id="home-heading">Hire Better Talent <span>Without Wasting Months</span> on the Search</h1>
            <p>Alivio Search Partners is a specialized recruiting firm helping healthcare organizations, technology companies, and growing businesses find qualified professionals faster through targeted search, direct outreach, and hands-on candidate vetting.</p>
            <div className="recruiting-actions"><DiscussSearchLink /><Link to="/jobs" className="firm-text-link">View Open Jobs <ArrowUpRight size={19} aria-hidden="true" /></Link></div>
            <div className="recruiting-hero-note">Focused search. Personal attention. The right fit.</div>
          </div>
          <figure className="recruiting-hero-visual">
            <img src="/images/recruiting-conversation.jpg" alt="Professionals collaborating in a thoughtful working conversation" width="1000" height="1500" fetchPriority="high" />
            <figcaption><span>People make the difference.</span><strong>We help you find yours.</strong><ArrowUpRight size={31} aria-hidden="true" /></figcaption>
          </figure>
        </div>
        <div className="mkt-container"><p className="recruiting-trust">Healthcare, technology, operations, sales, and leadership recruiting across the U.S.</p></div>
      </section>

      <section id="search-specialties" className="firm-section" aria-labelledby="practice-heading"><div className="mkt-container">
        <div className="recruiting-section-head"><div><p className="firm-eyebrow">What we do</p><h2 id="practice-heading">Recruiting Support for Roles That Cannot Stay Open</h2></div><p>We help companies identify, engage, screen, and deliver qualified candidates for critical positions.</p></div>
        <div className="recruiting-service-grid">{[...practices.map(p => ({ title: p.slug === 'executive' ? 'Executive & Professional Search' : p.title, copy: p.copy, href: `/industries/${p.slug}` })), { title: 'Contract & Project Recruiting', copy: 'Flexible recruiting support when your team needs extra sourcing and screening capacity.', href: '/employers#engagement-models' }].map(item => <Link to={item.href} key={item.title} className="recruiting-service"><ArrowUpRight size={25} aria-hidden="true" /><h3>{item.title}</h3><p>{item.copy}</p></Link>)}</div>
      </div></section>

      <section className="firm-section recruiting-why" aria-labelledby="why-heading"><div className="mkt-container recruiting-two-col">
        <div><p className="firm-eyebrow">Why Alivio</p><h2 id="why-heading">A Recruiting Partner Built for Speed, Precision, and Fit</h2><p>Most recruiting problems are not resume problems. They are targeting, outreach, screening, and follow-through problems.</p><p>Alivio Search Partners gives hiring teams a hands-on recruiting partner who understands how to find passive candidates, qualify them properly, and keep searches moving.</p></div>
        <div className="recruiting-commitment"><span className="recruiting-small-label">Your search. Our attention.</span><Benefits items={['Targeted sourcing for active and passive candidates', 'Personalized outreach, not generic job blasts', 'Candidate screening before submission', 'Clear communication throughout the search', 'Support from intake through offer stage', 'Recruiting strategy tailored to each role and market']} /></div>
      </div></section>

      <section id="process" className="firm-section" aria-labelledby="process-heading"><div className="mkt-container">
        <div className="recruiting-section-head"><div><p className="firm-eyebrow">For employers</p><h2 id="process-heading">We Help You Fill the Roles Your Internal Team Does Not Have Time to Chase</h2></div><div><p>Whether you need one critical hire or ongoing recruiting support, we build a search plan around your role, market, timeline, and hiring process.</p><Link to="/employers" className="firm-text-link">Explore recruiting support <ArrowRight size={18} aria-hidden="true" /></Link></div></div>
        <SearchProcess /><div className="recruiting-actions"><DiscussSearchLink /></div>
      </div></section>

      <section className="recruiting-candidates" aria-labelledby="candidate-heading"><div className="mkt-container recruiting-two-col">
        <div className="recruiting-candidate-image"><img src="/images/technology-team.jpg" alt="Professionals sharing ideas and discussing their work" width="850" height="560" loading="lazy" /><p>A next step that feels like yours.</p></div>
        <div><p className="firm-eyebrow">For candidates</p><h2 id="candidate-heading">Find Roles That Actually Match Your Experience and Goals</h2><p>We work with professionals who want better opportunities, stronger alignment, and a recruiting partner who respects their time.</p><Benefits items={candidateBenefits} /><Link to="/jobs" className="firm-button">View Open Jobs <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      </div></section>

      <section className="firm-section" aria-labelledby="industries-heading"><div className="mkt-container">
        <div className="recruiting-section-head"><div><p className="firm-eyebrow">Our industries</p><h2 id="industries-heading">Specialized Recruiting Across Healthcare and Technology</h2></div><Link to="/industries" className="firm-text-link">Explore our industries <ArrowRight size={18} aria-hidden="true" /></Link></div>
        <div className="recruiting-industries">{practices.slice(0, 2).map(practice => <article key={practice.slug}><img src={practice.image} alt={practice.alt} width="850" height="560" loading="lazy" /><div><h3>{practice.title}</h3><p>{practice.intro}</p><ul className="recruiting-role-tags">{practice.roles.map(role => <li key={role}>{role}</li>)}</ul><Link to={`/industries/${practice.slug}`} className="firm-text-link">Explore {practice.slug} recruiting <ArrowUpRight size={18} aria-hidden="true" /></Link></div></article>)}</div>
      </div></section>

      <section className="firm-section recruiting-about" aria-labelledby="about-heading"><div className="mkt-container recruiting-two-col">
        <div><p className="firm-eyebrow">About Alivio</p><h2 id="about-heading">A Modern Recruiting Firm With a Human Search Process</h2></div>
        <div><p>Alivio Search Partners was founded by Joel Carias to help companies hire with more focus, speed, and accountability.</p><p>We combine direct recruiting, market research, candidate engagement, and practical technology to help clients reach talent they would not find through job boards alone.</p><p className="recruiting-statement">This is not resume forwarding. This is targeted search.</p><Link to="/about" className="firm-text-link">Meet Alivio <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      </div></section>
      <SearchInvitation />
    </div>
  );
}
