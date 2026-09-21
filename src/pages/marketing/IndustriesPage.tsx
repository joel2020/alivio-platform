import { practices } from '../../lib/recruitingContent';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DiscussSearchLink, SearchInvitation } from '../../components/marketing/RecruitingFirmSections';
import { Benefits, PracticeCards, InternationalSearches } from '../../components/marketing/RecruitingContent';
import NotFoundPage from '../NotFoundPage';

export default function IndustriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const industry = practices.find(practice => practice.slug === slug);
  if (slug && !industry) return <NotFoundPage />;
  return <div className="firm-page"><section className="firm-inner-hero"><div className="mkt-container"><p className="firm-eyebrow">Our expertise</p><h1>{industry?.title || 'Specialized Recruiting Across Healthcare, Technology, and Leadership'}</h1><p className="firm-lead">{industry?.intro || 'The right hire starts with understanding the work. We combine industry focus, market research, and direct outreach to find professionals who fit your organization.'}</p><DiscussSearchLink /></div></section>
    <section className="firm-section"><div className="mkt-container">{industry ? <div className="recruiting-two-col"><div><p className="firm-eyebrow">Roles we recruit</p><h2>Focused on your field.</h2><Benefits items={industry.roles} /><Link to="/jobs" className="firm-text-link">View Open Jobs <ArrowRight size={18} aria-hidden="true" /></Link></div><img className="recruiting-page-image" src={industry.image} alt={industry.alt} width="850" height="560" /></div> : <><PracticeCards /><InternationalSearches /></>}</div></section>
    {industry && <section className="firm-section recruiting-about"><div className="mkt-container recruiting-two-col"><div><p className="firm-eyebrow">A search built around you</p><h2>Qualified people. Meaningful context.</h2></div><div><p>Every search begins with the role, compensation, location, and the experience your team needs. We map the market, engage active and passive candidates, and vet interest and fit before presenting a shortlist.</p><p>From interview feedback to offer expectations, your search partner keeps the process moving with clear communication.</p><Link to="/employers#engagement-models" className="firm-text-link">Explore contingency and retained search <ArrowRight size={18} aria-hidden="true" /></Link></div></div></section>}
    <SearchInvitation /></div>;
}
