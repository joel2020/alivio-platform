import { Link } from 'react-router-dom';

export default function MedellinPage() {
  return (
    <div className="search-page">
      <section className="search-page-hero">
        <div className="mkt-container">
          <p className="mkt-label">Medellín, Colombia</p>
          <h1>Recruiting in Medellín for bilingual and technical talent</h1>
          <p className="search-page-intro">Alivio Search Partners helps employers source and evaluate professionals in Medellín for technical, customer-facing and operational roles. We connect the search brief to the skills, communication and working arrangements your U.S. team needs.</p>
          <div className="search-page-actions"><Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link><Link to="/nearshore-latam-recruiting" className="mkt-btn-secondary mkt-btn-on-dark">Explore LATAM recruiting</Link></div>
        </div>
      </section>

      <section className="search-page-section">
        <div className="mkt-container">
          <p className="mkt-label">A focused search</p><h2>Roles we help teams recruit in Medellín</h2>
          <div className="search-page-grid">
            <article className="search-page-card"><h3>Technical and product talent</h3><p>Source software, data, product and technical support professionals against the actual responsibilities of the role. Agree the technical assessment and evidence needed before interviews.</p><Link to="/industries/technology" className="search-page-link">Explore our technology practice</Link></article>
            <article className="search-page-card"><h3>Customer and business operations</h3><p>Find candidates for customer success, recruiting support, administrative and operational work. Assess the communication, judgment and workflow experience needed for your team.</p><Link to="/services" className="search-page-link">Explore recruitment services</Link></article>
          </div>
        </div>
      </section>

      <section className="search-page-section search-page-tint">
        <div className="mkt-container search-page-reading">
          <h2>Make the Medellín brief specific</h2>
          <p>A city name is a starting point for sourcing, not a complete hiring requirement. Clarify whether a candidate needs to live in Medellín, attend a worksite or simply collaborate remotely with your team.</p>
          <dl className="search-page-brief">
            <div><dt>Location and attendance</dt><dd>State the worksite, on-site days and travel expectations when relevant. For a remote role, explain whether location is a requirement or a preference, and why.</dd></div>
            <div><dt>English and Spanish in the role</dt><dd>Identify the meetings, customer interactions and documents each language will be used for. Assess those tasks during screening rather than treating all bilingual candidates as interchangeable.</dd></div>
            <div><dt>Collaboration with U.S. colleagues</dt><dd>Share the required working hours and interview availability. Check the overlap against your team’s calendar throughout the year, not just the current week.</dd></div>
            <div><dt>Offer expectations</dt><dd>Confirm compensation parameters, working arrangement, management support and the responsibilities of the hiring organization before candidates invest time in the process.</dd></div>
          </dl>
        </div>
      </section>

      <section className="search-page-section">
        <div className="mkt-container">
          <h2>Evaluate fit through relevant work</h2>
          <div className="search-page-grid">
            <article className="search-page-card"><h3>Role evidence</h3><p>Discuss projects, decisions and responsibilities that match the brief. For technical roles, agree a relevant assessment with the hiring team.</p></article>
            <article className="search-page-card"><h3>Communication in context</h3><p>Use a role-relevant conversation or written exercise to understand how a candidate explains their work and handles questions.</p></article>
            <article className="search-page-card"><h3>Motivation and availability</h3><p>Clarify the candidate’s interests, notice period, working-hour preferences and expectations. Record what is known and what the employer still needs to confirm.</p></article>
          </div>
        </div>
      </section>

      <section className="search-page-section search-page-tint">
        <div className="mkt-container search-page-reading">
          <h2>Questions about recruiting in Medellín</h2>
          <h3>Can a New York team recruit through Alivio?</h3><p>Yes. We help U.S. teams define the search, source candidates and review fit. Specify your collaboration hours and the work the hire will own; geography alone does not establish the right match.</p>
          <h3>Can we expand beyond Medellín?</h3><p>Yes. Discuss a <Link to="/nearshore-latam-recruiting" className="search-page-link">broader LATAM recruiting search</Link> if skills, availability or location preferences point to a regional approach.</p>
          <h3>What should we confirm before hiring?</h3><p>Agree the role, compensation, working arrangement and onboarding owner. The recruiting proposal should state its deliverables; employment administration, payroll and any separate providers need their own confirmed scope.</p>
          <div className="search-page-callout"><h3>Plan your Medellín search</h3><p>Share the role, required languages, working hours and hiring priorities. Explore <Link to="/pricing" className="search-page-link">pricing and engagement options</Link> before the first conversation.</p><Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link><p>Looking for a role? <Link to="/careers" className="search-page-link">View current openings</Link>.</p></div>
        </div>
      </section>
    </div>
  );
}
