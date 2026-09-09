import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

export function DiscussSearchLink() {
  return <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="firm-button">Discuss a Search <ArrowRight size={17} aria-hidden="true" /></a>;
}

export function SearchEvidence() {
  return (
    <section className="firm-section firm-evidence" aria-labelledby="search-evidence">
      <div className="mkt-container firm-evidence-grid">
        <div>
          <p className="firm-eyebrow">A search in practice</p>
          <h2 id="search-evidence">The work behind<br />a considered shortlist.</h2>
          <p className="firm-lead">A closer look at one physician-group assignment, and the context delivered with every candidate.</p>
          <Link to="/industries/healthcare" className="firm-text-link">Our healthcare practice <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <article className="firm-search-brief">
          <div className="firm-brief-heading"><span className="firm-eyebrow">Search brief</span><span>Physician group · Anonymized</span></div>
          <h3>Gastroenterology search</h3>
          <div className="firm-brief-metrics">
            <div><strong>14</strong><span>days to the shortlist</span></div>
            <div><strong>10</strong><span>gastroenterologists shortlisted</span></div>
          </div>
          <dl className="firm-brief-details">
            <div><dt>The assignment</dt><dd>A physician-group search opened in mid-April.</dd></div>
            <div><dt>The shortlist</dt><dd>Ten gastroenterologists, from 16 sourced and matched, were available in the client portal fourteen days later.</dd></div>
            <div><dt>The context</dt><dd>Each profile included fit rationale, risks, and suggested interview questions.</dd></div>
          </dl>
          <p className="firm-caption">Anonymized search example. This is a shortlist milestone, not a placement or retention result. Timelines vary by role and market.</p>
        </article>
      </div>
    </section>
  );
}

export function FounderSection({ expanded = false }: { expanded?: boolean }) {
  return (
    <section id="leadership" className="firm-section firm-founder" aria-labelledby="founder-heading">
      <div className="mkt-container firm-founder-grid">
        <div className="firm-founder-identity">
          <p className="firm-eyebrow">The person behind the practice</p>
          <h2 id="founder-heading">Joel Carias</h2>
          <p className="firm-founder-role">Founder · Alivio Search Partners</p>
          <div className="firm-founder-focus"><span>Recruiting experience</span><p>Health systems.<br />Academic medical centers.<br />Critical clinical hires.</p></div>
        </div>
        <div className="firm-founder-story">
          <h3>A recruiting background.<br />A personal point of view.</h3>
          <p>Joel founded Alivio after recruiting for health systems and academic medical centers. That experience informs the firm’s focus on healthcare and technology, and the care taken to understand each search.</p>
          <p>A hiring strategy conversation starts with your open roles, market constraints, and business priorities. From there, Alivio defines the search and the evidence your team needs to assess candidates.</p>
          {expanded ? <>
            <p>The AI Candidate Engine supports research, matching, and outreach. Recruiters review the shortlist and explain candidate fit, risks, and questions to explore in an interview.</p>
            <a className="firm-text-link" href="https://www.linkedin.com/company/aliviosearchpartners/" target="_blank" rel="noopener noreferrer">Follow Alivio on LinkedIn <ArrowRight size={16} aria-hidden="true" /></a>
          </> : <Link to="/about#leadership" className="firm-text-link">Meet our founder and explore the firm <ArrowRight size={16} aria-hidden="true" /></Link>}
        </div>
      </div>
    </section>
  );
}

export function SearchInvitation() {
  return (
    <section className="firm-section firm-invitation" aria-labelledby="search-invitation">
      <div className="mkt-container firm-invitation-grid">
        <div><p className="firm-eyebrow">Your next critical hire</p><h2 id="search-invitation">Start with a conversation.</h2><p>Tell us about the role, the challenge, and what a successful hire would change for your team.</p></div>
        <div className="firm-invitation-actions"><DiscussSearchLink /><Link to="/start" className="firm-text-link">Prefer to send a search brief? <ArrowRight size={16} aria-hidden="true" /></Link><Link to="/careers" className="firm-candidate-link">Looking for your next role? Explore careers.</Link></div>
      </div>
    </section>
  );
}
