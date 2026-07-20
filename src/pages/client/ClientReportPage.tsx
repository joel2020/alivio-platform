import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabaseFunctionsUrl } from '../../lib/supabase';

/**
 * Public, token-gated weekly client report view (no auth; the token is
 * the credential, resolved server-side by weekly-report-public).
 */

interface PublicReport {
  week_start: string;
  week_end: string;
  candidates_sourced: number;
  candidates_contacted: number;
  candidates_replied: number;
  candidates_screened: number;
  candidates_shortlisted: number;
  candidates_submitted: number;
  interviews_scheduled: number;
  summary: string | null;
  bottlenecks: string[] | null;
  recommendations: string[] | null;
  roles: { title: string; location: string | null } | null;
  clients: { name: string; contact_name: string | null } | null;
}

export default function ClientReportPage() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<PublicReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Missing report link token.');
      setLoading(false);
      return;
    }
    fetch(`${supabaseFunctionsUrl}/weekly-report-public?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error ?? 'Report not found');
        setReport(payload.report as PublicReport);
      })
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F6F8FC', display: 'grid', placeItems: 'center' }}>
        <p style={{ color: '#4D5E7B' }}>Loading report…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ minHeight: '100vh', background: '#F6F8FC', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #DCE4F2', borderRadius: 16, padding: 32, maxWidth: 440, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Report unavailable</h1>
          <p style={{ color: '#4D5E7B', lineHeight: 1.6 }}>{error ?? 'This report link is invalid or has expired.'}</p>
        </div>
      </div>
    );
  }

  const metrics: Array<[string, number]> = [
    ['Candidates sourced', report.candidates_sourced],
    ['Screening calls completed', report.candidates_screened],
    ['Added to shortlist', report.candidates_shortlisted],
    ['Submitted for review', report.candidates_submitted],
    ['Interviews scheduled', report.interviews_scheduled],
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F6F8FC', padding: '40px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <header style={{ background: 'linear-gradient(135deg,#061636,#0A2352)', borderRadius: 20, padding: 'clamp(22px,4vw,36px)', color: '#fff' }}>
          <p style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8FB4FF', fontWeight: 700 }}>
            Alivio Search Partners · Weekly report
          </p>
          <h1 style={{ fontSize: 'clamp(22px,3.4vw,32px)', letterSpacing: '-.02em', margin: '10px 0 6px' }}>
            {report.roles?.title ?? 'Search update'}
          </h1>
          <p style={{ color: '#B9C6E4', fontSize: 14 }}>
            {report.clients?.name ? `Prepared for ${report.clients.name} · ` : ''}
            Week of {report.week_start} to {report.week_end}
          </p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginTop: 16 }}>
          {metrics.map(([label, value]) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #DCE4F2', borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#0B1B36' }}>{value}</p>
              <p style={{ fontSize: 12, color: '#4D5E7B', marginTop: 4, lineHeight: 1.4 }}>{label}</p>
            </div>
          ))}
        </section>

        {report.summary ? (
          <section style={{ background: '#fff', border: '1px solid #DCE4F2', borderRadius: 16, padding: 24, marginTop: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#0B1B36' }}>This week</h2>
            <p style={{ color: '#233657', lineHeight: 1.75, fontSize: 14, whiteSpace: 'pre-line' }}>{report.summary}</p>
          </section>
        ) : null}

        {report.bottlenecks?.length ? (
          <section style={{ background: '#fff', border: '1px solid #DCE4F2', borderRadius: 16, padding: 24, marginTop: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#0B1B36' }}>Bottlenecks</h2>
            <ul style={{ paddingLeft: 18, color: '#233657', lineHeight: 1.7, fontSize: 14 }}>
              {report.bottlenecks.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ) : null}

        {report.recommendations?.length ? (
          <section style={{ background: '#fff', border: '1px solid #DCE4F2', borderRadius: 16, padding: 24, marginTop: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#0B1B36' }}>Recommendations</h2>
            <ul style={{ paddingLeft: 18, color: '#233657', lineHeight: 1.7, fontSize: 14 }}>
              {report.recommendations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ) : null}

        <footer style={{ textAlign: 'center', margin: '28px 0 8px' }}>
          <p style={{ fontSize: 12, color: '#8A94A6' }}>
            Questions? Reply to your Alivio recruiter or email hello@aliviosearchpartners.com
          </p>
        </footer>
      </div>
    </div>
  );
}
