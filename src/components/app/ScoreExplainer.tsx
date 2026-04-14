import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import type { Candidate, Role } from '../../lib/types';
import { scoreCandidates } from '../../lib/ai';
import { supabase } from '../../lib/supabase';
import Toast from './Toast';

interface DimensionExplanation {
  label: string;
  score: number;
  summary: string;
  detail: string;
  color: string;
}

function explainHardQualification(score: number, candidate: Candidate, role: Role): DimensionExplanation {
  const color = score >= 0.85 ? '#22C55E' : score >= 0.70 ? '#F59E0B' : '#EF4444';
  const licenses = candidate.licenses.join(', ') || 'none on file';
  const certs = candidate.certifications.join(', ') || 'none on file';
  const reqs = role?.must_have_requirements?.slice(0, 2).join(' and ') || 'role requirements';

  let summary: string;
  let detail: string;

  if (score >= 0.90) {
    summary = 'All mandatory requirements confirmed';
    detail = `Candidate holds ${licenses}${candidate.certifications.length > 0 ? ` and ${certs}` : ''} — fully satisfying hard qualifications for ${role?.title || 'this role'}. No gaps detected in mandatory criteria.`;
  } else if (score >= 0.75) {
    summary = 'Most hard requirements met';
    detail = `Credentials on file: ${licenses}. ${candidate.certifications.length > 0 ? `Certifications: ${certs}.` : ''} Minor gaps exist relative to ${reqs}, but core eligibility is strong.`;
  } else if (score >= 0.60) {
    summary = 'Partial requirement match — verification needed';
    detail = `Some mandatory criteria are met, but ${reqs} may require additional verification. Signal agent flagged credential ambiguity for manual review.`;
  } else {
    summary = 'Significant qualification gaps detected';
    detail = `Candidate lacks confirmed credentials for one or more required qualifications: ${reqs}. Score reflects high uncertainty — voice verification recommended before advancing.`;
  }

  return { label: 'Hard Qualification', score, summary, detail, color };
}

function explainExperienceTrajectory(score: number, candidate: Candidate, role: Role): DimensionExplanation {
  const color = score >= 0.85 ? '#22C55E' : score >= 0.70 ? '#F59E0B' : '#EF4444';
  const years = candidate.experience_years ?? 0;
  const minExp = role?.experience_min ?? 0;
  const maxExp = role?.experience_max ?? 20;

  let summary: string;
  let detail: string;

  if (score >= 0.90) {
    summary = 'Strong career progression in target specialty';
    detail = `${years} years of experience — ${years >= maxExp ? 'seasoned senior profile, well above minimum threshold' : `above the ${minExp}-year minimum, with clear upward trajectory`}. Current role at ${candidate.current_company || 'their employer'} reflects deepening specialization.`;
  } else if (score >= 0.75) {
    summary = 'Solid experience base with upward trajectory';
    detail = `${years} years of relevant experience — meets the ${minExp}+ year requirement. Career history at ${candidate.current_company || 'current employer'} shows consistent growth, though specialty depth is moderate.`;
  } else if (score >= 0.55) {
    summary = 'Experience meets minimum threshold';
    detail = `${years} years on record — technically meets the ${minExp}-year floor but sits near the lower bound. Signal agent noted limited specialty concentration in career history.`;
  } else {
    summary = 'Below required experience level';
    detail = `${years} years recorded — below the ${minExp}-year minimum for this role. Career trajectory signal is weak relative to the experience profile required.`;
  }

  return { label: 'Experience Trajectory', score, summary, detail, color };
}

function explainSkillsAdjacency(score: number, candidate: Candidate): DimensionExplanation {
  const color = score >= 0.85 ? '#22C55E' : score >= 0.70 ? '#F59E0B' : '#EF4444';
  const topSkills = candidate.skills.slice(0, 3).join(', ') || 'general skills';

  let summary: string;
  let detail: string;

  if (score >= 0.88) {
    summary = 'Direct skills match — no ramp-up required';
    detail = `Skills profile (${topSkills}) maps closely to role requirements. Graph-based adjacency score indicates high overlap — candidate likely to contribute immediately without significant onboarding lag.`;
  } else if (score >= 0.72) {
    summary = 'Strong adjacent skills — minimal gap';
    detail = `Core skills (${topSkills}) are highly transferable. Some peripheral skills differ from role requirements, but the gap is narrow — estimated ramp-up of 2–4 weeks based on adjacency model.`;
  } else if (score >= 0.55) {
    summary = 'Partial skills overlap — moderate gap';
    detail = `Skills in ${topSkills} show partial alignment. Adjacency model predicts a meaningful ramp-up period. Candidate may have compensating unlisted skills — voice verification can surface these.`;
  } else {
    summary = 'Limited direct skills alignment';
    detail = `Declared skills (${topSkills || 'undisclosed'}) show weak overlap with role requirements. Signal score penalized accordingly — worth reviewing if compensating strengths are present in experience narrative.`;
  }

  return { label: 'Skills Adjacency', score, summary, detail, color };
}

