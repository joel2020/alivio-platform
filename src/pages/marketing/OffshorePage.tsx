import { Link } from 'react-router-dom';
import { DiscussSearchLink, SearchInvitation } from '../../components/marketing/RecruitingFirmSections';
import { Benefits, SearchProcess } from '../../components/marketing/RecruitingContent';

export default function OffshorePage() {
  return <div className="firm-page">
    <section className="firm-inner-hero"><div className="mkt-container">
      <p className="firm-eyebrow">International talent. Personal attention.</p>
      <h1>Offshore Recruitment Built Around Your Team</h1>
      <p className="firm-lead">Find qualified professionals beyond your local market. Alivio Search Partners helps companies recruit offshore talent through direct sourcing, personalized outreach, and hands-on candidate vetting.</p>
      <div className="recruiting-actions"><DiscussSearchLink /><Link to="/jobs" className="firm-text-link">View Open Jobs →</Link></div>
    </div></section>
    <section className="firm-section"><div className="mkt-container recruiting-two-col">
      <div><p className="firm-eyebrow">Roles we recruit</p><h2>Support for the work that keeps your business moving.</h2><p>We shape each international search around the skills, communication, and availability your team needs.</p></div>
      <Benefits items={['Software engineering, data, and technical support', 'Customer support and customer success', 'Administrative and executive support', 'Sales support and business development', 'Recruiting coordination and business operations', 'Nonclinical healthcare administration and revenue cycle support']} />
    </div></section>
    <section className="firm-section recruiting-about"><div className="mkt-container recruiting-two-col">
      <div><p className="firm-eyebrow">A practical search brief</p><h2>Agree the expectations before the outreach.</h2><p>Choose target markets based on role requirements, compensation, and the way your team works. We assess candidates against that brief and share the context you need for interviews.</p></div>
      <Benefits items={['Relevant experience and role-specific skills', 'Language and communication requirements', 'Working-hour overlap or agreed shift coverage', 'Compensation expectations and availability', 'Remote work expectations and reporting relationships', 'Clear interview feedback and offer coordination']} />
    </div></section>
    <section className="firm-section"><div className="mkt-container"><p className="firm-eyebrow">From brief to offer</p><h2>A recruiting partner throughout the search.</h2><SearchProcess /><p className="recruiting-terms">Recruiting scope, fees, and hiring responsibilities are agreed before the search begins. Any payroll, employer-of-record, or employment administration arrangements are scoped separately.</p><Link to="/start" className="firm-text-link">Request a Search Plan →</Link></div></section>
    <section className="firm-section recruiting-about"><div className="mkt-container recruiting-two-col"><div><p className="firm-eyebrow">Explore nearshore talent</p><h2>Looking specifically at Latin America?</h2></div><div><p>Our LATAM recruitment service focuses on talent across Latin America, with language requirements and working-hour overlap assessed for each search.</p><Link to="/nearshore-latam-recruiting" className="firm-text-link">Explore LATAM Recruitment →</Link></div></div></section>
    <SearchInvitation />
  </div>;
}
