import { Link } from 'react-router-dom';

const models = [
  { title: 'Retained search', purpose: 'A defined, critical hire', copy: 'A dedicated search for a healthcare, technology or leadership role. Start with the outcomes expected from the hire, then agree the search scope and assessment process.', points: ['Role definition and candidate scorecard', 'Targeted sourcing and recruiter-reviewed shortlists', 'Interview coordination and support through the offer'] },
  { title: 'Pipeline program', purpose: 'Recurring hiring needs', copy: 'Ongoing candidate sourcing and outreach for teams that repeatedly hire similar roles. Define the role mix, hiring frequency and internal interview capacity before selecting a program.', points: ['Continuous sourcing and outreach', 'Candidate evaluation and pipeline reporting', 'Scope that reflects the roles and markets covered'] },
  { title: 'Project / RPO support', purpose: 'A launch, expansion or recruiting backlog', copy: 'Recruiting support for an agreed project or part of your hiring process. Specify which work Alivio will own and how it connects with your internal team.', points: ['Defined recruiting responsibilities', 'Coordination with your systems and hiring team', 'Reporting and handover requirements agreed up front'] },
];

export default function PricingPage() {
  return (
    <div className="search-page">
      <section className="search-page-hero">
        <div className="mkt-container">
          <p className="mkt-label">Pricing &amp; engagements</p>
          <h1>Recruiting pricing built around your search</h1>
          <p className="search-page-intro">Alivio scopes pricing to the recruiting engagement. Share the roles, hiring goals and support you need so the proposal reflects the work involved.</p>
          <div className="search-page-actions"><Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link><a href="#engagement-options" className="mkt-btn-secondary mkt-btn-on-dark">Compare engagement options</a></div>
        </div>
      </section>

      <section id="engagement-options" className="search-page-section">
        <div className="mkt-container">
          <p className="mkt-label">Choose the scope</p>
          <h2>Three ways to work with Alivio</h2>
          <p className="search-page-lead">Start with the hiring problem. A single leadership appointment, repeated hiring and temporary recruiting capacity call for different scopes.</p>
          <div className="search-page-grid">
            {models.map(model => <article className="search-page-card" key={model.title}>
              <p className="search-page-eyebrow">{model.purpose}</p><h3>{model.title}</h3><p>{model.copy}</p>
              <ul>{model.points.map(point => <li key={point}>{point}</li>)}</ul>
            </article>)}
          </div>
          <p><Link className="search-page-link" to="/employers#engagement-models">Explore our recruitment services</Link></p>
        </div>
      </section>

      <section className="search-page-section search-page-tint">
        <div className="mkt-container search-page-grid">
          <div><h2>What shapes a quote?</h2><ul className="search-page-list">
            <li><strong>Role scope:</strong> seniority, specialty, responsibilities and assessment needs.</li>
            <li><strong>Hiring volume:</strong> one appointment, multiple searches or recurring demand.</li>
            <li><strong>Search market:</strong> work location, on-site expectations and candidate requirements.</li>
            <li><strong>Recruiting support:</strong> the sourcing, screening, coordination and reporting work included.</li>
          </ul></div>
          <div><h2>What should the written proposal clarify?</h2><ul className="search-page-list">
            <li>The roles covered, deliverables and responsibilities.</li>
            <li>The fee basis, payment milestones and any additional costs.</li>
            <li>The reporting cadence and expected search timeline.</li>
            <li>Any replacement terms, exclusions or scope-change conditions.</li>
          </ul><p>Confirm the terms for your engagement before work begins. This page does not set a universal fee, payment schedule or replacement guarantee.</p></div>
        </div>
      </section>

      <section className="search-page-section">
        <div className="mkt-container search-page-reading">
          <h2>Questions before you choose</h2>
          <h3>Is this a software subscription?</h3><p>These options describe recruiting engagements. The <Link className="search-page-link" to="/product">AI Candidate Engine</Link> supports sourcing, evaluation and reporting within Alivio's recruiter-led process.</p>
          <h3>Do I need to choose a model before contacting you?</h3><p>No. Bring the role, location, hiring priorities and internal capacity to the first conversation. Those details help define the appropriate scope.</p>
          <h3>Can you quote a search without a finished job description?</h3><p>Start with the role's expected outcomes, reporting line, work arrangements and compensation parameters. Note what is still undecided so it can be addressed when defining the search.</p>
          <div className="search-page-callout"><h3>Tell us what you need to hire</h3><p>Describe the role and the recruiting support you need to start a conversation about scope and pricing.</p><Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link></div>
        </div>
      </section>
    </div>
  );
}
