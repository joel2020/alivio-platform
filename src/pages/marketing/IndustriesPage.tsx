import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DiscussSearchLink, SearchEvidence, SearchInvitation } from '../../components/marketing/RecruitingFirmSections';

const industries = {
  healthcare: {
    label: 'Healthcare',
    headline: 'Clinical and healthcare leadership search.',
    intro:
      'Physicians, advanced practice providers, nurses, and the leaders who run clinical enterprises. We define the clinical setting, role requirements, and market constraints before building a targeted search.',
    roles: [
      'Physicians & medical directors (primary care, behavioral health, specialty)',
      'Nurse practitioners & physician associates',
      'Registered nurses — Med-Surg, ICU, ED, OR, and leadership',
      'Practice administrators & clinic operations leaders',
      'CNO / VP clinical operations / director-level nursing leadership',
      'Revenue cycle, quality, and compliance leadership',
    ],
    proof: [
      'Role scorecards that account for clinical setting, licensure requirements, and availability',
      'Targeted market research and recruiter-reviewed candidate profiles',
      'Weekly search reporting, fit rationale, and questions to explore in interviews',
    ],
  },
  technology: {
    label: 'Technology',
    headline: 'Engineering, product, and data teams for healthtech velocity.',
    intro:
      'High-growth healthtech and AI companies hire with us when the roadmap can’t wait. We recruit engineers, product leaders, and data teams calibrated to startup pace, equity-stage compensation, and healthcare domain constraints.',
    roles: [
      'Software engineers — full-stack, backend, ML/AI',
      'Founding engineers & technical leads',
      'Product managers & product leadership',
      'Data scientists, analysts, and data engineers',
      'Design & UX for clinical products',
      'CTO / VP engineering searches',
    ],
    proof: [
      'Calibrated scorecards tuned to stage, stack, and domain',
      'AI-scored pipelines with reasoning shown for every ranking',
      'Nearshore LATAM coverage for timezone-aligned senior talent',
    ],
  },
} as const;

export default function IndustriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug && slug in industries ? industries[slug as keyof typeof industries] : null;



  if (!industry) return <Navigate to="/" replace />;

  return (
    <div className="firm-page">
      <section className="firm-inner-hero">
        <div className="mkt-container">
          <p className="firm-eyebrow">{industry.label} practice</p>
          <h1>{industry.headline}</h1>
          <p className="firm-lead">{industry.intro}</p>
          <DiscussSearchLink />
        </div>
      </section>
      <section className="firm-section">
        <div className="mkt-container firm-split">
          <div>
            <p className="firm-eyebrow">Our focus</p><h2>Roles that make<br />a difference.</h2>
            <ul className="firm-role-list">{industry.roles.map(role => <li key={role}>{role}</li>)}</ul>
            <div className="firm-assessment"><h3>Define the criteria before the search.</h3><p>{slug === 'healthcare' ? 'We discuss specialty, care setting, leadership scope, location, and schedule alongside compensation and credential requirements. That brief guides the search and the questions your team takes into interviews.' : 'We discuss technical scope, company stage, product context, compensation, and working arrangements. Those criteria shape the target market and the evidence your team needs to assess fit.'}</p></div>
          </div>
          <aside className="firm-deliverables" aria-labelledby="deliverables-heading">
            <p className="firm-eyebrow">Your search deliverables</p><h2 id="deliverables-heading">Context for<br />every decision.</h2>
            <ul className="firm-role-list">{industry.proof.map(item => <li key={item}>{item}</li>)}</ul>
            <p>The AI Candidate Engine supports research, matching, and outreach. Recruiters review the shortlist and explain the fit and trade-offs.</p>
            <Link to="/services" className="firm-text-link">Compare engagement models <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/product" className="firm-text-link">Explore the AI Candidate Engine <ArrowRight size={16} aria-hidden="true" /></Link>
          </aside>
        </div>
      </section>
      {slug === 'healthcare' ? <SearchEvidence /> : <section className="firm-section firm-evidence"><div className="mkt-container firm-split"><div><p className="firm-eyebrow">Nearshore recruiting</p><h2>Extend the search<br />across Latin America.</h2></div><div><p className="firm-lead">Explore bilingual, technical, and operations talent for U.S. teams. Define language requirements, working hours, and role expectations as part of the search brief.</p><Link to="/nearshore-latam-recruiting" className="firm-text-link">Explore LATAM recruiting <ArrowRight size={16} aria-hidden="true" /></Link></div></div></section>}
      <SearchInvitation />
    </div>
  );
}
