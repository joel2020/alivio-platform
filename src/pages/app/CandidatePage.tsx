import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Sparkles, RefreshCw, CheckCircle, Mic, Clock, MessageSquare } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Candidate, VoiceCall, VoiceTranscript, AgentActivityLog, CandidateFeedback, PipelineStage, Role } from '../../lib/types';
import { AGENT_COLORS, PIPELINE_STAGES, STAGE_LABELS } from '../../lib/types';
import ScoreExplainer from '../../components/app/ScoreExplainer';
import { generateOutreachEmail, scoreCandidate, type ParsedResumeOutput } from '../../lib/ai';
import Toast from '../../components/app/Toast';
import ResumeUpload from '../../components/app/ResumeUpload';

function ScoreRing({ score }: { score: number }) {
  const pct = score * 100;
  const color = score >= 0.85 ? 'var(--success)' : score >= 0.70 ? 'var(--warning)' : 'var(--error)';
  const staticColor = score >= 0.85 ? '#22c55e' : score >= 0.70 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div
      className="relative w-16 h-16 rounded-full flex-shrink-0"
      style={{ backgroundColor: `${staticColor}10` }}
    >
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="20" fill="none" strokeWidth="2.5" stroke="var(--border)" />
        <circle cx="22" cy="22" r="20" fill="none" strokeWidth="2.5" stroke={color} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{pct.toFixed(0)}</span>
    </div>
  );
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface GeneratedOutreach {
  subject: string;
  body: string;
  signals: string[];
  variant: number;
}

interface ExtractedData {
  credentials?: Record<string, { status?: string; detail?: string }>;
  availability?: Record<string, string | number | boolean>;
  compensation?: Record<string, string | number | boolean>;
}
interface VoiceSummary {
  summary?: string;
  interest_level?: string;
  availability?: string;
  compensation_expectations?: string;
  candidate_signals?: string[];
}

interface ResumeFileRow {
  id: string;
  candidate_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

interface ResumeParseJobRow {
  id: string;
  candidate_id: string;
  status: string;
  parsed_data: ParsedResumeOutput;
  created_at: string;
}

function AIScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>AI score pending</span>;
  }

  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)';
  const bg = score >= 80 ? 'var(--success-subtle)' : score >= 60 ? 'var(--warning-subtle)' : 'var(--error-subtle)';

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold" style={{ color, backgroundColor: bg }}>
      AI Score {score}
    </span>
  );
}

