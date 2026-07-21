import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSeo } from '../../lib/seo';

const industries = {
  healthcare: {
    label: 'Healthcare',
    headline: 'Clinical and healthcare leadership search.',
    intro:
      'Physicians, advanced practice providers, nurses, and the leaders who run clinical enterprises — recruited by a team that speaks licensure, acuity, and payer mix, and screened by AI before a human ever books an interview.',
    roles: [
      'Physicians & medical directors (primary care, behavioral health, specialty)',
      'Nurse practitioners & physician associates',
      'Registered nurses — Med-Surg, ICU, ED, OR, and leadership',
      'Practice administrators & clinic operations leaders',
      'CNO / VP clinical operations / director-level nursing leadership',
      'Revenue cycle, quality, and compliance leadership',
    ],
    proof: [
      'Voice-screened candidates with licensure and availability verified before you meet them',
      'Market maps that show the whole field, not a shortlist of the willing',
      'Weekly pipeline reports with transcripts and scorecards attached',
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

  useSeo({
    title: industry
      ? `${industry.label} Recruiting | Alivio Search Partners`
      : 'Industries | Alivio Search Partners',
    description: industry?.intro.slice(0, 155) ?? 'Industry recruiting practices at Alivio Search Partners.',
    canonicalUrl: `https://aliviosearchpartners.com/industries/${slug ?? ''}`,
  });

  if (!industry) return <Navigate to="/" replace />;

  return (
    <div style={{ backgroundColor: '#FAFAFA' }}>
      <section style={{ background: 'linear-gradient(180deg,#061636 0%,#04132F 100%)', padding: '120px 0 64px' }}>
        <div className="mkt-container">
          <p className="mkt-label" style={{ color: '#8FB4FF' }}>{industry.label} practice</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(32px,4.4vw,54px)', lineHeight: 1.05, letterSpacing: '-.03em', margin: '14px 0 16px', maxWidth: 800 }}>
            {industry.headline}
          </h1>
          <p style={{ color: '#B9C6E4', fontSize: 17, lineHeight: 1.75, maxWidth: 680 }}>{industry.intro}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26 }}>
            <Link to="/start" className="mkt-btn-primary-lg">Request a Search Plan</Link>
            <Link to="/services" className="mkt-btn-secondary" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>All services</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 0 80px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, alignItems: 'start' }}>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 28, background: '#fff' }}>
            <h2 style={{ fontSize: 22, marginBottom: 14 }}>Roles we fill</h2>
            <ul style={{ display: 'grid', gap: 10, padding: 0, listStyle: 'none' }}>
              {industry.roles.map((role) => (
                <li key={role} style={{ display: 'flex', gap: 10, color: '#233657', lineHeight: 1.6, fontSize: 15 }}>
                  <CheckCircle2 size={16} color="#1D55C6" style={{ flexShrink: 0, marginTop: 3 }} /> {role}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 28, background: '#fff' }}>
              <h2 style={{ fontSize: 22, marginBottom: 14 }}>How the engine helps</h2>
              <ul style={{ display: 'grid', gap: 10, padding: 0, listStyle: 'none' }}>
                {industry.proof.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 10, color: '#233657', lineHeight: 1.6, fontSize: 15 }}>
                    <CheckCircle2 size={16} color="#1D55C6" style={{ flexShrink: 0, marginTop: 3 }} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#061636,#0A2352)', borderRadius: 20, padding: 28 }}>
              <h2 style={{ color: '#fff', fontSize: 21, marginBottom: 10 }}>See the platform behind the practice.</h2>
              <p style={{ color: '#B9C6E4', lineHeight: 1.7, marginBottom: 16, fontSize: 15 }}>
                The AI Candidate Engine sources, scores, and screens for every {industry.label.toLowerCase()} search we run.
              </p>
              <Link to="/product" style={{ color: '#8FB4FF', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Explore the AI Candidate Engine <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
