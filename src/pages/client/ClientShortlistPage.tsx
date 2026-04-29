import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, HelpCircle, MessageSquare, Star, ThumbsDown, CalendarCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Decision = 'pending' | 'interested' | 'not_fit' | 'interview' | 'more_info';

type PortalCandidate = {
  id: string;
  display_name: string | null;
  summary: string | null;
  recommendation: string | null;
  compensation_notes: string | null;
  interview_questions: string[];
  client_decision: Decision;
  client_feedback: string | null;
  candidate_role_matches: {
    match_score: number;
    status: string;
    reasons: string[];
    risks: string[];
    next_step: string | null;
    candidates: {
      full_name: string;
      current_title: string | null;
      current_company: string | null;
      location: string | null;
      experience_years: number | null;
      skills: string[] | null;
      summary: string | null;
    } | null;
  } | null;
};

type ShortlistResponse = {
  shortlist: {
    id: string;
    title: string;
    status: string;
    roles: { title: string; location: string | null; compensation_min: number | null; compensation_max: number | null } | null;
    clients: { name: string; contact_name: string | null } | null;
  };
  candidates: PortalCandidate[];
};

const decisionLabels: Record<Decision, string> = {
  pending: 'Pending',
  interested: 'Interested',
  not_fit: 'Not a fit',
  interview: 'Request interview',
  more_info: 'More info',
};

export default function ClientShortlistPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ShortlistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const endpoint = useMemo(() => {
    if (!token) return null;
    const url = `${supabase.functions.url}/client-shortlist-public?token=${encodeURIComponent(token)}`;
    return url;
  }, [token]);

  useEffect(() => {
    if (!endpoint) return;
    setLoading(true);
    fetch(endpoint)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Could not load shortlist');
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load shortlist'))
      .finally(() => setLoading(false));
  }, [endpoint]);

  async function submitDecision(shortlistCandidateId: string, decision: Decision) {
    if (!endpoint) return;
    setSavingId(shortlistCandidateId);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortlistCandidateId, decision, feedback: feedback[shortlistCandidateId] || '' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save decision');
      setData((prev) => prev ? {
        ...prev,
        candidates: prev.candidates.map((candidate) => candidate.id === shortlistCandidateId ? { ...candidate, client_decision: decision, client_feedback: feedback[shortlistCandidateId] || null } : candidate),
      } : prev);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not save decision');
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#0f172a' }}>Loading shortlist…</div>;
  if (error || !data) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#991b1b' }}>{error || 'Shortlist not found'}</div>;

  const role = data.shortlist.roles;
  const client = data.shortlist.clients;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)', color: '#0f172a' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', letterSpacing: '.08em', textTransform: 'uppercase' }}>Alivio Candidate Shortlist</div>
          <h1 style={{ margin: '8px 0 8px', fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.04em' }}>{data.shortlist.title}</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: 15 }}>{client?.name ? `${client.name} · ` : ''}{role?.title || 'Role'}{role?.location ? ` · ${role.location}` : ''}</p>
        </div>
      </header>

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 24px 60px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 22 }}>
          <div style={statCard}><strong>{data.candidates.length}</strong><span>Candidates submitted</span></div>
          <div style={statCard}><strong>{data.candidates.filter(c => c.client_decision === 'interested' || c.client_decision === 'interview').length}</strong><span>Positive responses</span></div>
          <div style={statCard}><strong>{data.candidates.filter(c => c.client_decision === 'pending').length}</strong><span>Pending review</span></div>
        </section>

        <div style={{ display: 'grid', gap: 16 }}>
          {data.candidates.map((candidate, index) => {
            const match = candidate.candidate_role_matches;
            const profile = match?.candidates;
            const score = Math.round(Number(match?.match_score || 0) * 100);
            const name = candidate.display_name || profile?.full_name || `Candidate ${index + 1}`;
            return (
              <article key={candidate.id} style={{ border: '1px solid #e2e8f0', borderRadius: 18, background: '#fff', padding: 20, boxShadow: '0 16px 40px rgba(15,23,42,.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: 22, letterSpacing: '-0.025em' }}>{name}</h2>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '4px 8px', borderRadius: 999 }}><Star size={13} /> {score}% fit</span>
                      {candidate.client_decision !== 'pending' && <span style={{ fontSize: 12, fontWeight: 800, color: '#1d4ed8', background: '#dbeafe', padding: '4px 8px', borderRadius: 999 }}>{decisionLabels[candidate.client_decision]}</span>}
                    </div>
                    <p style={{ margin: '6px 0 0', color: '#64748b' }}>{profile?.current_title || 'Candidate'}{profile?.current_company ? ` · ${profile.current_company}` : ''}{profile?.location ? ` · ${profile.location}` : ''}</p>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{profile?.experience_years != null ? `${profile.experience_years} years experience` : ''}</div>
                </div>

                <p style={{ margin: '16px 0', color: '#334155', lineHeight: 1.65 }}>{candidate.summary || candidate.recommendation || profile?.summary || 'Strong candidate profile selected for review.'}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                  <div style={panel}><h3>Why they match</h3><ul>{(match?.reasons?.length ? match.reasons : ['Relevant background for the role']).map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div style={panel}><h3>Potential risks</h3><ul>{(match?.risks?.length ? match.risks : ['Confirm compensation, availability, and location fit']).map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div style={panel}><h3>Skills</h3><p>{profile?.skills?.slice(0, 12).join(', ') || 'Skills to be confirmed during screen.'}</p></div>
                </div>

                {candidate.interview_questions?.length > 0 && (
                  <div style={{ ...panel, marginTop: 12 }}><h3>Suggested interview questions</h3><ul>{candidate.interview_questions.map((q) => <li key={q}>{q}</li>)}</ul></div>
                )}

                <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <textarea value={feedback[candidate.id] ?? candidate.client_feedback ?? ''} onChange={(e) => setFeedback((prev) => ({ ...prev, [candidate.id]: e.target.value }))} placeholder="Optional feedback for Alivio…" style={{ width: '100%', minHeight: 74, borderRadius: 12, border: '1px solid #cbd5e1', padding: 12, font: 'inherit', resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    <button disabled={savingId === candidate.id} onClick={() => submitDecision(candidate.id, 'interested')} style={buttonPrimary}><CheckCircle2 size={15} /> Interested</button>
                    <button disabled={savingId === candidate.id} onClick={() => submitDecision(candidate.id, 'interview')} style={buttonPrimary}><CalendarCheck size={15} /> Request interview</button>
                    <button disabled={savingId === candidate.id} onClick={() => submitDecision(candidate.id, 'more_info')} style={buttonSecondary}><HelpCircle size={15} /> More info</button>
                    <button disabled={savingId === candidate.id} onClick={() => submitDecision(candidate.id, 'not_fit')} style={buttonSecondary}><ThumbsDown size={15} /> Not a fit</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

const statCard: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 16, background: '#fff', padding: 16, display: 'flex', flexDirection: 'column', gap: 4 };
const panel: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 14, background: '#f8fafc', padding: 14, color: '#334155', lineHeight: 1.55 };
const buttonPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderRadius: 999, background: '#2563eb', color: '#fff', padding: '9px 13px', fontWeight: 800, cursor: 'pointer' };
const buttonSecondary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid #cbd5e1', borderRadius: 999, background: '#fff', color: '#334155', padding: '9px 13px', fontWeight: 800, cursor: 'pointer' };
