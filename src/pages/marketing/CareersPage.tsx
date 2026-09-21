import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSeo } from '../../lib/seo';

export interface PublicJob {
  id: number;
  title: string;
  location: string | null;
  salary: string | null;
  type: string | null;
  category: string | null;
  description: string | null;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useSeo({
    title: 'Open Jobs | Alivio Search Partners',
    description:
      'Open clinical, technical, and recruiting positions with Alivio Search Partners and our healthcare and technology clients. Apply directly online.',
    canonicalUrl: 'https://aliviosearchpartners.com/jobs',
  });

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('jobs')
      .select('id,title,location,salary,type,category,description')
      .order('created_at', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (cancelled) return;
        if (loadError) {
          setError(loadError.message);
        } else {
          setJobs((data ?? []) as PublicJob[]);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(jobs.map((job) => job.category).filter(Boolean))) as string[]],
    [jobs],
  );

  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesCategory = category === 'All' || job.category === category;
      const matchesTerm =
        !term ||
        job.title.toLowerCase().includes(term) ||
        (job.location ?? '').toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [jobs, search, category]);

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '70vh' }}>
      <section style={{ background: '#0A2C4C', padding: '76px 0 60px' }}>
        <div className="mkt-container">
          <p className="mkt-label" style={{ color: '#A5D1C7' }}>Open jobs</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(32px,4.4vw,54px)', lineHeight: 1.05, letterSpacing: '-.03em', margin: '14px 0 14px' }}>
            Find your next opportunity.
          </h1>
          <p style={{ color: '#D9E5EF', fontSize: 17, lineHeight: 1.7, maxWidth: 640 }}>
            Roles with Alivio and with the healthcare and technology teams we recruit for. Explore current opportunities and apply directly to the roles that fit your experience.
          </p>
        </div>
      </section>

      <section style={{ padding: '40px 0 80px' }}>
        <div className="mkt-container">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 22 }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 420 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#8A94A6' }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or location"
                aria-label="Search positions"
                style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 10, border: '1px solid #DCE4F2', background: '#fff', fontSize: 14 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: option === category ? '1px solid #1D55C6' : '1px solid #DCE4F2',
                    background: option === category ? '#1D55C6' : '#fff',
                    color: option === category ? '#fff' : '#233657',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#4D5E7B' }}>Loading open positions…</p>
          ) : error ? (
            <p style={{ color: '#B4232A' }}>Unable to load positions right now. Please try again shortly.</p>
          ) : visibleJobs.length === 0 ? (
            <p style={{ color: '#4D5E7B' }}>No positions match that filter. Try clearing the search.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
              {visibleJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/careers/${job.id}`}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: 16,
                    alignItems: 'center',
                    border: '1px solid #DCE4F2',
                    borderRadius: 16,
                    padding: '18px 22px',
                    background: '#fff',
                    textDecoration: 'none',
                    boxShadow: '0 6px 20px rgba(7,25,62,.05)',
                  }}
                >
                  <div style={{ flex: '1 1 180px', minWidth: 0, overflowWrap: 'anywhere' }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0B1B36', marginBottom: 6 }}>{job.title}</h2>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', color: '#4D5E7B', fontSize: 13 }}>
                      {job.location ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <MapPin size={13} /> {job.location}
                        </span>
                      ) : null}
                      {job.type ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Briefcase size={13} /> {job.type}
                        </span>
                      ) : null}
                      {job.salary ? <span>{job.salary}</span> : null}
                    </div>
                  </div>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#1D55C6',
                      background: '#EFF4FF',
                      borderRadius: 999,
                      padding: '5px 12px',
                    }}
                  >
                    {job.category ?? 'Open role'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
