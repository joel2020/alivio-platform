import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Settings, Download, Pause, Play, Search, ChevronUp, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Role, Candidate, PipelineStage, VoiceCall } from '../../lib/types';
import { PIPELINE_STAGES, STAGE_LABELS } from '../../lib/types';
import { matchCandidates, scoreCandidates } from '../../lib/ai';
import Toast from '../../components/app/Toast';

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const pct = Math.round(score * 100);
  const color = score >= 0.85 ? 'var(--success)' : score >= 0.70 ? 'var(--warning)' : 'var(--error)';
  const bg = score >= 0.85 ? 'var(--success-subtle)' : score >= 0.70 ? 'var(--warning-subtle)' : 'var(--error-subtle)';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        borderRadius: '5px',
        fontSize: '0.6875rem',
        fontWeight: 700,
        backgroundColor: bg,
        color,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {pct}%
    </span>
  );
}

function StageBadge({ stage }: { stage: PipelineStage }) {
  const map: Record<PipelineStage, { bg: string; text: string }> = {
    discovered: { bg: 'var(--bg-subtle)', text: 'var(--text-muted)' },
    scored: { bg: 'var(--accent-subtle)', text: 'var(--accent)' },
    voice_qualified: { bg: 'var(--success-subtle)', text: 'var(--success)' },
    engaged: { bg: '#fdf2f8', text: '#be185d' },
    responded: { bg: '#ecfeff', text: '#0e7490' },
    scheduled: { bg: '#f0fdf4', text: '#166534' },
    archived: { bg: 'var(--bg-subtle)', text: 'var(--text-muted)' },
  };
  const c = map[stage];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        borderRadius: '5px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.text,
        whiteSpace: 'nowrap',
      }}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

