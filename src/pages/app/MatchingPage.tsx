import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Filter, Search, Sparkles, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Candidate, Role } from '../../lib/types';
import Toast from '../../components/app/Toast';

type MatchRow = Candidate & {
  computedScore: number;
  matchedSkills: string[];
  missingMustHaves: string[];
  matchLabel: 'Strong match' | 'Review' | 'Low fit';
};

function normalize(value?: string | null) {
  return (value || '').toLowerCase().trim();
}

function tokenSet(items?: string[] | null) {
  return new Set((items || []).map((item) => normalize(item)).filter(Boolean));
}

function scoreCandidateForRole(candidate: Candidate, role: Role): MatchRow {
  const candidateSkills = tokenSet(candidate.skills);
  const mustHaves = role.must_have_requirements || [];
  const niceHaves = role.nice_to_have_requirements || [];
  const matchedMust = mustHaves.filter((skill) => candidateSkills.has(normalize(skill)));
  const matchedNice = niceHaves.filter((skill) => candidateSkills.has(normalize(skill)));
  const missingMustHaves = mustHaves.filter((skill) => !candidateSkills.has(normalize(skill)));

  const mustScore = mustHaves.length ? matchedMust.length / mustHaves.length : 0.55;
  const niceScore = niceHaves.length ? matchedNice.length / niceHaves.length : 0.2;
  const experienceScore = candidate.experience_years && role.experience_min
    ? Math.min(candidate.experience_years / Math.max(role.experience_min, 1), 1)
    : 0.5;
  const storedScore = typeof candidate.score === 'number' ? candidate.score : 0;

  const computedScore = Math.min(
    1,
    Math.max(0, mustScore * 0.45 + niceScore * 0.2 + experienceScore * 0.2 + storedScore * 0.15),
  );

  return {
    ...candidate,
    computedScore,
    matchedSkills: [...matchedMust, ...matchedNice],
    missingMustHaves,
    matchLabel: computedScore >= 0.75 ? 'Strong match' : computedScore >= 0.5 ? 'Review' : 'Low fit',
  };
}

export default function MatchingPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [query, setQuery] = useState('');
  const [minScore, setMinScore] = useState(50);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.org_id) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      const [roleRes, candidateRes] = await Promise.all([
        supabase
          .from('roles')
          .select('*')
          .eq('org_id', user.org_id)
          .in('status', ['active', 'paused', 'draft'])
          .order('updated_at', { ascending: false }),
        supabase
          .from('candidates')
          .select('*')
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false })
          .limit(500),
      ]);

      if (cancelled) return;

      if (roleRes.error || candidateRes.error) {
        setToast(roleRes.error?.message || candidateRes.error?.message || 'Could not load matching data.');
      }

      const loadedRoles = (roleRes.data || []) as Role[];
      setRoles(loadedRoles);
      setCandidates((candidateRes.data || []) as Candidate[]);
      setSelectedRoleId((current) => current || loadedRoles[0]?.id || '');
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.org_id]);

  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId) || null, [roles, selectedRoleId]);

  const matches = useMemo(() => {
    if (!selectedRole) return [];
    const loweredQuery = query.toLowerCase().trim();
    return candidates
      .filter((candidate) => !loweredQuery || [candidate.full_name, candidate.current_title, candidate.current_company, candidate.location, ...(candidate.skills || [])].join(' ').toLowerCase().includes(loweredQuery))
      .map((candidate) => scoreCandidateForRole(candidate, selectedRole))
      .filter((candidate) => candidate.computedScore * 100 >= minScore)
      .sort((a, b) => b.computedScore - a.computedScore);
  }, [candidates, minScore, query, selectedRole]);

  const strongMatches = matches.filter((match) => match.computedScore >= 0.75).length;
  const reviewMatches = matches.filter((match) => match.computedScore >= 0.5 && match.computedScore < 0.75).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Candidate ↔ Job Matching</h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Rank candidates against open roles using skills, requirements, experience, and AI scores.</p>
        </div>
        <Link to="/agents" className="btn-primary" style={{ fontSize: 12 }}>Run AI scoring</Link>
      </div>

      <div className="page-content" style={{ maxWidth: '1180px' }}>
        <div className="grid gap-3 md:grid-cols-4" style={{ marginBottom: 16 }}>
          <div className="card p-4"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Open roles</p><p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{roles.length}</p></div>
          <div className="card p-4"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Candidates</p><p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{candidates.length}</p></div>
          <div className="card p-4"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Strong matches</p><p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{strongMatches}</p></div>
          <div className="card p-4"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Review queue</p><p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{reviewMatches}</p></div>
        </div>

        <div className="card p-4" style={{ marginBottom: 16 }}>
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_180px]">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <Briefcase size={13} className="inline mr-1" /> Role
              <select className="input-base mt-1 w-full" value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)}>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.title} · {role.location}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <Search size={13} className="inline mr-1" /> Search candidates
              <input className="input-base mt-1 w-full" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, title, company, skill..." />
            </label>
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <Filter size={13} className="inline mr-1" /> Min score: {minScore}%
              <input className="mt-3 w-full" type="range" min={0} max={90} step={5} value={minScore} onChange={(event) => setMinScore(Number(event.target.value))} />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="card p-6" style={{ color: 'var(--text-secondary)' }}>Loading matching workspace...</div>
        ) : !selectedRole ? (
          <div className="card p-6 text-center">
            <Sparkles size={22} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Create a role first</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Matching needs at least one role and candidate pipeline.</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="grid grid-cols-[1.2fr_90px_1fr_1fr_110px] gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Candidate</span><span>Score</span><span>Matched skills</span><span>Gaps</span><span>Status</span>
            </div>
            {matches.map((candidate) => (
              <Link key={candidate.id} to={`/candidates/${candidate.id}`} className="grid grid-cols-[1.2fr_90px_1fr_1fr_110px] gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>{candidate.full_name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{candidate.current_title || 'Candidate'}{candidate.current_company ? ` · ${candidate.current_company}` : ''}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{candidate.location || 'Location unknown'}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 800 }}>{Math.round(candidate.computedScore * 100)}%</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>fit</p>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {candidate.matchedSkills.length ? candidate.matchedSkills.slice(0, 4).join(', ') : 'No direct skill matches yet'}
                </div>
                <div style={{ color: candidate.missingMustHaves.length ? '#B45309' : 'var(--text-muted)', fontSize: 12 }}>
                  {candidate.missingMustHaves.length ? candidate.missingMustHaves.slice(0, 4).join(', ') : 'No major gaps'}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-1" style={{ background: candidate.computedScore >= 0.75 ? '#ECFDF5' : candidate.computedScore >= 0.5 ? '#FFFBEB' : '#FEF2F2', color: candidate.computedScore >= 0.75 ? '#047857' : candidate.computedScore >= 0.5 ? '#B45309' : '#B91C1C', fontSize: 11, fontWeight: 700 }}>
                    {candidate.computedScore >= 0.75 ? <CheckCircle2 size={12} /> : <Users size={12} />}
                    {candidate.matchLabel}
                  </span>
                </div>
              </Link>
            ))}
            {matches.length === 0 ? (
              <div className="p-6 text-center" style={{ color: 'var(--text-muted)', fontSize: 13 }}>No candidates match the current filters.</div>
            ) : null}
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
