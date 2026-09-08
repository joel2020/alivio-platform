import { Link } from 'react-router-dom';

export default function WestchesterPage() {
  return (
    <div className="search-page">
      <section className="search-page-hero">
        <div className="mkt-container">
          <p className="mkt-label">Westchester recruiting</p>
          <h1>Recruiting for Westchester healthcare and technology teams</h1>
          <p className="search-page-intro">Alivio Search Partners helps Westchester employers build candidate pipelines for clinical, leadership, operational and technical roles. Our process combines targeted sourcing with recruiter assessment and clear screening notes.</p>
          <div className="search-page-actions"><Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link><Link to="/pricing" className="mkt-btn-secondary mkt-btn-on-dark">Explore pricing &amp; engagements</Link></div>
        </div>
      </section>

      <section className="search-page-section">
        <div className="mkt-container">
          <p className="mkt-label">The roles we support</p><h2>Two practices for specialized hiring</h2>
          <div className="search-page-grid">
            <article className="search-page-card"><h3>Healthcare recruiting</h3><p>Search support for healthcare groups, physician practices and skilled nursing operators hiring clinicians, clinical leaders and the people who run care operations.</p><ul><li>Physicians, nurse practitioners and physician assistants</li><li>Medical directors and nursing leadership</li><li>Practice administration, revenue cycle and operations</li></ul><Link className="search-page-link" to="/industries/healthcare">Explore healthcare recruiting</Link></article>
            <article className="search-page-card"><h3>Technology recruiting</h3><p>Candidate sourcing and evaluation for software, healthtech and AI teams. Define the work a hire will own and the experience that matters for your stage and environment.</p><ul><li>Software engineering and technical leadership</li><li>AI, data and product roles</li><li>Technical and business operations</li></ul><Link className="search-page-link" to="/industries/technology">Explore technology recruiting</Link></article>
          </div>
        </div>
      </section>

      <section className="search-page-section search-page-tint">
        <div className="mkt-container search-page-reading">
          <h2>A Westchester search starts with the worksite</h2>
          <p>For a role based in Westchester, define the actual work location and schedule before building the candidate profile. A county-wide label alone does not explain a candidate's commute, on-site responsibilities or flexibility.</p>
          <dl className="search-page-brief">
            <div><dt>Location and attendance</dt><dd>List the worksite or sites, required on-site days and any travel between locations. Separate firm requirements from preferences.</dd></div>
            <div><dt>Schedule and coverage</dt><dd>For clinical and operational roles, clarify shifts, call or coverage expectations. For technical teams, specify working hours and collaboration needs.</dd></div>
            <div><dt>Compensation and candidate motivation</dt><dd>Align the compensation parameters with the role. Explain the team, responsibilities and opportunities a candidate can realistically expect.</dd></div>
            <div><dt>Local and regional sourcing</dt><dd>Agree whether to focus on Westchester candidates, the wider New York metro area or people open to relocation. Assess each person's stated work-location preferences.</dd></div>
          </dl>
        </div>
      </section>

      <section className="search-page-section">
        <div className="mkt-container">
          <h2>From search brief to informed interviews</h2>
          <div className="search-page-grid">
            <article className="search-page-card"><p className="search-page-eyebrow">01 / Define</p><h3>Agree the role</h3><p>Clarify expected outcomes, requirements, compensation parameters and the people making the hiring decision.</p></article>
            <article className="search-page-card"><p className="search-page-eyebrow">02 / Source &amp; assess</p><h3>Build a relevant pipeline</h3><p>Use targeted research and outreach to find candidates. Recruiters evaluate the evidence, motivation and role alignment before advancing a shortlist.</p></article>
            <article className="search-page-card"><p className="search-page-eyebrow">03 / Decide</p><h3>Keep the process clear</h3><p>Review candidates against the agreed criteria, record open questions and coordinate interview feedback and next steps.</p></article>
          </div>
          <div className="search-page-callout"><h2>Plan your next Westchester hire</h2><p>Share the role, work location and hiring goals. Explore <Link className="search-page-link" to="/pricing">retained search, pipeline programs and project support</Link> or bring your questions to the first conversation.</p><Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link><p>Looking for a role? <Link className="search-page-link" to="/careers">View current openings</Link>.</p></div>
        </div>
      </section>
    </div>
  );
}
