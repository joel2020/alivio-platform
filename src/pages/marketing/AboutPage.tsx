import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSeo } from '../../lib/seo';
import { FounderSection, SearchInvitation } from '../../components/marketing/RecruitingFirmSections';

const values = [
  { title: 'Start with the market.', copy: 'Compensation, location, and role requirements shape the search. We discuss those constraints at the outset and use them to guide the target market.' },
  { title: 'Make the reasoning visible.', copy: 'A profile should help you make a decision. Shortlists include fit rationale, risks, and questions to explore with each candidate.' },
  { title: 'Keep people involved.', copy: 'AI supports research and matching. Recruiters review every client shortlist, and hiring teams make the hiring decisions.' },
  { title: 'Stay close to the assignment.', copy: 'Role-specific scorecards and weekly search reporting keep the brief, candidate feedback, and next steps connected.' },
];

export default function AboutPage() {
  useSeo({ title: 'About | Alivio Search Partners', description: 'Meet Alivio Search Partners and founder Joel Carias. Specialist healthcare and technology recruiting with human judgment, intelligent research, and clear search reporting.', canonicalUrl: 'https://aliviosearchpartners.com/about' });
  return (
    <div className="firm-page">
      <section className="firm-inner-hero"><div className="mkt-container"><p className="firm-eyebrow">Our firm</p><h1>Careful search.<br />Personal accountability.</h1><p className="firm-lead">Alivio means relief. We bring focus to the work of finding people for critical healthcare and technology roles, with a clear brief, considered shortlists, and an accountable recruiting partner.</p><a href="#leadership" className="firm-text-link">Meet our founder <ArrowRight size={16} aria-hidden="true" /></a></div></section>
      <FounderSection expanded />
      <section className="firm-section"><div className="mkt-container"><div className="firm-section-heading"><div><p className="firm-eyebrow">What guides us</p><h2>The principles behind<br />every search.</h2></div></div><div className="firm-values">{values.map(value => <article key={value.title}><h3>{value.title}</h3><p>{value.copy}</p></article>)}</div></div></section>
      <section className="firm-section firm-evidence"><div className="mkt-container firm-split"><div><p className="firm-eyebrow">Where we work</p><h2>U.S. searches.<br />Latin American reach.</h2></div><div><p className="firm-lead">Searches run nationwide across the United States, with a nearshore recruiting team in Colombia that extends coverage across LATAM time zones.</p><p>Our healthcare and technology practices share a structured search process, recruiter-reviewed shortlists, and weekly reporting.</p><Link to="/nearshore-latam-recruiting" className="firm-text-link">Explore our LATAM coverage <ArrowRight size={16} aria-hidden="true" /></Link></div></div></section>
      <section id="responsible-ai" className="firm-section"><div className="mkt-container firm-split"><div><p className="firm-eyebrow">Responsible AI</p><h2>Technology supports<br />the judgment.</h2><p className="firm-lead">The AI Candidate Engine supports sourcing, matching, screening logistics, and follow-ups. People remain part of the assessment.</p><Link to="/product" className="firm-text-link">Explore the AI Candidate Engine <ArrowRight size={16} aria-hidden="true" /></Link></div><ul className="firm-role-list">
        <li>A recruiter reviews every shortlist before it reaches a client. No candidate is advanced or rejected by AI alone.</li>
        <li>AI-assisted screening calls disclose that they are automated, and candidates can request a human callback.</li>
        <li>Match scores come with written rationale so clients can assess the reasons behind a recommendation.</li>
        <li>Candidate data is encrypted, organization-scoped, never indexed by search engines, and never sold or shared without consent.</li>
      </ul></div></section>
      <SearchInvitation />
    </div>
  );
}
