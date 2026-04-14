import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Loader2, Play, Upload, Zap } from 'lucide-react';
import { matchCandidates, parseResume, scoreCandidates, sourceCandidates } from '../../lib/ai';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Role, Candidate, AgentActivityLog } from '../../lib/types';
import LiveActivityFeed from '../../components/app/LiveActivityFeed';
import Toast from '../../components/app/Toast';

interface ParsedResumePreview {
  fullName?: string;
  currentTitle?: string;
  currentCompany?: string;
  location?: string;
  yearsExperience?: number;
  skills?: string[];
  licenses?: string[];
  certifications?: string[];
  education?: string[];
}

const baseAgents = [
  { key: 'scout', name: 'Scout', color: '#3B82F6', description: 'Continuously searches talent sources for matching candidates.' },
  { key: 'match', name: 'Match', color: '#7C3AED', description: 'Match top candidates to open roles.' },
  { key: 'enrich', name: 'Enrich', color: '#10B981', description: 'Extracts structured data and verifies profile completeness.' },
  { key: 'signal', name: 'Signal', color: '#F59E0B', description: 'Scores candidate fit and explains strengths and risks.' },
  { key: 'engage', name: 'Engage', color: '#EC4899', description: 'Drafts personalized outreach and follow-up content.' },
  { key: 'monitor', name: 'Monitor', color: '#06B6D4', description: 'Monitors matching quality and recommends next actions.' },
] as const;