function QualBadge({ status }: { status: string | null }) {
  if (!status) return <span style={{ color: 'var(--border-strong)', fontSize: '0.875rem' }}>—</span>;
  const map: Record<string, { bg: string; text: string }> = {
    qualified:     { bg: 'var(--success-subtle)', text: 'var(--success)' },
    disqualified:  { bg: 'var(--error-subtle)', text: 'var(--error)' },
    needs_review:  { bg: 'var(--warning-subtle)', text: 'var(--warning)' },
    declined:      { bg: 'var(--bg-subtle)', text: 'var(--text-muted)' },
    escalated:     { bg: 'var(--warning-subtle)', text: 'var(--warning)' },
  };
  const c = map[status] || { bg: 'var(--bg-subtle)', text: 'var(--text-muted)' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        borderRadius: '5px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.text,
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function SortIcon({ active, dir }: { field: string; active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronUp size={10} style={{ opacity: 0.2, marginLeft: 2 }} />;
  return dir === 'asc'
    ? <ChevronUp size={10} style={{ color: 'var(--accent)', marginLeft: 2 }} />
    : <ChevronDown size={10} style={{ color: 'var(--accent)', marginLeft: 2 }} />;
}

export default function PipelinePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [activeStage, setActiveStage] = useState<PipelineStage | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'score' | 'full_name' | 'experience_years'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    const [roleRes, candRes, callsRes] = await Promise.all([
      supabase.from('roles').select('*').eq('id', id).single(),
      supabase.from('candidates').select('*').eq('role_id', id).order('score', { ascending: false }),
      supabase.from('voice_calls').select('*').eq('role_id', id),
    ]);
    setRole(roleRes.data);
    setCandidates(candRes.data || []);
    setCalls(callsRes.data || []);
    setLoading(false);
  }

  async function toggleStatus() {
    if (!role) return;
    const newStatus = role.status === 'active' ? 'paused' : 'active';
    await supabase.from('roles').update({ status: newStatus }).eq('id', role.id);
    setRole({ ...role, status: newStatus });
  }

  const stageCounts = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter(c => c.pipeline_stage === stage).length;
    return acc;
  }, {} as Record<PipelineStage, number>);

  const filteredCandidates = candidates
    .filter(c => activeStage === 'all' ? true : c.pipeline_stage === activeStage)
    .filter(c => !search || c.full_name.toLowerCase().includes(search.toLowerCase()) || (c.current_company || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (sortDir === 'desc') return (bVal as number) > (aVal as number) ? 1 : -1;
      return (aVal as number) > (bVal as number) ? 1 : -1;
    });

  function getCallForCandidate(candidateId: string) {
    return calls.find(c => c.candidate_id === candidateId);
  }

  function handleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  async function handleRunAIMatch() {
    if (!role || candidates.length === 0) {
      setToast('No candidates available for AI matching.');
      return;
    }
    setMatching(true);
    try {
      const response = await matchCandidates(
        `${role.title} in ${role.location}`,
        candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.full_name,
          experienceYears: candidate.experience_years ?? undefined,
          skills: candidate.skills,
          location: candidate.location ?? undefined,
          notes: candidate.current_title ?? undefined,
        })),
      );
      for (const match of response.data.matches) {
        const nextStage: PipelineStage = match.nextStep === 'screen' ? 'voice_qualified' : match.nextStep === 'hold' ? 'scored' : 'archived';
        await supabase.from('candidates').update({
          pipeline_stage: nextStage,
          score: match.matchScore,
          score_rationale: match.reasons.join(' · '),
        }).eq('id', match.candidateId);
      }
      await supabase.from('agent_activity_log').insert({
        org_id: role.org_id,
        role_id: role.id,
        candidate_id: null,
        agent_name: 'cortex',
        action: 'AI candidate matching completed',
        detail: `Ranked ${response.data.matches.length} candidates by fit.`,
        metadata: {},
      });
      await loadData();
      setToast(`AI matching completed for ${response.data.matches.length} candidates.`);
    } catch (error) {
      console.error(error);
      setToast('AI matching failed. Please try again.');
    } finally {
      setMatching(false);
    }
  }

  async function handleScoreCandidates() {
    if (!role || candidates.length === 0) {
      setToast('No candidates available for AI scoring.');
      return;
    }
    setScoring(true);
    try {
      const response = await scoreCandidates(
        `${role.title} in ${role.location}. Must-have: ${(role.must_have_requirements || []).join(', ')}`,
        candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.full_name,
          experienceYears: candidate.experience_years ?? undefined,
          skills: candidate.skills,
          location: candidate.location ?? undefined,
          notes: candidate.current_title ?? undefined,
        })),
      );
      for (const scored of response.data.scores) {
        await supabase.from('candidates').update({
          score: scored.score,
          score_rationale: scored.rationale,
          score_breakdown: {
            hard_qualification: Math.min(1, scored.score + 0.05),
            experience_trajectory: scored.score,
            skills_adjacency: Math.max(0, scored.score - 0.04),
            engagement_propensity: Math.max(0, scored.score - 0.08),
          },
          pipeline_stage: 'scored',
        }).eq('id', scored.candidateId);
      }
      await supabase.from('agent_activity_log').insert({
        org_id: role.org_id,
        role_id: role.id,
        candidate_id: null,
        agent_name: 'signal',
        action: 'AI candidate scoring completed',
        detail: `Scored ${response.data.scores.length} candidates.`,
        metadata: {},
      });
      await loadData();
      setToast(`AI scored ${response.data.scores.length} candidates.`);
    } catch (error) {
      console.error(error);
      setToast('AI scoring failed. Please try again.');
    } finally {
      setScoring(false);
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!role) return (
    <div className="p-8" style={{ color: 'var(--text-primary)' }}>Role not found</div>
  );

  const isActive = role.status === 'active';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header" style={{ height: '60px', paddingTop: 0, paddingBottom: 0 }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Link
                to="/dashboard"
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
                className="hover:underline"
              >
                Dashboard
              </Link>
              <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>/</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {role.title}
              </span>
            </div>
            <h1
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              {role.title}
            </h1>
          </div>
          <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}>
            {role.status}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleStatus} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '5px 11px' }}>
            {isActive ? <><Pause size={12} strokeWidth={2} /> Pause</> : <><Play size={12} strokeWidth={2} /> Resume</>}
          </button>
          <Link
            to={`/roles/${id}/settings`}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '5px 11px' }}
          >
            <Settings size={12} strokeWidth={2} /> Settings
          </Link>
          <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '5px 11px' }}>
            <Download size={12} strokeWidth={2} /> Export
          </button>
          <button onClick={handleRunAIMatch} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '5px 11px' }} disabled={matching}>
            {matching ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} strokeWidth={2} />} Match Candidates
          </button>
          <button onClick={handleScoreCandidates} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '5px 11px' }} disabled={scoring}>
            {scoring ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} strokeWidth={2} />} Score Candidates
          </button>
        </div>
      </div>
      <div style={{ padding: '0 24px', marginTop: '6px', marginBottom: '-4px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Powered by AI</p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="flex items-center overflow-x-auto scrollbar-thin"
          style={{ padding: '0 24px' }}
        >
          {([['all', 'All', candidates.length], ...PIPELINE_STAGES.map(s => [s, STAGE_LABELS[s], stageCounts[s]])] as [string, string, number][]).map(
            ([stage, label, count]) => {
              const isSelected = activeStage === stage;
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage as PipelineStage | 'all')}
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 600 : 500,
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: `2px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                    color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                    background: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {label}
                  {count > 0 && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-subtle)',
                        color: isSelected ? '#fff' : 'var(--text-muted)',
                        lineHeight: '1.5',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div className="relative" style={{ maxWidth: '280px', flex: 1 }}>
          <Search
            size={13}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: '10px', color: 'var(--text-muted)' }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="input-base w-full"
            style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px' }}
          />
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filteredCandidates.length} of {candidates.length}
        </span>
      </div>

      <div style={{ backgroundColor: 'var(--bg-base)', flex: 1 }}>
        {filteredCandidates.length === 0 ? (
          <div className="py-20 text-center">
            {candidates.length === 0 ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-5">
                  {(['scout', 'enrich', 'signal'] as const).map((agent, i) => {
                    const colors: Record<string, string> = { scout: '#3B82F6', enrich: '#10B981', signal: '#F59E0B' };
                    return (
                      <span key={agent} className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: colors[agent], animationDelay: `${i * 200}ms` }} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: colors[agent] }} />
                      </span>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Agents are working
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto', lineHeight: '1.6' }}>
                  Scout is sourcing candidates. First profiles typically appear within 15–30 minutes.
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  No matches
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Try clearing the filter or search.
                </p>
              </>
            )}
          </div>
        ) : (
          <div
            className="card overflow-hidden"
            style={{
              margin: '20px 24px',
              borderRadius: '10px',
            }}
          >
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('full_name')} style={{ cursor: 'pointer' }}>
                      <span className="flex items-center">
                        Candidate
                        <SortIcon field="full_name" active={sortField === 'full_name'} dir={sortDir} />
                      </span>
                    </th>
                    <th onClick={() => handleSort('score')} style={{ cursor: 'pointer' }}>
                      <span className="flex items-center">
                        Score
                        <SortIcon field="score" active={sortField === 'score'} dir={sortDir} />
                      </span>
                    </th>
                    <th>Stage</th>
                    <th>Voice</th>
                    <th>Company</th>
                    <th onClick={() => handleSort('experience_years')} style={{ cursor: 'pointer' }}>
                      <span className="flex items-center">
                        Exp
                        <SortIcon field="experience_years" active={sortField === 'experience_years'} dir={sortDir} />
                      </span>
                    </th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c) => {
                    const call = getCallForCandidate(c.id);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => navigate(`/candidates/${c.id}`)}
                      >
                        <td style={{ paddingLeft: '20px' }}>
                          <p
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              lineHeight: 1.3,
                            }}
                          >
                            {c.full_name}
                          </p>
                          {c.current_title && (
                            <p
                              style={{
                                fontSize: '0.6875rem',
                                color: 'var(--text-muted)',
                                marginTop: '2px',
                                lineHeight: 1.3,
                              }}
                            >
                              {c.current_title}
                            </p>
                          )}
                        </td>
                        <td><ScoreBadge score={c.score} /></td>
                        <td><StageBadge stage={c.pipeline_stage} /></td>
                        <td>
                          {call
                            ? <QualBadge status={call.qualification_status} />
                            : <span style={{ color: 'var(--border-strong)', fontSize: '0.875rem' }}>—</span>
                          }
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {c.current_company || '—'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: 500,
                              color: 'var(--text-secondary)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {c.experience_years != null ? `${c.experience_years}y` : '—'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              color: 'var(--text-muted)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {formatRelativeTime(c.updated_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