function OutreachTab({ candidate, role }: { candidate: Candidate; role: Role | null }) {
  const [generated, setGenerated] = useState<GeneratedOutreach | null>(null);
  const [generating, setGenerating] = useState(false);
  const [displayedBody, setDisplayedBody] = useState('');
  const [variant, setVariant] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSent = candidate.pipeline_stage === 'engaged' || candidate.pipeline_stage === 'responded';

  async function generate(nextVariant = variant) {
    setGenerating(true);
    setGenerated(null);
    setDisplayedBody('');
    setError(null);
    setApproved(false);
    if (typingRef.current) clearInterval(typingRef.current);

    try {
      if (!isSupabaseConfigured) throw new Error('Supabase env missing');
      const result = await generateOutreachEmail(
        {
          id: candidate.id,
          name: candidate.full_name,
          skills: candidate.skills,
          experienceYears: candidate.experience_years ?? undefined,
          location: candidate.location ?? undefined,
          notes: candidate.current_title ?? undefined,
        },
        role?.title ?? 'Open role',
        (role?.outreach_tone ?? 'conversational') as 'professional' | 'conversational' | 'direct',
      );
      const data: GeneratedOutreach = {
        subject: result.data.subject,
        body: result.data.body,
        signals: result.data.personalizationSignals,
        variant: nextVariant,
      };
      setGenerated(data);
      setVariant(nextVariant);

      let i = 0;
      typingRef.current = setInterval(() => {
        i += 3;
        setDisplayedBody(data.body.slice(0, i));
        if (i >= data.body.length) {
          setDisplayedBody(data.body);
          if (typingRef.current) clearInterval(typingRef.current);
        }
      }, 12);
    } catch {
      setError('Could not generate outreach. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  function handleRegenerate() {
    const next = (variant + 1) % 4;
    generate(next);
  }

  if (isSent && !generated) {
    return (
      <div className="space-y-4">
        <div
          className="p-5 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Outreach Message</h2>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium badge-success">Sent</span>
          </div>
          <div className="mb-3">
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Subject</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {role ? `${candidate.full_name.split(' ')[0]}, your background stood out for ${role.title}` : 'An opportunity that matched your profile'}
            </p>
          </div>
          <div
            className="p-4 rounded-xl border-l-4 text-sm"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--accent)', color: 'var(--text-secondary)', lineHeight: '1.8' }}
          >
            Hi {candidate.full_name.split(' ')[0]},<br /><br />
            I came across your background and wanted to reach out directly. Your experience as {candidate.current_title} at {candidate.current_company} — particularly your work in {candidate.skills.slice(0, 2).join(' and ')} — is a strong match for a role we're currently hiring for.<br /><br />
            {role ? `We're looking for a ${role.title} in ${role.location}. The role offers ${role.compensation_min ? `$${(role.compensation_min / 1000).toFixed(0)}K–$${(role.compensation_max! / 1000).toFixed(0)}K annually` : 'competitive compensation'}.` : ''}<br /><br />
            Would you be open to a brief conversation to learn more?
          </div>
          {candidate.pipeline_stage === 'responded' && (
            <div
              className="mt-4 p-3 rounded-lg border-l-4"
              style={{ backgroundColor: 'var(--success-subtle)', borderColor: 'var(--success)' }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--success)' }}>Candidate responded</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>"{candidate.full_name.split(' ')[0]} replied expressing interest. Follow-up scheduled."</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!generated && !generating && (
        <div
          className="p-8 rounded-xl border text-center"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <div
            className="w-11 h-11 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-subtle)' }}
          >
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Generate personalized outreach</p>
          <p className="text-xs mb-5 leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            Engage will craft a message tailored to {candidate.full_name.split(' ')[0]}'s background,
            skills, and engagement signals — personalized to the role.
          </p>
          <button
            onClick={() => generate(0)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
          >
            <Sparkles size={14} />
            Generate with Engage Agent
          </button>
        </div>
      )}

      {generating && (
        <div
          className="p-8 rounded-xl border text-center"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Engage agent analyzing profile signals...
          </p>
        </div>
      )}

      {error && (
        <div
          className="p-4 rounded-xl border-l-4"
          style={{ backgroundColor: 'var(--error-subtle)', borderColor: 'var(--error)' }}
        >
          <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
        </div>
      )}

      {generated && !generating && (
        <div
          className="p-5 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Outreach Message</h2>
            <div className="flex items-center gap-2">
              {approved && (
                <span className="flex items-center gap-1 text-xs font-medium badge-success px-2 py-0.5 rounded-md">
                  <CheckCircle size={12} /> Approved
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-md font-medium badge-neutral">
                Variant {variant + 1}
              </span>
            </div>
          </div>

          {generated.signals.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {generated.signals.map((sig, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full badge-neutral font-medium">
                  {sig}
                </span>
              ))}
            </div>
          )}

          <div className="mb-3">
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Subject</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{generated.subject}</p>
          </div>

          <div
            className="p-4 rounded-xl border-l-4 text-sm"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--accent)',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              minHeight: '120px',
            }}
          >
            {displayedBody}
            {displayedBody.length < generated.body.length && (
              <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle" style={{ backgroundColor: 'var(--accent)' }} />
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setApproved(true)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all"
              style={{ backgroundColor: approved ? 'var(--success)' : 'var(--accent)' }}
            >
              {approved ? 'Approved' : 'Approve & Send'}
            </button>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border font-medium transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <RefreshCw size={11} /> Regenerate
            </button>
            <button
              className="px-3 py-2 rounded-lg text-xs border font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              Edit
            </button>
            <button
              className="px-3 py-2 rounded-lg text-xs border font-medium ml-auto"
              style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VoiceEmptyState({ candidate }: { candidate: Candidate }) {
  const stages: PipelineStage[] = ['discovered', 'scored'];
  const isEarly = stages.includes(candidate.pipeline_stage);

  return (
    <div className="py-20 text-center">
      <div
        className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
      >
        {isEarly ? (
          <Clock size={20} style={{ color: 'var(--text-muted)' }} />
        ) : (
          <Mic size={20} style={{ color: 'var(--success)' }} />
        )}
      </div>
      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {isEarly ? 'Voice call not yet initiated' : 'Call queued'}
      </p>
      <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
        {isEarly
          ? `${candidate.full_name.split(' ')[0]} needs to reach the voice qualification score threshold before the Voice agent initiates contact.`
          : 'Voice agent will attempt contact during the next calling window. Typically within 2–4 hours.'}
      </p>
      <div
        className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isEarly ? 'var(--border-strong)' : 'var(--success)' }} />
        {isEarly ? 'Awaiting score threshold' : 'Call window: 9am – 6pm local'}
      </div>
    </div>
  );
}

export default function CandidatePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'voice' | 'outreach' | 'activity'>('overview');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [transcript, setTranscript] = useState<VoiceTranscript | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<AgentActivityLog[]>([]);
  const [feedback, setFeedback] = useState<CandidateFeedback[]>([]);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackStage, setFeedbackStage] = useState<'screened' | 'interviewed' | 'rejected' | 'hired'>('screened');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<VoiceSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<ResumeFileRow | null>(null);
  const [resumeParseJob, setResumeParseJob] = useState<ResumeParseJobRow | null>(null);
  const [showParsedData, setShowParsedData] = useState(false);
  const [showReplaceResume, setShowReplaceResume] = useState(false);
  const [rescoring, setRescoring] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [startingCall, setStartingCall] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!selectedCallId) return;
    setTranscriptLoading(true);
    setTranscriptError(null);
    supabase
      .from('voice_transcripts')
      .select('*')
      .eq('call_id', selectedCallId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setTranscriptError(error.message);
          return;
        }
        setTranscript(data);
      })
      .then(() => setTranscriptLoading(false));
  }, [selectedCallId]);

  useEffect(() => {
    if (!transcript?.entries?.length) {
      setAiSummary(null);
      return;
    }
    if (!selectedCallId) return;

    const cachedSummary = calls.find((call) => call.id === selectedCallId)?.ai_summary as VoiceSummary | null;
    if (cachedSummary) {
      setAiSummary(cachedSummary);
      setSummaryError(null);
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);
    setSummaryError(null);
    supabase.functions
      .invoke<{ data?: VoiceSummary; error?: string }>('ai-voice-summary', {
        body: {
          callId: selectedCallId,
          transcriptEntries: transcript.entries,
        },
      })
      .then(({ data, error }) => {
        if (error) {
          setSummaryError(error.message);
          return;
        }
        if (!data?.data) {
          setSummaryError(data?.error ?? 'AI summary unavailable.');
          return;
        }
        setAiSummary(data.data);
        setCalls((current) => current.map((call) => (
          call.id === selectedCallId ? { ...call, ai_summary: data.data } : call
        )));
      })
      .finally(() => setSummaryLoading(false));
  }, [transcript, calls, selectedCallId]);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    setUnauthorized(false);
    try {
      const [candRes, callsRes, logsRes, feedRes, resumeFileRes, resumeJobRes] = await Promise.all([
        supabase.from('candidates').select('*').eq('id', id).single(),
        supabase.from('voice_calls').select('*').eq('candidate_id', id).order('created_at', { ascending: false }),
        supabase.from('agent_activity_log').select('*').eq('candidate_id', id).order('created_at', { ascending: false }),
        supabase.from('candidate_feedback').select('*').eq('candidate_id', id).order('created_at', { ascending: false }),
        supabase.from('resume_files').select('*').eq('candidate_id', id).order('uploaded_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('resume_parse_jobs').select('*').eq('candidate_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const err = candRes.error || callsRes.error || logsRes.error || feedRes.error || resumeFileRes.error || resumeJobRes.error;
      if (err) {
        const authError = /jwt|permission|not authenticated|forbidden|auth/i.test(err.message);
        if (authError) setUnauthorized(true);
        else setLoadError(err.message);
        return;
      }

      const cand = candRes.data;
      setCandidate(cand);
      setCalls(callsRes.data || []);
      setActivityLog(logsRes.data || []);
      setFeedback(feedRes.data || []);
      setResumeFile((resumeFileRes.data as ResumeFileRow | null) ?? null);
      setResumeParseJob((resumeJobRes.data as ResumeParseJobRow | null) ?? null);
      if (callsRes.data && callsRes.data.length > 0) setSelectedCallId(callsRes.data[0].id);

      if (cand?.role_id) {
        const { data: roleData, error: roleError } = await supabase.from('roles').select('*').eq('id', cand.role_id).single();
        if (roleError) {
          setLoadError(roleError.message);
          return;
        }
        setRole(roleData);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id, loadData]);

  async function advanceStage(newStage: PipelineStage) {
    if (!candidate) return;
    await supabase.from('candidates').update({ pipeline_stage: newStage }).eq('id', candidate.id);
    setCandidate({ ...candidate, pipeline_stage: newStage });
  }

  async function submitFeedback() {
    if (!user || !candidate) return;
    setFeedbackSubmitting(true);
    setFeedbackError(null);
    const { data, error } = await supabase
      .from('candidate_feedback')
      .insert({
        candidate_id: candidate.id,
        role_id: candidate.role_id,
        user_id: user.id,
        org_id: user.org_id,
        rating: feedbackRating,
        stage: feedbackStage,
        notes: feedbackNote || null,
      })
      .select()
      .single();
    if (error) {
      setFeedbackError(error.message);
      setFeedbackSubmitting(false);
      return;
    }
    if (data) setFeedback([data, ...feedback]);
    setFeedbackNote('');
    setFeedbackStage('screened');
    setFeedbackRating(5);
    setFeedbackModalOpen(false);
    setFeedbackSubmitting(false);
  }

  async function startVoiceCall() {
    if (!candidate || !role || !user?.org_id) return;
    setStartingCall(true);
    setLoadError(null);
    const attempt = calls.length + 1;

    const { data: callRow, error: callError } = await supabase
      .from('voice_calls')
      .insert({
        org_id: user.org_id,
        role_id: role.id,
        candidate_id: candidate.id,
        status: 'initiated',
        call_type: 'outbound',
        attempt_number: attempt,
        provider: 'manual',
        started_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (callError || !callRow) {
      setToast(`Unable to start call: ${callError?.message ?? 'Unknown error'}`);
      setStartingCall(false);
      return;
    }

    const { error: transcriptInsertError } = await supabase
      .from('voice_transcripts')
      .insert({
        call_id: callRow.id,
        entries: [],
      });

    if (transcriptInsertError) {
      setToast(`Call created, but transcript initialization failed: ${transcriptInsertError.message}`);
    } else {
      setToast('Voice call initiated and logged.');
    }

    setCalls((current) => [callRow as VoiceCall, ...current]);
    setSelectedCallId(callRow.id);
    setStartingCall(false);
  }

  function handleResumeParsed(parsed: ParsedResumeOutput) {
    if (!candidate) return;
    setCandidate({
      ...candidate,
      skills: parsed.skills.length > 0 ? parsed.skills : candidate.skills,
      experience_years: parsed.yearsExperience ?? candidate.experience_years,
      current_title: candidate.current_title || parsed.recentRoles[0]?.title || candidate.current_title,
      full_name: candidate.full_name || parsed.fullName || candidate.full_name,
      email: candidate.email || parsed.email,
      phone: candidate.phone || parsed.phone,
      location: candidate.location || parsed.location,
    });
    setShowReplaceResume(false);
    setShowParsedData(false);
    setToast('Resume parsed and candidate profile updated');
    void loadData();
  }

  async function handleRescore() {
    if (!candidate?.role_id) {
      setToast('Unable to re-score candidate because role is missing.');
      return;
    }

    setRescoring(true);
    try {
      await scoreCandidate(candidate.id, candidate.role_id);
      await loadData();
      setToast('Candidate re-scored successfully.');
    } catch (error) {
      setToast(error instanceof Error ? `AI re-score failed: ${error.message}` : 'AI re-score failed.');
    } finally {
      setRescoring(false);
    }
  }

  const selectedCall = calls.find(c => c.id === selectedCallId) || null;
  const extractedData = selectedCall?.extracted_data as ExtractedData | null;
  const filteredEntries = transcript?.entries.filter(e =>
    !transcriptSearch || e.text.toLowerCase().includes(transcriptSearch.toLowerCase())
  ) || [];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );

  if (unauthorized) return (
    <div className="p-8">
      <div className="card p-4" style={{ color: 'var(--text-secondary)' }}>
        Your session does not have access to this candidate. Please sign in again.
      </div>
    </div>
  );

  if (loadError) return (
    <div className="p-8">
      <div className="card p-4" style={{ color: 'var(--text-secondary)' }}>
        We could not load this candidate right now. {loadError}
      </div>
    </div>
  );

  if (!candidate) return <div className="p-8" style={{ color: 'var(--text-primary)' }}>Candidate not found</div>;

  const nextStages = PIPELINE_STAGES.filter(s => s !== candidate.pipeline_stage && s !== 'archived');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div
        className="page-header"
        style={{ height: 'auto', padding: '14px 24px', alignItems: 'flex-start', flexDirection: 'column', gap: '0' }}
      >
        <Link
          to={role ? `/roles/${role.id}/pipeline` : '/dashboard'}
          className="inline-flex items-center gap-1 mb-3 hover:underline"
          style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', textDecoration: 'none' }}
        >
          <ArrowLeft size={12} /> Back to pipeline
        </Link>
        <div className="flex items-start justify-between gap-6 w-full">
          <div className="flex items-start gap-4">
            {candidate.score !== null && <ScoreRing score={candidate.score} />}
            <div>
              <h1
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                {candidate.full_name}
              </h1>
              {(candidate.current_title || candidate.current_company) && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  {candidate.current_title}{candidate.current_company ? ` · ${candidate.current_company}` : ''}
                </p>
              )}
              {candidate.location && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {candidate.location}
                </p>
              )}
              <div className="mt-2.5 flex items-center gap-2">
                <span className="badge badge-accent">
                  {STAGE_LABELS[candidate.pipeline_stage]}
                </span>
                <AIScoreBadge score={candidate.ai_score} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to={`/outreach?candidateId=${candidate.id}`}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '5px 11px' }}
            >
              Start Outreach
            </Link>
            <div className="relative">
              <select
                onChange={e => advanceStage(e.target.value as PipelineStage)}
                className="btn-secondary appearance-none pr-7 cursor-pointer"
                style={{ fontSize: '0.75rem', padding: '5px 28px 5px 11px' }}
                value=""
              >
                <option value="" disabled>Advance stage</option>
                {nextStages.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
              <ChevronDown
                size={11}
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
            <button
              onClick={handleRescore}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '5px 11px' }}
              disabled={rescoring}
            >
              {rescoring ? 'Re-scoring...' : 'Re-score'}
            </button>
            <button
              onClick={() => advanceStage('archived')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '5px 11px', borderColor: 'var(--error)', color: 'var(--error)' }}
            >
              Archive
            </button>
          </div>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex" style={{ padding: '0 24px' }}>
          {(['overview', 'voice', 'outreach', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 16px',
                fontSize: '0.8125rem',
                fontWeight: activeTab === tab ? 600 : 500,
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                background: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {tab}
              {tab === 'voice' && calls.length > 0 && (
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: activeTab === tab ? 'var(--accent)' : 'var(--bg-subtle)',
                    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {calls.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content max-w-3xl">
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {candidate.score !== null && (
              <ScoreExplainer candidate={candidate} role={role} />
            )}

            <div
              className="p-6 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Candidate Fit</h2>
                <AIScoreBadge score={candidate.ai_score} />
              </div>
              {candidate.ai_summary ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Top strengths</p>
                    {candidate.ai_summary.top_strengths?.length ? (
                      <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
                        {candidate.ai_summary.top_strengths.map((strength) => <li key={strength}>{strength}</li>)}
                      </ul>
                    ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No strengths provided yet.</p>}
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Gaps</p>
                    {candidate.ai_summary.gaps?.length ? (
                      <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
                        {candidate.ai_summary.gaps.map((gap) => <li key={gap}>{gap}</li>)}
                      </ul>
                    ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No gaps provided yet.</p>}
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Recommendation</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {candidate.ai_summary.recommendation || 'No recommendation provided yet.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Confidence:</span>
                    <span className="text-xs px-2 py-1 rounded-md badge-neutral">
                      {(candidate.ai_summary.confidence || 'low').toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  AI breakdown is not available yet. Upload a resume or click Re-score.
                </p>
              )}
            </div>

            <div
              className="p-6 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Resume</h3>
                {!resumeFile || showReplaceResume ? (
                  <ResumeUpload
                    candidateId={candidate.id}
                    accountId={candidate.org_id}
                    onParsed={handleResumeParsed}
                  />
                ) : (
                  <div
                    className="rounded-xl border p-4"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {resumeFile.file_name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Uploaded {new Date(resumeFile.uploaded_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Size: {(resumeFile.file_size / (1024 * 1024)).toFixed(2)} MB
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg text-xs border font-medium"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        onClick={() => setShowParsedData((current) => !current)}
                      >
                        {showParsedData ? 'Hide parsed data' : 'View parsed data'}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-surface)' }}
                        onClick={() => setShowReplaceResume(true)}
                      >
                        Replace resume
                      </button>
                    </div>

                    {showParsedData && (
                      <pre
                        className="mt-3 p-3 rounded-lg text-xs overflow-x-auto"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {JSON.stringify(resumeParseJob?.parsed_data ?? { message: 'No parsed data available yet.' }, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Profile</h2>
              <div className="space-y-4">
                {candidate.experience_years !== null && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Experience</span>
                    <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {candidate.current_title} at {candidate.current_company} ({candidate.experience_years} years)
                    </p>
                  </div>
                )}
                {candidate.education && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Education</span>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{candidate.education}</p>
                  </div>
                )}
                {candidate.licenses.length > 0 && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Licenses</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {candidate.licenses.map(l => (
                        <span key={l} className="text-xs px-2.5 py-1 rounded-md font-medium badge-success">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.certifications.length > 0 && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Certifications</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {candidate.certifications.map(c => (
                        <span key={c} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.skills.length > 0 && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Skills</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {candidate.skills.map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-md badge-neutral">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.source && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Source</span>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{candidate.source}</p>
                  </div>
                )}
              </div>
            </div>

            {candidate.archived_reason && (
              <div
                className="p-4 rounded-xl border-l-4"
                style={{ backgroundColor: 'var(--error-subtle)', borderColor: 'var(--error)' }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--error)' }}>Archived Reason</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{candidate.archived_reason}</p>
              </div>
            )}

            <div
              className="p-6 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Candidate Feedback</h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Capture stage, rating, and notes from call reviews.</p>
                </div>
                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <MessageSquare size={14} />
                  Leave Feedback
                </button>
              </div>
              {feedback.length > 0 && (
                <div className="mt-5 pt-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
                  {feedback.map(f => (
                    <div key={f.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>{f.stage}</p>
                        <p className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>{'★'.repeat(Math.max(1, Math.min(5, f.rating)))}</p>
                      </div>
                      <div>
                        {f.notes && <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{f.notes}</p>}
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(f.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-5">
            {calls.length === 0 ? (
              <VoiceEmptyState candidate={candidate} />
            ) : (
              <>
                {calls.length > 1 && (
                  <div className="flex items-center gap-2">
                    {calls.map((call, i) => (
                      <button
                        key={call.id}
                        onClick={() => setSelectedCallId(call.id)}
                        className="px-3 py-1.5 rounded-lg text-xs border font-medium transition-all"
                        style={{
                          borderColor: selectedCallId === call.id ? 'var(--accent)' : 'var(--border)',
                          color: selectedCallId === call.id ? 'var(--accent)' : 'var(--text-muted)',
                          backgroundColor: selectedCallId === call.id ? 'var(--accent-subtle)' : 'transparent',
                        }}
                      >
                        Attempt {i + 1}
                      </button>
                    ))}
                  </div>
                )}

                {selectedCall && (
                  <>
                    <div
                      className="p-5 rounded-xl border"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Call Summary</h2>
                        {selectedCall.qualification_status && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                            backgroundColor: selectedCall.qualification_status === 'qualified' ? 'var(--success-subtle)' : selectedCall.qualification_status === 'disqualified' ? 'var(--error-subtle)' : 'var(--warning-subtle)',
                            color: selectedCall.qualification_status === 'qualified' ? 'var(--success)' : selectedCall.qualification_status === 'disqualified' ? 'var(--error)' : 'var(--warning)',
                          }}>
                            {selectedCall.qualification_status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {selectedCall.started_at && <div><p className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Date</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{new Date(selectedCall.started_at).toLocaleDateString()}</p></div>}
                        {selectedCall.duration_seconds && <div><p className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Duration</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDuration(selectedCall.duration_seconds)}</p></div>}
                        <div><p className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Type</p><p className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{selectedCall.call_type}</p></div>
                        <div><p className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Attempt</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedCall.attempt_number}</p></div>
                      </div>
                      {selectedCall.escalated && selectedCall.escalation_reason && (
                        <div className="p-3 rounded-lg border-l-4" style={{ backgroundColor: 'var(--warning-subtle)', borderColor: 'var(--warning)' }}>
                          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--warning)' }}>Escalated</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedCall.escalation_reason}</p>
                          {selectedCall.escalated_to && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>To: {selectedCall.escalated_to}</p>}
                        </div>
                      )}
                      {selectedCall.call_summary && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Summary</p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{selectedCall.call_summary}</p>
                        </div>
                      )}
                    </div>

                    {extractedData && selectedCall.status === 'completed' && (
                      <div
                        className="p-5 rounded-xl border"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
                      >
                        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Extracted Data</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          {extractedData.credentials && (
                            <div>
                              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Credential Verification</p>
                              <div className="space-y-2">
                                {Object.entries(extractedData.credentials).map(([key, val]) => {
                                  const icon = val.status === 'confirmed' ? '✓' : val.status === 'unclear' ? '?' : '✗';
                                  const color = val.status === 'confirmed' ? 'var(--success)' : val.status === 'unclear' ? 'var(--warning)' : 'var(--error)';
                                  return (
                                    <div key={key} className="flex items-start gap-2">
                                      <span className="text-xs font-bold mt-0.5" style={{ color }}>{icon}</span>
                                      <div>
                                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{key.replace(/_/g, ' ').toUpperCase()}</span>
                                        {val.detail && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{val.detail}</p>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div className="space-y-4">
                            {extractedData.availability && (
                              <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Availability</p>
                                <div className="space-y-1">
                                  {Object.entries(extractedData.availability).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                      <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{k.replace(/_/g, ' ')}</span>
                                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {extractedData.compensation && (
                              <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Compensation</p>
                                <div className="space-y-1">
                                  {Object.entries(extractedData.compensation).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                      <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{k.replace(/_/g, ' ')}</span>
                                      <span className="text-xs font-medium" style={{ color: v === 'within_range' ? 'var(--success)' : v === 'above_range' ? 'var(--error)' : 'var(--text-secondary)' }}>{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {transcriptLoading && (
                      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <div className="skeleton h-4 w-40 mb-3" />
                        <div className="skeleton h-3 w-full mb-2" />
                        <div className="skeleton h-3 w-5/6 mb-2" />
                        <div className="skeleton h-3 w-2/3" />
                      </div>
                    )}

                    {!transcriptLoading && !transcript && !transcriptError && (
                      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Transcript processing...</p>
                      </div>
                    )}

                    {transcriptError && (
                      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--error)' }}>
                        <p className="text-sm" style={{ color: 'var(--error)' }}>Could not load transcript: {transcriptError}</p>
                      </div>
                    )}

                    {transcript && (
                      <div
                        className="p-5 rounded-xl border"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
                      >
                        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Transcript</h2>
                        <input
                          value={transcriptSearch}
                          onChange={e => setTranscriptSearch(e.target.value)}
                          placeholder="Search transcript..."
                          className="input-base w-full px-3 py-2 text-sm mb-4"
                        />
                        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                          {filteredEntries.map((entry, i) => (
                            <div key={i} className={`flex ${entry.speaker === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-xs md:max-w-md">
                                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                                  {entry.speaker === 'voice_agent' ? 'AI Agent' : candidate.full_name.split(' ')[0]} · {entry.timestamp}
                                </p>
                                <div
                                  className="p-3 rounded-xl text-sm"
                                  style={{
                                    backgroundColor: entry.speaker === 'voice_agent' ? 'var(--bg-subtle)' : 'var(--accent-subtle)',
                                    color: 'var(--text-primary)',
                                    lineHeight: '1.6',
                                    border: `1px solid ${entry.speaker === 'voice_agent' ? 'var(--border)' : 'var(--accent-border)'}`,
                                  }}
                                >
                                  {entry.text}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>AI Summary & Candidate Signals</h3>
                          {summaryLoading && (
                            <div>
                              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Generating summary...</p>
                              <div className="skeleton h-4 w-full mb-2" />
                              <div className="skeleton h-4 w-4/5 mb-2" />
                              <div className="skeleton h-4 w-2/3" />
                            </div>
                          )}
                          {summaryError && <p className="text-sm" style={{ color: 'var(--error)' }}>{summaryError}</p>}
                          {aiSummary && (
                            <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                                {aiSummary.summary ?? 'Summary unavailable.'}
                              </p>
                              <div className="grid md:grid-cols-3 gap-3 text-xs">
                                <div><p style={{ color: 'var(--text-muted)' }}>Interest level</p><p style={{ color: 'var(--text-primary)' }}>{aiSummary.interest_level ?? 'N/A'}</p></div>
                                <div><p style={{ color: 'var(--text-muted)' }}>Availability</p><p style={{ color: 'var(--text-primary)' }}>{aiSummary.availability ?? 'N/A'}</p></div>
                                <div><p style={{ color: 'var(--text-muted)' }}>Compensation</p><p style={{ color: 'var(--text-primary)' }}>{aiSummary.compensation_expectations ?? 'N/A'}</p></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'outreach' && (
          <OutreachTab candidate={candidate} role={role} />
        )}

        {activeTab === 'activity' && (
          <div>
            {activityLog.length === 0 && feedback.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No activity yet</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Agent actions for this candidate will appear here as they run.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {feedback.map((item) => (
                  <div
                    key={`feedback-${item.id}`}
                    className="flex items-start gap-3 p-4 rounded-xl border transition-theme"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 text-white" style={{ backgroundColor: 'var(--accent)' }}>
                      FB
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                          Feedback · {item.stage}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--warning)' }}>{'★'.repeat(Math.max(1, Math.min(5, item.rating)))}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(item.created_at)}</span>
                      </div>
                      {item.notes && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.notes}</p>}
                    </div>
                  </div>
                ))}
                {activityLog.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-4 rounded-xl border transition-theme"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 text-white"
                      style={{ backgroundColor: AGENT_COLORS[log.agent_name] }}
                    >
                      {log.agent_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{log.agent_name}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(log.created_at)}</span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{log.action}</p>
                      {log.detail && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{log.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-lg rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Leave Feedback</h3>
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Rating</label>
            <div className="flex items-center gap-1 mt-2 mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFeedbackRating(value)}
                  className="text-lg"
                  style={{ color: value <= feedbackRating ? 'var(--warning)' : 'var(--border-strong)' }}
                >
                  ★
                </button>
              ))}
            </div>
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Stage</label>
            <select
              value={feedbackStage}
              onChange={(event) => setFeedbackStage(event.target.value as 'screened' | 'interviewed' | 'rejected' | 'hired')}
              className="input-base w-full px-3 py-2 text-sm mt-2 mb-4"
            >
              <option value="screened">Screened</option>
              <option value="interviewed">Interviewed</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Notes</label>
            <textarea
              value={feedbackNote}
              onChange={(event) => setFeedbackNote(event.target.value)}
              placeholder="What did you learn from this conversation?"
              className="input-base w-full px-3 py-2 text-sm mt-2"
              rows={4}
            />
            {feedbackError && <p className="text-xs mt-2" style={{ color: 'var(--error)' }}>{feedbackError}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setFeedbackModalOpen(false)} className="btn-secondary">Cancel</button>
              <button
                type="button"
                onClick={() => void submitFeedback()}
                disabled={feedbackSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {feedbackSubmitting ? 'Saving...' : 'Submit feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'voice' && calls.length === 0 && (
        <button
          type="button"
          onClick={() => void startVoiceCall()}
          disabled={startingCall}
          className="fixed bottom-6 right-6 px-4 py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {startingCall ? 'Starting call…' : 'Initiate voice call'}
        </button>
      )}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
