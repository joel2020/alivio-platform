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
            <p className="firm-eyebrow">Alivio Search Partners</p>
            <h1 id="home-heading">The right people.<span>For what’s next.</span></h1>
            <p>Specialist recruiting for healthcare, technology, and leadership, with nearshore talent searches across Latin America. We find, engage, and assess the people your team needs.</p>
            <div className="recruiting-actions"><DiscussSearchLink /><Link to="/jobs" className="firm-text-link">View Open Jobs <ArrowUpRight size={19} aria-hidden="true" /></Link></div>
            <div className="recruiting-hero-note">Thoughtful search. Personal attention.</div>
          </div>
          <figure className="recruiting-hero-visual">
            <img src="/images/recruiting-conversation.jpg" alt="Professionals collaborating in a thoughtful working conversation" width="1000" height="1500" fetchPriority="high" />
            <figcaption><span>A partnership from the first conversation.</span><strong>Good things start with people.</strong><ArrowUpRight size={27} aria-hidden="true" /></figcaption>
          </figure>
        </div>
        <div className="mkt-container"><nav className="recruiting-focus" aria-label="Our specialist practices"><span>Expertise with purpose</span><Link to="/industries/healthcare">Healthcare <ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/industries/technology">Technology <ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/industries/executive">Executive &amp; leadership <ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/nearshore-latam-recruiting">Nearshore LATAM <ArrowUpRight size={17} aria-hidden="true" /></Link></nav></div>
      </section>

      <section id="search-specialties" className="firm-section" aria-labelledby="practice-heading"><div className="mkt-container">
        <div className="recruiting-section-head"><div><p className="firm-eyebrow">What we do</p><h2 id="practice-heading">A focused search.<br />A meaningful difference.</h2></div><p>We help companies identify, engage, screen, and deliver qualified candidates for critical positions.</p></div>
        <div className="recruiting-service-grid">{[...practices.map(p => ({ title: p.slug === 'executive' ? 'Executive & Professional Search' : p.title, copy: p.copy, href: `/industries/${p.slug}` })), { title: 'Contract & Project Recruiting', copy: 'Flexible recruiting support when your team needs extra sourcing and screening capacity.', href: '/employers#engagement-models' }].map(item => <Link to={item.href} key={item.title} className="recruiting-service"><ArrowUpRight size={25} aria-hidden="true" /><h3>{item.title}</h3><p>{item.copy}</p></Link>)}</div>
        <div className="recruiting-nearshore recruiting-two-col">
          <div><p className="firm-eyebrow">Nearshore LATAM recruiting</p><h3>Great talent.<br />Closer collaboration.</h3></div>
          <div><p>Build your team with professionals based in Latin America. We source and assess candidates for technology, product, customer success, and business operations roles, with language requirements and working-hour overlap built into the search.</p><Link to="/nearshore-latam-recruiting" className="firm-text-link">Explore nearshore recruiting <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
      </div></section>

      <section className="firm-section recruiting-why" aria-labelledby="why-heading"><div className="mkt-container recruiting-two-col">
        <div><p className="firm-eyebrow">Why Alivio</p><h2 id="why-heading">A closer understanding.<br />A better introduction.</h2><p>The right hire starts with understanding your team, the work, and what success looks like.</p><p>We turn that understanding into targeted research, personal outreach, and considered candidate introductions. You stay close to the search, with clear communication at every stage.</p></div>
        <div className="recruiting-commitment"><span className="recruiting-small-label">Your search. Our attention.</span><Benefits items={['Targeted sourcing for active and passive candidates', 'Personalized outreach built around your opportunity', 'Candidate screening before submission', 'Clear communication throughout the search', 'Support from intake through offer stage', 'Recruiting strategy tailored to each role and market']} /></div>
      </div></section>

      <section id="process" className="firm-section" aria-labelledby="process-heading"><div className="mkt-container">
        <div className="recruiting-section-head"><div><p className="firm-eyebrow">For employers</p><h2 id="process-heading">From the first conversation<br />to your next hire.</h2></div><div><p>Whether you need one critical hire or ongoing recruiting support, we build a search plan around your role, market, timeline, and hiring process.</p><Link to="/employers" className="firm-text-link">Explore recruiting support <ArrowRight size={18} aria-hidden="true" /></Link></div></div>
        <SearchProcess /><div className="recruiting-actions"><DiscussSearchLink /></div>
      </div></section>

      <section className="recruiting-candidates" aria-labelledby="candidate-heading"><div className="mkt-container recruiting-two-col">
        <div className="recruiting-candidate-image"><img src="/images/technology-team.jpg" alt="Professionals sharing ideas and discussing their work" width="850" height="560" loading="lazy" /><p>A next step that feels like yours.</p></div>
        <div><p className="firm-eyebrow">For candidates</p><h2 id="candidate-heading">Your experience deserves<br />the right opportunity.</h2><p>We work with professionals who want better opportunities, stronger alignment, and a recruiting partner who respects their time.</p><Benefits items={candidateBenefits} /><Link to="/jobs" className="firm-button">View Open Jobs <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      </div></section>

      <section className="firm-section" aria-labelledby="industries-heading"><div className="mkt-container">
        <div className="recruiting-section-head"><div><p className="firm-eyebrow">Our industries</p><h2 id="industries-heading">Deep knowledge.<br />In the fields we know best.</h2></div><Link to="/industries" className="firm-text-link">Explore our industries <ArrowRight size={18} aria-hidden="true" /></Link></div>
        <div className="recruiting-industries">{practices.slice(0, 2).map(practice => <article key={practice.slug}><img src={practice.image} alt={practice.alt} width="850" height="560" loading="lazy" /><div><h3>{practice.title}</h3><p>{practice.intro}</p><ul className="recruiting-role-tags">{practice.roles.map(role => <li key={role}>{role}</li>)}</ul><Link to={`/industries/${practice.slug}`} className="firm-text-link">Explore {practice.slug} recruiting <ArrowUpRight size={18} aria-hidden="true" /></Link></div></article>)}</div>
      </div></section>

      <section className="firm-section recruiting-about" aria-labelledby="about-heading"><div className="mkt-container recruiting-two-col">
        <div><p className="firm-eyebrow">About Alivio</p><h2 id="about-heading">A specialist firm.<br />A personal commitment.</h2></div>
        <div><p>Alivio Search Partners was founded by Joel Carias to help companies hire with more focus, speed, and accountability.</p><p>We combine direct recruiting, market research, candidate engagement, and practical technology to help clients reach talent they would not find through job boards alone.</p><p className="recruiting-statement">Your search has our personal attention.</p><Link to="/about" className="firm-text-link">Meet Alivio <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      </div></section>
      <SearchInvitation />
    </div>
  );
}