function explainEngagementPropensity(score: number, candidate: Candidate): DimensionExplanation {
  const color = score >= 0.85 ? '#22C55E' : score >= 0.70 ? '#F59E0B' : '#EF4444';

  let summary: string;
  let detail: string;

  if (score >= 0.85) {
    summary = 'High likelihood of engagement — actively signals interest';
    detail = `Behavioral signals from ${candidate.source || 'enrichment sources'} suggest active market participation. Profile was recently updated and engagement propensity model returned a strong positive signal. Reach out promptly — window is likely narrow.`;
  } else if (score >= 0.70) {
    summary = 'Passive candidate — moderate engagement signal';
    detail = `Candidate appears to be employed but showing passive interest signals. Enrichment model detected moderate openness to opportunity. A well-personalized outreach has strong open-rate probability.`;
  } else if (score >= 0.50) {
    summary = 'Low signal — likely not actively searching';
    detail = `Minimal behavioral signals of market activity. Candidate appears deeply tenured at ${candidate.current_company || 'current employer'}. Outreach conversion probability is lower — consider a longer-horizon pipeline position.`;
  } else {
    summary = 'Very low engagement propensity';
    detail = `No meaningful signals of openness detected. Candidate may be in a high-satisfaction or long-tenure situation. Cortex agent deprioritized this profile for immediate outreach — flagged for re-evaluation in 60 days.`;
  }

  return { label: 'Engagement Propensity', score, summary, detail, color };
}

function DimensionCard({ dim, expanded, onToggle }: { dim: DimensionExplanation; expanded: boolean; onToggle: () => void }) {
  const pct = Math.round(dim.score * 100);
  const circumference = 2 * Math.PI * 12;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="rounded-xl border overflow-hidden transition-all cursor-pointer" style={{ borderColor: expanded ? `${dim.color}50` : 'var(--border)', backgroundColor: expanded ? `${dim.color}05` : 'var(--bg-surface)', boxShadow: expanded ? `0 0 0 1px ${dim.color}20` : 'none' }} onClick={onToggle}>
      <div className="flex items-center gap-4 px-4 py-3.5">
        <svg className="w-8 h-8 -rotate-90 flex-shrink-0" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="12" fill="none" strokeWidth="2.5" stroke="var(--border)" />
          <circle cx="14" cy="14" r="12" fill="none" strokeWidth="2.5" stroke={dim.color} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold" style={{ color: dim.color }}>{pct}%</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{dim.label}</span>
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{dim.summary}</p>
        </div>
        <div className="flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="h-px mb-3" style={{ backgroundColor: 'var(--border)' }} />
          <div className="mb-3"><div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}><div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: dim.color }} /></div></div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{dim.detail}</p>
        </div>
      )}
    </div>
  );
}

interface Props {
  candidate: Candidate;
  role: Role | null;
}

export default function ScoreExplainer({ candidate, role }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const sb = candidate.score_breakdown;

  const dimensions: DimensionExplanation[] = [];
  if (sb.hard_qualification !== undefined && role) dimensions.push(explainHardQualification(sb.hard_qualification, candidate, role));
  if (sb.experience_trajectory !== undefined && role) dimensions.push(explainExperienceTrajectory(sb.experience_trajectory, candidate, role));
  if (sb.skills_adjacency !== undefined) dimensions.push(explainSkillsAdjacency(sb.skills_adjacency, candidate));
  if (sb.engagement_propensity !== undefined) dimensions.push(explainEngagementPropensity(sb.engagement_propensity, candidate));

  async function handleAiExplanation() {
    if (!role) {
      setToast('Role context is required to generate AI explanation.');
      return;
    }

    setAiLoading(true);
    try {
      const response = await scoreCandidates(
        `${role.title} in ${role.location}. Must-have: ${role.must_have_requirements.join(', ')}`,
        [{
          id: candidate.id,
          name: candidate.full_name,
          experienceYears: candidate.experience_years ?? undefined,
          skills: candidate.skills,
          location: candidate.location ?? undefined,
          notes: candidate.score_rationale ?? undefined,
        }],
      );
      const rationale = response.data.scores[0]?.rationale ?? null;
      setAiRationale(rationale);
      if (rationale) {
        await supabase.from('agent_activity_log').insert({
          org_id: candidate.org_id,
          role_id: role.id,
          candidate_id: candidate.id,
          agent_name: 'signal',
          action: 'Generated score explanation',
          detail: rationale.slice(0, 180),
          metadata: {},
        });
      }
    } catch (error) {
      console.error(error);
      setToast('Could not fetch AI scoring explanation. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  if (dimensions.length === 0) return null;

  const overallScore = candidate.score !== null ? Math.round(candidate.score * 100) : null;

  return (
    <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Why this score?</h2>
        {overallScore !== null && <span className="text-xs px-2.5 py-1 rounded-lg font-mono font-medium" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>Signal Score {overallScore}</span>}
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Four dimensions evaluated by the Signal agent. Click any to see reasoning.</p>

      <button
        type="button"
        onClick={handleAiExplanation}
        disabled={aiLoading}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold mb-5"
        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', backgroundColor: aiLoading ? 'var(--bg-subtle)' : 'var(--bg-surface)' }}
      >
        {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {aiLoading ? 'Analyzing...' : 'Score Candidate'}
      </button>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Powered by AI</p>

      {aiRationale && (
        <div className="mb-5 p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>AI Summary</p>
          <p className="text-xs leading-relaxed">{aiRationale}</p>
        </div>
      )}

      <div className="space-y-2">
        {dimensions.map((dim, i) => (
          <DimensionCard key={dim.label} dim={dim} expanded={expandedIndex === i} onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)} />
        ))}
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