export default function AgentsPage() {
  const { user } = useAuth();
  const [running, setRunning] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activity, setActivity] = useState<AgentActivityLog[]>([]);
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedResumePreview | null>(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [matchResults, setMatchResults] = useState<Array<{ candidateId: string; matchScore: number; reasons: string[] }>>([]);

  const loadContext = useCallback(async () => {
    if (!user?.org_id) return;
    const { data: activeRole } = await supabase.from('roles').select('*').eq('org_id', user.org_id).in('status', ['active', 'paused']).order('updated_at', { ascending: false }).limit(1).maybeSingle();
    setRole(activeRole || null);
    if (activeRole) {
      const [{ data: cands }, { data: logs }] = await Promise.all([
        supabase.from('candidates').select('*').eq('role_id', activeRole.id).order('created_at', { ascending: false }),
        supabase.from('agent_activity_log').select('*').eq('org_id', user.org_id).order('created_at', { ascending: false }).limit(20),
      ]);
      setCandidates(cands || []);
      setActivity(logs || []);
    }
  }, [user?.org_id]);

  useEffect(() => {
    if (!user?.org_id) return;
    loadContext();
  }, [loadContext, user?.org_id]);

  async function log(agent_name: 'scout' | 'enrich' | 'signal' | 'engage' | 'cortex', action: string, detail?: string, candidate_id?: string) {
    if (!user?.org_id) return;
    await supabase.from('agent_activity_log').insert({ org_id: user.org_id, role_id: role?.id ?? null, candidate_id: candidate_id ?? null, agent_name, action, detail: detail ?? null, metadata: {} });
  }

  async function triggerAgent(agentKey: string) {
    if (!role) {
      setToast('Create or activate a role first.');
      return;
    }

    setRunning(agentKey);
    setAgentError(null);
    try {
      if (agentKey === 'scout') {
        console.log('Running scout agent', { roleId: role.id, title: role.title });
        const result = await sourceCandidates(`${role.title} in ${role.location}. ${role.description || ''}`, role.must_have_requirements || []);
        const inserts = result.data.candidatePersonas.slice(0, 5).map((persona, idx) => ({
          org_id: role.org_id,
          role_id: role.id,
          full_name: `${persona.title} Candidate ${idx + 1}`,
          current_title: persona.title,
          current_company: persona.industries[0] || 'Healthcare Organization',
          location: persona.locations[0] || role.location,
          experience_years: role.experience_min + idx,
          skills: persona.keywords.slice(0, 8),
          licenses: [],
          certifications: [],
          source: 'AI Scout',
          profile_data: { persona },
          pipeline_stage: 'discovered',
        }));
        if (inserts.length > 0) {
          await supabase.from('candidates').insert(inserts);
        }
        await log('scout', `Run Scout completed`, `Generated ${inserts.length} candidate profiles from AI sourcing plan.`);
      } else if (agentKey === 'match') {
        const response = await matchCandidates(role.title, candidates.map((c) => ({ id: c.id, name: c.full_name, experienceYears: c.experience_years ?? 0, skills: c.skills })));
        setMatchResults(response.data.matches);
        await log('cortex', 'Match candidate run complete', `Ranked ${response.data.matches.length} candidates by fit.`);
      } else if (agentKey === 'enrich') {
        const top = candidates[0];
        if (!top) throw new Error('No candidates available to enrich');
        const parsed = await parseResume(`${top.full_name}, ${top.current_title || 'candidate'}. Skills: ${(top.skills || []).join(', ')}`);
        await supabase.from('candidates').update({
          full_name: parsed.data.fullName || top.full_name,
          experience_years: parsed.data.yearsExperience ?? top.experience_years,
          skills: parsed.data.skills.length > 0 ? parsed.data.skills : top.skills,
          certifications: parsed.data.certifications,
          education: parsed.data.education.join(' · ') || top.education,
        }).eq('id', top.id);
        await log('enrich', 'Profile enrichment completed', `Updated profile data for ${top.full_name}.`, top.id);
      } else if (agentKey === 'signal') {
        const response = await scoreCandidates(role.title, candidates.map((c) => ({ id: c.id, name: c.full_name, experienceYears: c.experience_years ?? 0, skills: c.skills })));
        for (const score of response.data.scores) {
          await supabase.from('candidates').update({ score: score.score, score_rationale: score.rationale, pipeline_stage: 'scored' }).eq('id', score.candidateId);
        }
        await log('signal', 'Candidate scoring run complete', `Scored ${response.data.scores.length} candidates.`);
      } else if (agentKey === 'engage') {
        await log('engage', 'Outreach generation ready', 'Use the Outreach page to generate and send messages.');
      } else if (agentKey === 'monitor') {
        const response = await matchCandidates(role.title, candidates.map((c) => ({ id: c.id, name: c.full_name, experienceYears: c.experience_years ?? 0, skills: c.skills })));
        await log('cortex', 'Match quality analysis complete', `Ranked ${response.data.matches.length} candidates by fit.`);
      }

      setStatuses((prev) => ({ ...prev, [agentKey]: 'Active' }));
      setToast('Agent run completed successfully.');
      await loadContext();
    } catch (error) {
      console.error(error);
      setStatuses((prev) => ({ ...prev, [agentKey]: 'Error' }));
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setAgentError(message);
      setToast(`Agent execution failed: ${message}`);
    } finally {
      setRunning(null);
    }
  }

  async function handleResumeFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setResumeFileName(file.name);
      const base64 = await file.arrayBuffer().then((buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer))));
      setResumeText(base64);
      setToast('File uploaded. Ready to parse.');
    } catch (error) {
      console.error('Resume upload failed', error);
      setToast('Could not read resume file.');
    }
  }

  async function handleParseResume() {
    if (!resumeText.trim() && !resumeFileName) {
      setToast('Paste resume text or upload a file first.');
      return;
    }
    setParsingResume(true);
    try {
      const parsed = await parseResume(resumeText.trim());
      setParsedPreview(parsed.data);
      setToast('Resume parsed successfully.');
    } catch (error) {
      console.error(error);
      setToast('Could not parse resume.');
    } finally {
      setParsingResume(false);
    }
  }

  async function saveParsedCandidate() {
    if (!role || !parsedPreview) return;
    setSavingCandidate(true);
    try {
      const payload = {
        org_id: role.org_id,
        role_id: role.id,
        full_name: parsedPreview.fullName || 'Parsed Candidate',
        current_title: parsedPreview.currentTitle || null,
        current_company: parsedPreview.currentCompany || null,
        location: parsedPreview.location || role.location,
        experience_years: parsedPreview.yearsExperience ?? null,
        skills: Array.isArray(parsedPreview.skills) ? parsedPreview.skills : [],
        licenses: Array.isArray(parsedPreview.licenses) ? parsedPreview.licenses : [],
        certifications: Array.isArray(parsedPreview.certifications) ? parsedPreview.certifications : [],
        education: Array.isArray(parsedPreview.education) ? parsedPreview.education.join(' · ') : null,
        source: 'Resume Parser',
        profile_data: { parsed: parsedPreview },
        pipeline_stage: 'discovered',
      };
      await supabase.from('candidates').insert(payload);
      setToast('Candidate saved.');
      await loadContext();
    } catch (error) {
      console.error(error);
      setToast('Could not save candidate.');
    } finally {
      setSavingCandidate(false);
    }
  }

  const agents = useMemo(() => baseAgents.map((agent) => ({ ...agent, status: statuses[agent.key] ?? 'Ready' })), [statuses]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Agents</h1>
        <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 500 }}>{role ? `Active role: ${role.title}` : 'No active role selected'}</span>
      </div>

      <div className="page-content" style={{ maxWidth: '860px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {agents.map((agent) => {
            const isRunning = running === agent.key;
            const statusColor = agent.status === 'Active' ? '#10B981' : agent.status === 'Error' ? '#EF4444' : '#2563EB';
            return (
              <div key={agent.key} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: agent.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Zap size={16} style={{ color: agent.color }} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#09090B' }}>{agent.name}</span>
                      <span style={{ fontSize: '12px', color: statusColor, fontWeight: 600 }}>{agent.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#71717A', lineHeight: 1.6, margin: 0 }}>{agent.description}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Powered by AI</p>
                    {agent.status === 'Error' && agent.key === 'scout' ? (
                      <div className="text-red-500 text-sm mt-2">
                        Error: {agentError || 'Unknown error occurred'}
                      </div>
                    ) : null}
                    {agent.key === 'scout' ? (
                      <a
                        href="https://supabase.com/dashboard/project/_/functions"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '11px', marginTop: '6px', display: 'inline-block', color: 'var(--accent)' }}
                      >
                        View Logs
                      </a>
                    ) : null}
                  </div>
                  <button type="button" onClick={() => triggerAgent(agent.key)} disabled={isRunning} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold" style={{ border: '1px solid var(--border)', backgroundColor: isRunning ? 'var(--bg-subtle)' : 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                    {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    {isRunning ? 'Running...' : agent.key === 'scout' ? 'Run Scout' : agent.key === 'match' ? 'Run Match' : 'Run now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card p-5" style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Parse Resume</h2>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste resume text here..."
            rows={5}
            className="input-base w-full"
          />
          <label className="btn-secondary mt-2 inline-flex items-center gap-1.5" style={{ fontSize: 12, cursor: 'pointer' }}>
            <Upload size={12} /> Upload PDF/DOC/DOCX
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              hidden
              onChange={handleResumeFileUpload}
            />
          </label>
          {resumeFileName && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{resumeFileName}</p>}
          <div className="mt-3 flex gap-2">
            <button className="btn-primary" onClick={handleParseResume} disabled={parsingResume}>
              {parsingResume ? 'Parsing...' : 'Parse Resume'}
            </button>
            {parsedPreview && <button className="btn-secondary" onClick={saveParsedCandidate} disabled={savingCandidate}>{savingCandidate ? 'Saving...' : 'Save Candidate'}</button>}
          </div>

          {parsedPreview && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{parsedPreview.fullName || 'Candidate Preview'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{parsedPreview.currentTitle || 'No title parsed'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Skills: {Array.isArray(parsedPreview.skills) ? parsedPreview.skills.slice(0, 8).join(', ') : 'None'}</p>
            </div>
          )}
        </div>

        {matchResults.length > 0 ? (
          <div className="card p-5" style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Match Results</h2>
            <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              {matchResults.map((match) => (
                <li key={match.candidateId} style={{ marginBottom: '8px' }}>
                  {match.candidateId} — {Math.round(match.matchScore * 100)}% match
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>Agent Activity</h2>
        <LiveActivityFeed initialEntries={activity} simulate={false} />
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
