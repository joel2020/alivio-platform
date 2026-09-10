import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, CheckCircle2, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ApplicationForm from '../../components/marketing/ApplicationForm';
import { useSeo } from '../../lib/seo';

interface JobDetail {
  id: number;
  title: string;
  location: string | null;
  salary: string | null;
  type: string | null;
  category: string | null;
  description: string | null;
  responsibilities: string[] | null;
  qualifications: string[] | null;
  created_at: string;
}

export default function CareersJobPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSeo({
    title: job ? `${job.title} | Careers | Alivio Search Partners` : 'Open Position | Alivio Search Partners',
    description: job?.description?.slice(0, 155) ?? 'Apply for an open position with Alivio Search Partners.',
    canonicalUrl: `https://aliviosearchpartners.com/careers/${id ?? ''}`,
    structuredData: job
      ? {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.description ?? job.title,
          datePosted: job.created_at,
          employmentType: job.type ?? undefined,
          hiringOrganization: {
            '@type': 'Organization',
            name: 'Alivio Search Partners',
            sameAs: 'https://aliviosearchpartners.com',
          },
          jobLocation: job.location
            ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location } }
            : undefined,
        }
      : undefined,
  });

  useEffect(() => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('jobs')
      .select('id,title,location,salary,type,category,description,responsibilities,qualifications,created_at')
      .eq('id', numericId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setNotFound(true);
        } else {
          setJob(data as JobDetail);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);


  if (loading) {
    return (
      <div style={{ backgroundColor: '#FAFAFA', minHeight: '60vh', paddingTop: 140 }}>
        <div className="mkt-container"><p style={{ color: '#4D5E7B' }}>Loading position…</p></div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div style={{ backgroundColor: '#FAFAFA', minHeight: '60vh', paddingTop: 140 }}>
        <div className="mkt-container">
          <h1 style={{ fontSize: 28, marginBottom: 10 }}>Position not found</h1>
          <p style={{ color: '#4D5E7B', marginBottom: 18 }}>This role may have been filled or removed.</p>
          <Link to="/jobs" className="mkt-btn-primary">Back to open positions</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FAFAFA' }}>
      <section style={{ background: '#0A2C4C', padding: '110px 0 52px' }}>
        <div className="mkt-container">
          <Link to="/jobs" style={{ color: '#A5D1C7', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <ArrowLeft size={14} /> All open positions
          </Link>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px,3.8vw,46px)', lineHeight: 1.1, letterSpacing: '-.03em', marginBottom: 12 }}>{job.title}</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#B9C6E4', fontSize: 14 }}>
            {job.location ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {job.location}</span> : null}
            {job.type ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> {job.type}</span> : null}
            {job.salary ? <span>{job.salary}</span> : null}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 0 80px' }}>
        <div className="mkt-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 24, alignItems: 'start' }}>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 28, background: '#fff' }}>
            {job.description ? (
              <>
                <h2 style={{ fontSize: 20, marginBottom: 10 }}>About the role</h2>
                <p style={{ color: '#4D5E7B', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.description}</p>
              </>
            ) : null}
            {job.responsibilities?.length ? (
              <>
                <h2 style={{ fontSize: 20, margin: '22px 0 10px' }}>What you&apos;ll do</h2>
                <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
                  {job.responsibilities.map((item) => (
                    <li key={item} style={{ display: 'flex', gap: 10, color: '#233657', lineHeight: 1.65, fontSize: 15 }}>
                      <CheckCircle2 size={16} color="#1D55C6" style={{ flexShrink: 0, marginTop: 3 }} /> {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {job.qualifications?.length ? (
              <>
                <h2 style={{ fontSize: 20, margin: '22px 0 10px' }}>What you&apos;ll bring</h2>
                <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
                  {job.qualifications.map((item) => (
                    <li key={item} style={{ display: 'flex', gap: 10, color: '#233657', lineHeight: 1.65, fontSize: 15 }}>
                      <CheckCircle2 size={16} color="#1D55C6" style={{ flexShrink: 0, marginTop: 3 }} /> {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <ApplicationForm key={job.id} jobId={job.id} jobTitle={job.title} />
        </div>
      </section>
    </div>
  );
}
