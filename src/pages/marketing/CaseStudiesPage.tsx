import { ArrowRight } from 'lucide-react';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const studies = [
  {
    company: 'Behavioral Health AI Platform',
    outcome: 'Hired Full-Stack Engineer + AI-forward TPM in 6 weeks',
    details: 'Built a targeted on-site pipeline for a post-seed product team balancing clinical documentation quality, reimbursement workflows, and sprint velocity.',
  },
  {
    company: 'Digital Health Operations Company',
    outcome: 'Placed Revenue Cycle + Compliance-Aware Operator',
    details: 'Mapped talent with payer operations depth and healthcare compliance fluency to improve claim integrity and operational throughput.',
  },
  {
    company: 'Provider-Backed Clinical Software Team',
    outcome: 'Built engineering leadership bench for scale',
    details: 'Delivered shortlist-ready engineering leaders with experience shipping in regulated care settings and managing hybrid teams.',
  },
];

export default function CaseStudiesPage() {
  return (
    <section style={{ padding: '92px 0 72px', background: '#F8FAFF' }}>
      <div className="mkt-container" style={{ maxWidth: 1080 }}>
        <p className="mkt-label" style={{ color: '#1D55C6' }}>SELECTED SEARCH OUTCOMES</p>
        <h1 style={{ fontSize: 'clamp(36px,4.5vw,56px)', letterSpacing: '-0.04em', margin: '8px 0 16px' }}>Case Studies for High-Stakes HealthTech Hiring</h1>
        <p style={{ color: '#4B5D7D', maxWidth: 800, lineHeight: 1.7, marginBottom: 28 }}>When hiring mistakes are expensive, execution quality matters. We run precise searches for technical and operational roles where healthcare complexity meets product urgency.</p>
        <div style={{ display: 'grid', gap: 14 }}>
          {studies.map((s) => (
            <article key={s.company} style={{ background: '#fff', border: '1px solid #DCE4F2', borderRadius: 16, padding: 22 }}>
              <h2 style={{ margin: '0 0 6px', fontSize: 24 }}>{s.company}</h2>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#1D55C6' }}>{s.outcome}</p>
              <p style={{ margin: 0, color: '#4B5D7D' }}>{s.details}</p>
            </article>
          ))}
        </div>
        <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ marginTop: 24, display: 'inline-flex' }}>Discuss Your Search <ArrowRight size={16} /></a>
      </div>
    </section>
  );
}
