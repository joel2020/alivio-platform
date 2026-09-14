import { Link } from 'react-router-dom';
import { DiscussSearchLink, SearchInvitation } from '../../components/marketing/RecruitingFirmSections';
import { SearchProcess } from '../../components/marketing/RecruitingContent';

const services = [
  ['Contingency Search', 'For companies that want recruiting support on a success-fee basis. We agree on the role and terms, then focus on finding qualified, interested candidates.'],
  ['Retained Search', 'For urgent, senior, confidential, or hard-to-fill roles that require dedicated search execution. A focused engagement gives your search the attention and market coverage it needs.'],
  ['Contract Recruiting Support', 'For teams that need temporary sourcing, screening, or pipeline-building capacity. Flexible recruiting support built around your hiring needs.'],
  ['Executive & Leadership Search', 'For leadership roles where experience, judgment, and long-term fit matter. Direct sourcing and thoughtful candidate vetting support a considered hiring decision.'],
];
export default function EmployersPage() {
  return <div className="firm-page"><section className="firm-inner-hero"><div className="mkt-container"><p className="firm-eyebrow">For employers</p><h1>Recruiting Support for Companies That Need the Right Hire, Not Just More Applicants</h1><p className="firm-lead">Alivio Search Partners helps companies fill critical roles through targeted sourcing, candidate outreach, screening, and hands-on search management.</p><DiscussSearchLink /></div></section>
    <section id="engagement-models" className="firm-section"><div className="mkt-container"><p className="firm-eyebrow">Built around your hiring needs</p><h2>The right search for the role.</h2><div className="firm-values">{services.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div><p className="recruiting-terms">Scope, fees, and engagement terms are agreed before your search begins.</p></div></section>
    <section className="firm-section" aria-labelledby="nearshore-heading"><div className="mkt-container recruiting-two-col"><div><p className="firm-eyebrow">Nearshore LATAM recruiting</p><h2 id="nearshore-heading">Build your team across Latin America.</h2></div><div><p>Reach professionals based in Latin America for technology, product, customer success, and business operations roles. We define target markets, language requirements, compensation expectations, and working-hour overlap with your team before sourcing begins.</p><p>Get targeted outreach, candidate screening, and interview coordination built around your hiring brief.</p><Link to="/nearshore-latam-recruiting" className="firm-text-link">Explore nearshore LATAM recruiting →</Link></div></div></section>
    <section className="firm-section recruiting-about"><div className="mkt-container"><p className="firm-eyebrow">From brief to offer</p><h2>A clear process. A committed partner.</h2><SearchProcess /><Link to="/start" className="firm-text-link">Send us your search brief →</Link></div></section><SearchInvitation /></div>;
}
