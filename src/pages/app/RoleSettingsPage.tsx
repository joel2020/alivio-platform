import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Role, VoiceSettings } from '../../lib/types';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} className="w-9 h-5 rounded-full transition-all cursor-pointer relative flex-shrink-0" style={{ backgroundColor: value ? '#4F46E5' : '#1E1E1E' }}>
      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: value ? '18px' : '2px' }} />
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
  }
  return (
    <div className="min-h-10 flex flex-wrap gap-2 items-center p-2 rounded" style={{ backgroundColor: '#0A0A0A', border: '1px solid #1E1E1E' }}>
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ backgroundColor: '#1E1E1E', color: '#A0A0A0' }}>
          {tag}<button onClick={() => onChange(tags.filter(t => t !== tag))} style={{ color: '#6B6B6B' }}><X size={10} /></button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 min-w-16 text-sm text-white bg-transparent outline-none" />
    </div>
  );
}

export default function RoleSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'general' | 'scoring' | 'voice'>('general');
  const [role, setRole] = useState<Role | null>(null);
  const [vs, setVs] = useState<VoiceSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [weights, setWeights] = useState({ hard_qualification: 30, experience_trajectory: 25, skills_adjacency: 25, engagement_propensity: 20 });
  const [minScore, setMinScore] = useState(0.70);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    const [roleRes, vsRes] = await Promise.all([
      supabase.from('roles').select('*').eq('id', id).single(),
      supabase.from('voice_settings').select('*').eq('role_id', id).maybeSingle(),
    ]);
    setRole(roleRes.data);
    setVs(vsRes.data);
    setLoading(false);
  }

  async function saveGeneral() {
    if (!role) return;
    await supabase.from('roles').update({ title: role.title, location: role.location, remote: role.remote, employment_type: role.employment_type, experience_min: role.experience_min, experience_max: role.experience_max, compensation_min: role.compensation_min, compensation_max: role.compensation_max, description: role.description, must_have_requirements: role.must_have_requirements, nice_to_have_requirements: role.nice_to_have_requirements, target_candidate_volume: role.target_candidate_volume, outreach_tone: role.outreach_tone }).eq('id', role.id);
    showSaved();
  }

  async function saveVoice() {
    if (!vs || !id) return;
    await supabase.from('voice_settings').update({
      enabled: vs.enabled,
      score_threshold: vs.score_threshold,
      calling_window_start: vs.calling_window_start,
      calling_window_end: vs.calling_window_end,
      max_attempts: vs.max_attempts,
      retry_interval_hours: vs.retry_interval_hours,
      leave_voicemail: vs.leave_voicemail,
      auto_advance_qualified: vs.auto_advance_qualified,
      outreach_tone: vs.outreach_tone,
      verification_points: vs.verification_points,
      escalation_rules: vs.escalation_rules,
      disclosure_text: vs.disclosure_text,
      escalation_email: vs.escalation_email,
      escalation_slack_channel: vs.escalation_slack_channel,
    }).eq('role_id', id);
    showSaved();
  }

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
  const inputClass = "w-full px-3 py-2.5 rounded text-sm text-white outline-none";
  const inputStyle = { backgroundColor: '#0A0A0A', border: '1px solid #1E1E1E' };
  const labelClass = "block text-xs font-medium mb-1.5";
  const labelStyle = { color: '#A0A0A0' };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#4F46E5', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!role) return <div className="p-8 text-white">Role not found</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="border-b px-6 py-4" style={{ borderColor: '#1E1E1E' }}>
        <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#6B6B6B' }}>
          <Link to="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link to={`/roles/${id}/pipeline`}>{role.title}</Link>
          <span>/</span>
          <span className="text-white">Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Role Settings</h1>
          {saved && <span className="text-xs" style={{ color: '#22C55E' }}>Saved ✓</span>}
        </div>
      </div>

      <div className="border-b flex" style={{ borderColor: '#1E1E1E' }}>
        {(['general', 'scoring', 'voice'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="px-6 py-3 text-sm border-b-2 capitalize" style={{ borderColor: activeTab === tab ? '#4F46E5' : 'transparent', color: activeTab === tab ? '#FFFFFF' : '#6B6B6B' }}>
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div>
              <label className={labelClass} style={labelStyle}>Role title</label>
              <input className={inputClass} style={inputStyle} value={role.title} onChange={e => setRole({ ...role, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Location</label>
                <input className={inputClass} style={inputStyle} value={role.location} onChange={e => setRole({ ...role, location: e.target.value })} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#A0A0A0' }}>
                  <Toggle value={role.remote} onChange={v => setRole({ ...role, remote: v })} />
                  Remote
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Employment type</label>
              <select className={inputClass} style={inputStyle} value={role.employment_type} onChange={e => setRole({ ...role, employment_type: e.target.value as never })}>
                <option value="full-time">Full-time</option>
                <option value="contract">Contract</option>
                <option value="per-diem">Per diem</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Min experience</label>
                <input className={inputClass} style={inputStyle} type="number" value={role.experience_min} onChange={e => setRole({ ...role, experience_min: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Max experience</label>
                <input className={inputClass} style={inputStyle} type="number" value={role.experience_max} onChange={e => setRole({ ...role, experience_max: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Compensation min ($)</label>
                <input className={inputClass} style={inputStyle} type="number" value={role.compensation_min || ''} onChange={e => setRole({ ...role, compensation_min: parseInt(e.target.value) || null })} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Compensation max ($)</label>
                <input className={inputClass} style={inputStyle} type="number" value={role.compensation_max || ''} onChange={e => setRole({ ...role, compensation_max: parseInt(e.target.value) || null })} />
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Must-have requirements</label>
              <TagInput tags={role.must_have_requirements} onChange={v => setRole({ ...role, must_have_requirements: v })} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Nice-to-have requirements</label>
              <TagInput tags={role.nice_to_have_requirements} onChange={v => setRole({ ...role, nice_to_have_requirements: v })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Target volume</label>
                <input className={inputClass} style={inputStyle} type="number" value={role.target_candidate_volume} onChange={e => setRole({ ...role, target_candidate_volume: parseInt(e.target.value) || 50 })} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Outreach tone</label>
                <select className={inputClass} style={inputStyle} value={role.outreach_tone} onChange={e => setRole({ ...role, outreach_tone: e.target.value as never })}>
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="direct">Direct</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Description</label>
              <textarea className={inputClass} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={role.description || ''} onChange={e => setRole({ ...role, description: e.target.value })} />
            </div>
            <button onClick={saveGeneral} className="px-5 py-2.5 rounded font-medium text-sm text-white" style={{ backgroundColor: '#4F46E5' }}>Save Changes</button>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-white mb-1">Scoring Weights</h2>
              <p className="text-sm mb-6" style={{ color: '#6B6B6B' }}>Adjust how candidates are ranked for this role.</p>
              {weightSum !== 100 && (
                <div className="p-3 rounded mb-4" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                  <p className="text-xs">Weights sum to {weightSum}%. They must sum to 100%.</p>
                </div>
              )}
              {[
                { key: 'hard_qualification', label: 'Hard Qualification', desc: 'How closely credentials match must-have requirements' },
                { key: 'experience_trajectory', label: 'Experience Trajectory', desc: 'Career progression, scope growth, tenure patterns' },
                { key: 'skills_adjacency', label: 'Skills Adjacency', desc: 'Related competencies that predict success' },
                { key: 'engagement_propensity', label: 'Engagement Propensity', desc: 'Likelihood of responding based on activity signals' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{label}</span>
                    <span className="text-sm font-medium text-white">{weights[key as keyof typeof weights]}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100}
                    value={weights[key as keyof typeof weights]}
                    onChange={e => setWeights({ ...weights, [key]: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>{desc}</p>
                </div>
              ))}
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Minimum score threshold</label>
              <p className="text-xs mb-2" style={{ color: '#6B6B6B' }}>Candidates below this score are auto-archived.</p>
              <input className="w-40 px-3 py-2 rounded text-sm text-white outline-none" style={inputStyle} type="number" min={0} max={1} step={0.01} value={minScore} onChange={e => setMinScore(parseFloat(e.target.value))} />
            </div>

            <div className="flex gap-3">
              <button className="px-5 py-2.5 rounded font-medium text-sm text-white" style={{ backgroundColor: '#4F46E5' }}>Save & Re-rank Pipeline</button>
              <button onClick={() => setWeights({ hard_qualification: 30, experience_trajectory: 25, skills_adjacency: 25, engagement_propensity: 20 })} className="px-5 py-2.5 rounded font-medium text-sm border" style={{ borderColor: '#1E1E1E', color: '#A0A0A0' }}>Reset to Defaults</button>
            </div>
          </div>
        )}

        {activeTab === 'voice' && vs && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Enable Voice Agent</p>
                <p className="text-xs" style={{ color: '#6B6B6B' }}>AI voice calls for candidate qualification</p>
              </div>
              <Toggle value={vs.enabled} onChange={v => setVs({ ...vs, enabled: v })} />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Score threshold to trigger calls</label>
              <input className="w-40 px-3 py-2.5 rounded text-sm text-white outline-none" style={inputStyle} type="number" min={0} max={1} step={0.01} value={vs.score_threshold} onChange={e => setVs({ ...vs, score_threshold: parseFloat(e.target.value) })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Calling window start</label>
                <input className={inputClass} style={inputStyle} type="time" value={vs.calling_window_start} onChange={e => setVs({ ...vs, calling_window_start: e.target.value })} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Calling window end</label>
                <input className={inputClass} style={inputStyle} type="time" value={vs.calling_window_end} onChange={e => setVs({ ...vs, calling_window_end: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Max attempts</label>
                <input className={inputClass} style={inputStyle} type="number" min={1} max={10} value={vs.max_attempts} onChange={e => setVs({ ...vs, max_attempts: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Retry interval (hours)</label>
                <input className={inputClass} style={inputStyle} type="number" min={1} value={vs.retry_interval_hours} onChange={e => setVs({ ...vs, retry_interval_hours: parseInt(e.target.value) })} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: '#A0A0A0' }}>Leave voicemail</label>
              <Toggle value={vs.leave_voicemail} onChange={v => setVs({ ...vs, leave_voicemail: v })} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: '#A0A0A0' }}>Auto-advance qualified candidates</label>
              <Toggle value={vs.auto_advance_qualified} onChange={v => setVs({ ...vs, auto_advance_qualified: v })} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelClass} style={{ ...labelStyle, marginBottom: 0 }}>Verification points</label>
                <button type="button" onClick={() => setVs({ ...vs, verification_points: [...vs.verification_points, { label: '', question: '', required: true }] })} className="flex items-center gap-1 text-xs" style={{ color: '#4F46E5' }}>
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {vs.verification_points.map((vp, i) => (
                  <div key={i} className="p-3 rounded border space-y-2" style={{ backgroundColor: '#0A0A0A', borderColor: '#1E1E1E' }}>
                    <div className="flex gap-2">
                      <input className="flex-1 px-2 py-1.5 rounded text-xs text-white outline-none" style={{ backgroundColor: '#141414', border: '1px solid #1E1E1E' }} placeholder="Label" value={vp.label} onChange={e => { const vps = [...vs.verification_points]; vps[i] = { ...vp, label: e.target.value }; setVs({ ...vs, verification_points: vps }); }} />
                      <button type="button" onClick={() => setVs({ ...vs, verification_points: vs.verification_points.filter((_, idx) => idx !== i) })} style={{ color: '#6B6B6B' }}><X size={14} /></button>
                    </div>
                    <input className="w-full px-2 py-1.5 rounded text-xs text-white outline-none" style={{ backgroundColor: '#141414', border: '1px solid #1E1E1E' }} placeholder="Question" value={vp.question} onChange={e => { const vps = [...vs.verification_points]; vps[i] = { ...vp, question: e.target.value }; setVs({ ...vs, verification_points: vps }); }} />
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#A0A0A0' }}>
                      <input type="checkbox" checked={vp.required} onChange={e => { const vps = [...vs.verification_points]; vps[i] = { ...vp, required: e.target.checked }; setVs({ ...vs, verification_points: vps }); }} className="accent-indigo-600" />
                      Required
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className={labelClass} style={labelStyle}>Escalation rules</p>
              {[
                { key: 'on_human_request', label: 'On human request' },
                { key: 'on_ambiguous_credentials', label: 'On ambiguous credentials' },
                { key: 'on_all_calls', label: 'On all calls' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm mb-2 cursor-pointer" style={{ color: '#A0A0A0' }}>
                  <input type="checkbox" checked={vs.escalation_rules[key as keyof typeof vs.escalation_rules] as boolean} onChange={e => setVs({ ...vs, escalation_rules: { ...vs.escalation_rules, [key]: e.target.checked } })} className="accent-indigo-600" />
                  {label}
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer" style={{ color: '#A0A0A0' }}>
                <input type="checkbox" checked={vs.escalation_rules.on_high_score} onChange={e => setVs({ ...vs, escalation_rules: { ...vs.escalation_rules, on_high_score: e.target.checked } })} className="accent-indigo-600" />
                On high-value candidate (score &gt;= {vs.escalation_rules.high_score_threshold})
              </label>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Disclosure text</label>
              <textarea className={inputClass} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={vs.disclosure_text} onChange={e => setVs({ ...vs, disclosure_text: e.target.value })} />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Escalation email</label>
              <input className={inputClass} style={inputStyle} type="email" value={vs.escalation_email || ''} onChange={e => setVs({ ...vs, escalation_email: e.target.value })} placeholder="hiring-manager@company.com" />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Escalation Slack channel</label>
              <input className={inputClass} style={inputStyle} value={vs.escalation_slack_channel || ''} onChange={e => setVs({ ...vs, escalation_slack_channel: e.target.value })} placeholder="#hiring-alerts" />
            </div>

            <button onClick={saveVoice} className="px-5 py-2.5 rounded font-medium text-sm text-white" style={{ backgroundColor: '#4F46E5' }}>Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );
}
