import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PremiumRecruitingHero from '../../components/marketing/PremiumRecruitingHero';
import { FounderSection, SearchEvidence, SearchInvitation } from '../../components/marketing/RecruitingFirmSections';

const practices = [
  { label: 'Healthcare', headline: 'The people behind better care.', copy: 'Physician, clinical, and operational leadership search for health systems, physician groups, and healthcare organizations.', roles: 'Physicians · Nursing leadership · Clinical operations', href: '/industries/healthcare' },
  { label: 'Technology', headline: 'The talent behind what comes next.', copy: 'Engineering, product, data, and leadership search for technology, healthtech, and AI companies.', roles: 'Engineering · Product & data · Technical leadership', href: '/industries/technology' },
];
const process = [
  { title: 'Understand the assignment', copy: 'Agree on the role, compensation, market constraints, and what success looks like. Define the scorecard before the search begins.' },
  { title: 'Research and assess', copy: 'Build the target market, engage candidates, and assess fit. AI supports research and matching; recruiters bring context and judgment.' },
  { title: 'Deliver a considered shortlist', copy: 'Review candidate profiles with fit rationale, risks, compensation context, and suggested interview questions. Stay informed through weekly reporting.' },
];
const reading = [
  { topic: 'Leadership', title: 'Succession Planning for Growing Staffing Organizations', slug: 'succession-planning-for-growing-staffing-organizations' },
  { topic: 'Talent strategy', title: 'Building Regional Talent Pipelines for Hard-to-Fill Roles', slug: 'building-regional-talent-pipelines-for-hard-to-fill-roles' },
  { topic: 'Responsible AI', title: 'Bias Guardrails for AI in Clinical Talent Acquisition', slug: 'bias-guardrails-for-ai-in-clinical-talent-acquisition' },
];

export default function HomePage() {
  return (
    <div className="firm-page">
      <PremiumRecruitingHero />

      <section id="search-specialties" className="firm-section" aria-labelledby="practice-heading">
        <div className="mkt-container">
          <div className="firm-section-heading"><div><p className="firm-eyebrow">Our expertise</p><h2 id="practice-heading">Specialist knowledge.<br />A wider perspective.</h2></div><p>We focus on the roles that shape care delivery, build products, and lead organizations forward.</p></div>
          <div className="firm-practices">
            {practices.map(practice => <article key={practice.label}>
              <p className="firm-eyebrow">{practice.label} practice</p><h3>{practice.headline}</h3><p>{practice.copy}</p><p className="firm-practice-roles">{practice.roles}</p><Link to={practice.href} className="firm-text-link">Explore {practice.label.toLowerCase()} recruiting <ArrowRight size={17} aria-hidden="true" /></Link>
            </article>)}
          </div>
          <div className="firm-regional"><div><h3>Talent across borders.</h3><p>Nearshore recruiting for U.S. teams seeking bilingual, technical, and operations talent in Latin America.</p></div><Link to="/nearshore-latam-recruiting" className="firm-text-link">Explore LATAM recruiting <ArrowRight size={17} aria-hidden="true" /></Link></div>
        </div>
      </section>

      <SearchEvidence />

      <section id="process" className="firm-section" aria-labelledby="process-heading">
        <div className="mkt-container">
          <div className="firm-section-heading"><div><p className="firm-eyebrow">Our approach</p><h2 id="process-heading">A clear brief.<br />A deliberate search.</h2></div><Link to="/services" className="firm-text-link">Explore our engagement models <ArrowRight size={17} aria-hidden="true" /></Link></div>
          <ol className="firm-process">{process.map((step, index) => <li key={step.title}><span className="firm-step" aria-hidden="true">0{index + 1}</span><h3>{step.title}</h3><p>{step.copy}</p></li>)}</ol>
          <div id="ai-engine" className="firm-technology-note"><div><p className="firm-eyebrow">Technology with human oversight</p><p>Our AI Candidate Engine supports sourcing, matching, and outreach. Recruiters review every client shortlist and explain why each candidate merits consideration.</p></div><Link to="/product" className="firm-text-link">Inside the AI Candidate Engine <ArrowRight size={17} aria-hidden="true" /></Link></div>
        </div>
      </section>

      <FounderSection />

      <section className="firm-section" aria-labelledby="insights-heading">
        <div className="mkt-container">
          <div className="firm-section-heading"><div><p className="firm-eyebrow">Selected reading</p><h2 id="insights-heading">Perspective on people<br />and the work ahead.</h2></div><Link to="/blog" className="firm-text-link">All insights <ArrowRight size={17} aria-hidden="true" /></Link></div>
          <div className="firm-reading">{reading.map(item => <article key={item.slug}><p className="firm-eyebrow">{item.topic}</p><h3><Link to={`/blog/${item.slug}`}>{item.title}<ArrowRight size={20} aria-hidden="true" /></Link></h3><p className="firm-caption">Alivio Search Partners</p></article>)}</div>
        </div>
      </section>

      <section className="firm-section firm-faq" aria-labelledby="questions-heading">
        <div className="mkt-container firm-faq-grid"><div><p className="firm-eyebrow">Before we begin</p><h2 id="questions-heading">A few practical questions.</h2></div><div>
          {[
            ['Am I buying recruiting services or software?', 'Alivio is your recruiting partner. The AI Candidate Engine supports sourcing, matching, outreach, and reporting within the engagement.'],
            ['How soon will I see candidates?', 'Timing depends on the role, location, compensation, and market. We agree on the search priorities and reporting cadence at kickoff.'],
            ['Who makes the candidate decisions?', 'Recruiters review every shortlist. Your hiring team makes interview and hiring decisions, supported by candidate profiles and written fit rationale.'],
            ['What happens after I request a search plan?', 'We review your roles, hiring priorities, and market constraints, then discuss the scope and engagement model with you.'],
          ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
        </div></div>
      </section>
      <SearchInvitation />
    </div>
  );
}
