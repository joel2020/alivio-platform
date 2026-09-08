import { Link } from 'react-router-dom';

export default function LatamPage() {
  return (
    <div className="search-page">
      <section className="search-page-hero">
        <div className="mkt-container">
          <p className="mkt-label">Nearshore recruiting</p>
          <h1>Nearshore LATAM recruiting for U.S. teams</h1>
          <p className="search-page-intro">Alivio Search Partners helps U.S. employers source and assess talent in Latin America for technology, product and business operations roles. We build the search around the work, communication requirements and hours your team needs to share.</p>
          <div className="search-page-actions"><Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link><Link to="/recruiting-agency-medellin" className="mkt-btn-secondary mkt-btn-on-dark">Explore Medellín recruiting</Link></div>
        </div>
      </section>

      <section className="search-page-section">
        <div className="mkt-container">
          <p className="mkt-label">Role coverage</p><h2>Find the skills your team needs to grow</h2>
          <div className="search-page-grid">
            <article className="search-page-card"><h3>Engineering and data</h3><p>Define the systems a hire will own, the technical depth required and the evidence your interview process needs.</p><ul><li>Software engineering</li><li>Data and analytics</li><li>Technical operations and support</li></ul><Link to="/industries/technology" className="search-page-link">Explore technology recruiting</Link></article>
            <article className="search-page-card"><h3>Product and customer teams</h3><p>Look for relevant product experience and the ability to explain decisions to colleagues and customers.</p><ul><li>Product management and design</li><li>Customer success</li><li>Go-to-market operations</li></ul></article>
            <article className="search-page-card"><h3>Business and healthcare support</h3><p>Scope administrative and operational work around your team’s workflows, access requirements and supervision.</p><ul><li>Business and recruiting operations</li><li>Administrative support</li><li>Revenue cycle and customer support</li></ul><p>Healthcare support searches here focus on nonclinical work.</p></article>
          </div>
        </div>
      </section>

      <section className="search-page-section search-page-tint">
        <div className="mkt-container search-page-reading">
          <h2>A practical brief for hiring across LATAM</h2>
          <p>Nearshore recruiting means sourcing in nearby countries where working hours can overlap. Latin America is a region of distinct markets: agree which locations fit the role rather than assuming one salary range, language profile or schedule applies everywhere.</p>
          <dl className="search-page-brief">
            <div><dt>Work and seniority</dt><dd>Describe the outcomes expected in the role, essential skills and decision-making responsibility. Separate requirements from skills that can be learned.</dd></div>
            <div><dt>Working hours</dt><dd>Specify the actual hours of overlap, meeting schedule and any coverage needs. Confirm availability with each candidate, including seasonal changes in your U.S. schedule.</dd></div>
            <div><dt>Communication</dt><dd>Define when English, Spanish or another language is needed. Evaluate job-relevant conversations and written work instead of relying on a bilingual label.</dd></div>
            <div><dt>Compensation and working arrangement</dt><dd>Agree budget parameters, remote or on-site expectations and who will manage the hiring arrangement before outreach begins. Recruiting scope and any employment or payroll arrangements should be confirmed separately.</dd></div>
          </dl>
        </div>
      </section>

      <section className="search-page-section">
        <div className="mkt-container">
          <h2>From target markets to a reviewed shortlist</h2>
          <div className="search-page-grid">
            <article className="search-page-card"><p className="search-page-eyebrow">01 / Scope</p><h3>Agree the search</h3><p>Choose target roles and markets, screening criteria, compensation parameters and interview owners.</p></article>
            <article className="search-page-card"><p className="search-page-eyebrow">02 / Source</p><h3>Research and engage</h3><p>Identify relevant professionals through targeted sourcing and outreach. Review experience, interest, communication and availability against the brief.</p></article>
            <article className="search-page-card"><p className="search-page-eyebrow">03 / Assess</p><h3>Compare the evidence</h3><p>Use recruiter-reviewed candidate notes to decide who to interview. Identify open questions and coordinate feedback through the agreed process.</p></article>
          </div>
        </div>
      </section>

      <section className="search-page-section search-page-tint">
        <div className="mkt-container search-page-reading">
          <h2>Questions about LATAM recruiting</h2>
          <h3>Can we focus the search on Medellín?</h3><p>Yes. A search can focus on Medellín or use a broader regional brief. Our <Link to="/recruiting-agency-medellin" className="search-page-link">Medellín recruiting page</Link> explains how location, communication and working arrangements shape that search.</p>
          <h3>Does recruiting include payroll or employer-of-record services?</h3><p>This page describes candidate sourcing and recruiting support. Do not assume payroll, employer-of-record services or employment administration are included; confirm responsibilities and any separate providers in the written engagement scope.</p>
          <h3>How is the engagement priced?</h3><p>Scope depends on the roles, markets, volume and support required. Review our <Link to="/pricing" className="search-page-link">pricing and engagement options</Link>, then share your hiring brief for a proposal.</p>
          <div className="search-page-callout"><h3>Build your LATAM search brief</h3><p>Tell us what the hire will do, where you are open to sourcing and when the team needs to collaborate.</p><Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link><p>Looking for work? <Link to="/careers" className="search-page-link">View current openings</Link>.</p></div>
        </div>
      </section>
    </div>
  );
}
