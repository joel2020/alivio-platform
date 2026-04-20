import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, X, Download, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Candidate, Role, VoiceCall, VoiceTranscript } from '../../lib/types';
import Toast from '../../components/app/Toast';

type CallFilterStatus = 'all' | 'completed' | 'no-answer' | 'scheduled' | 'failed';

interface CallRow {
  call: VoiceCall;
  candidateName: string;
  roleTitle: string;
}

function formatDateTime(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function callStatusLabel(status: string) {
  if (status === 'no_answer' || status === 'no-answer') return 'no-answer';
  return status;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = callStatusLabel(status);
  const styles: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'var(--success-subtle)', text: 'var(--success)' },
    'no-answer': { bg: 'var(--warning-subtle)', text: 'var(--warning)' },
    scheduled: { bg: 'var(--accent-subtle)', text: 'var(--accent)' },
    failed: { bg: 'var(--error-subtle)', text: 'var(--error)' },
  };

  const variant = styles[normalized] ?? { bg: 'var(--bg-subtle)', text: 'var(--text-muted)' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '0.6875rem',
        fontWeight: 700,
        backgroundColor: variant.bg,
        color: variant.text,
        textTransform: 'capitalize',
      }}
    >
      {normalized}
    </span>
  );
}

interface NewCallModalProps {
  isOpen: boolean;
  candidates: Candidate[];
  roles: Role[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { candidateId: string; roleId: string; phone: string }) => Promise<void>;
}

function NewCallModal({ isOpen, candidates, roles, submitting, onClose, onSubmit }: NewCallModalProps) {
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCandidateSearch('');
    setCandidateId('');
    setRoleId('');
    setPhone('');
    setError(null);
  }, [isOpen]);

  const filteredCandidates = useMemo(() => {
    const term = candidateSearch.trim().toLowerCase();
    if (!term) return candidates.slice(0, 12);
    return candidates
      .filter((candidate) => candidate.full_name.toLowerCase().includes(term))
      .slice(0, 12);
  }, [candidateSearch, candidates]);

  const selectedCandidate = candidates.find((candidate) => candidate.id === candidateId) ?? null;

  function isValidPhone(value: string) {
    const cleaned = value.replace(/\s+/g, '');
    return /^\+?[1-9]\d{7,14}$/.test(cleaned);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!candidateId || !roleId || !phone.trim()) {
      setError('Candidate, role, and phone number are required.');
      return;
    }

    if (!isValidPhone(phone)) {
      setError('Enter a valid phone number in international format (for example, +13125551234).');
      return;
    }

    await onSubmit({
      candidateId,
      roleId,
      phone: phone.trim(),
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(9,9,11,0.45)' }}>
      <div className="card w-full max-w-2xl" style={{ padding: '18px' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Schedule New Call</h2>
          <button className="btn-ghost" onClick={onClose} type="button" aria-label="Close new call modal">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <label className="block mb-2" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
              Candidate
            </label>
            <div
              className="rounded-lg border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}
            >
              <div className="px-3 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                <Search size={13} style={{ color: 'var(--text-muted)' }} />
                <input
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                  placeholder="Search candidates"
                  style={{
                    width: '100%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {filteredCandidates.length === 0 ? (
                  <p className="px-3 py-2" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No candidates found.</p>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const active = candidate.id === candidateId;
                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => {
                          setCandidateId(candidate.id);
                          if (!phone.trim() && candidate.phone) {
                            setPhone(candidate.phone);
                          }
                        }}
                        className="w-full text-left px-3 py-2"
                        style={{
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: active ? 'var(--accent-subtle)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--text-primary)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {candidate.full_name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            {selectedCandidate ? (
              <p className="mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>Selected: {selectedCandidate.full_name}</p>
            ) : null}
          </div>

          <div>
            <label className="block mb-2" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
              Role
            </label>
            <select
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+13125551234"
              className="w-full rounded-lg border px-3 py-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
            />
          </div>

          {error ? (
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--error)', backgroundColor: 'var(--error-subtle)', color: 'var(--error)', fontSize: '0.75rem' }}>
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Scheduling…' : 'Schedule Call'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CallsPage() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [detailCall, setDetailCall] = useState<CallRow | null>(null);
  const [detailTranscript, setDetailTranscript] = useState<VoiceTranscript | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [submittingCall, setSubmittingCall] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CallFilterStatus>('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadData = useCallback(async () => {
    if (!user?.org_id) return;
    setLoading(true);
    setError(null);

    const [callsRes, candidatesRes, rolesRes] = await Promise.all([
      supabase.from('voice_calls').select('*').eq('org_id', user.org_id).order('created_at', { ascending: false }),
      supabase.from('candidates').select('*').eq('org_id', user.org_id),
      supabase.from('roles').select('*').eq('org_id', user.org_id),
    ]);

    const loadErr = callsRes.error || candidatesRes.error || rolesRes.error;
    if (loadErr) {
      setError(loadErr.message);
      setLoading(false);
      return;
    }

    setCalls(callsRes.data ?? []);
    setCandidates(candidatesRes.data ?? []);
    setRoles(rolesRes.data ?? []);
    setLoading(false);
  }, [user?.org_id]);

  useEffect(() => {
    if (!user?.org_id) return;
    void loadData();
  }, [loadData, user?.org_id]);

  useEffect(() => {
    if (!user?.org_id) return;

    const channel = supabase
      .channel(`calls-view-${user.org_id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'voice_calls',
        filter: `org_id=eq.${user.org_id}`,
      }, () => {
        void loadData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadData, user?.org_id]);

  useEffect(() => {
    if (!detailCall) return;
    setTranscriptLoading(true);
    setDetailTranscript(null);

    supabase
      .from('voice_transcripts')
      .select('*')
      .eq('call_id', detailCall.call.id)
      .maybeSingle()
      .then(({ data, error: transcriptError }) => {
        if (transcriptError) {
          setToast(`Unable to load transcript: ${transcriptError.message}`);
          return;
        }
        setDetailTranscript(data);
      })
      .finally(() => setTranscriptLoading(false));
  }, [detailCall]);

  const callRows = useMemo<CallRow[]>(() => {
    const candidateMap = new Map(candidates.map((candidate) => [candidate.id, candidate]));
    const roleMap = new Map(roles.map((role) => [role.id, role]));

    return calls.map((call) => ({
      call,
      candidateName: candidateMap.get(call.candidate_id)?.full_name ?? 'Unknown candidate',
      roleTitle: roleMap.get(call.role_id)?.title ?? 'Unknown role',
    }));
  }, [calls, candidates, roles]);

  const filteredRows = useMemo(() => {
    return callRows.filter((row) => {
      const normalizedStatus = callStatusLabel(row.call.status);
      const createdDate = new Date(row.call.created_at);
      const fromCheck = dateFrom ? createdDate >= new Date(`${dateFrom}T00:00:00`) : true;
      const toCheck = dateTo ? createdDate <= new Date(`${dateTo}T23:59:59`) : true;
      const statusCheck = statusFilter === 'all' ? true : normalizedStatus === statusFilter;
      const roleCheck = roleFilter === 'all' ? true : row.call.role_id === roleFilter;
      return fromCheck && toCheck && statusCheck && roleCheck;
    });
  }, [callRows, dateFrom, dateTo, roleFilter, statusFilter]);

  function exportCsv() {
    const headers = ['Candidate Name', 'Role', 'Date/Time', 'Duration', 'Status', 'AI Summary'];
    const lines = filteredRows.map((row) => {
      const summary = (row.call.ai_summary ?? row.call.call_summary ?? '').replace(/"/g, '""');
      return [
        `"${row.candidateName.replace(/"/g, '""')}"`,
        `"${row.roleTitle.replace(/"/g, '""')}"`,
        `"${formatDateTime(row.call.started_at ?? row.call.created_at)}"`,
        `"${formatDuration(row.call.duration_seconds)}"`,
        `"${callStatusLabel(row.call.status)}"`,
        `"${summary}"`,
      ].join(',');
    });

    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voice-calls-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleCreateCall(payload: { candidateId: string; roleId: string; phone: string }) {
    if (!user?.org_id) return;
    setSubmittingCall(true);

    const updateCandidatePromise = supabase
      .from('candidates')
      .update({ phone: payload.phone })
      .eq('id', payload.candidateId)
      .eq('org_id', user.org_id);

    const insertCallPromise = supabase
      .from('voice_calls')
      .insert({
        org_id: user.org_id,
        candidate_id: payload.candidateId,
        role_id: payload.roleId,
        status: 'scheduled',
        call_type: 'outbound',
        provider: 'manual',
        attempt_number: 1,
      });

    const [candidateUpdate, callInsert] = await Promise.all([updateCandidatePromise, insertCallPromise]);

    if (candidateUpdate.error || callInsert.error) {
      setToast(`Unable to schedule call: ${(candidateUpdate.error || callInsert.error)?.message ?? 'Unknown error'}`);
      setSubmittingCall(false);
      return;
    }

    setToast('Call scheduled successfully.');
    setIsNewModalOpen(false);
    setSubmittingCall(false);
    await loadData();
  }

  async function handleAction(action: string) {
    if (!detailCall) return;
    setToast(`${action} requested for ${detailCall.candidateName}.`);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Voice Calls
          </h1>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {filteredRows.length} shown
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={exportCsv} disabled={filteredRows.length === 0}>
            <Download size={13} />
            Export CSV
          </button>
          <button className="btn-primary" onClick={() => setIsNewModalOpen(true)}>
            <Plus size={13} />
            New Call
          </button>
        </div>
      </div>

      <div className="page-content">
        {error ? (
          <div className="card p-4" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
            Unable to load calls. {error}
          </div>
        ) : null}

        <div className="card mb-4" style={{ padding: '12px' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block mb-1" style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>From</label>
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-full rounded-md border px-2 py-1.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>To</label>
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="w-full rounded-md border px-2 py-1.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CallFilterStatus)} className="w-full rounded-md border px-2 py-1.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                <option value="all">All</option>
                <option value="completed">completed</option>
                <option value="no-answer">no-answer</option>
                <option value="scheduled">scheduled</option>
                <option value="failed">failed</option>
              </select>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</label>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="w-full rounded-md border px-2 py-1.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '960px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  {['Candidate Name', 'Role', 'Date/Time', 'Duration', 'Status', 'AI Summary'].map((label) => (
                    <th key={label} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td colSpan={6} style={{ padding: '12px' }}>
                        <div className="skeleton h-8 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No calls found for selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.call.id}
                      onClick={() => setDetailCall(row)}
                      style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                      <td style={{ padding: '12px', color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>{row.candidateName}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{row.roleTitle}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{formatDateTime(row.call.started_at ?? row.call.created_at)}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{formatDuration(row.call.duration_seconds)}</td>
                      <td style={{ padding: '12px' }}><StatusBadge status={row.call.status} /></td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: '320px' }}>
                        {(row.call.ai_summary ?? row.call.call_summary ?? 'No summary yet.').slice(0, 120)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {detailCall ? (
        <div className="fixed inset-0 z-40" style={{ backgroundColor: 'rgba(9,9,11,0.25)' }}>
          <div className="absolute inset-0" onClick={() => setDetailCall(null)} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl border-l" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
            <div className="h-full flex flex-col">
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Call Detail</p>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{detailCall.candidateName}</h3>
                </div>
                <button className="btn-ghost" onClick={() => setDetailCall(null)}><X size={14} /></button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                <div className="card" style={{ padding: '12px' }}>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Summary</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {detailCall.call.ai_summary ?? detailCall.call.call_summary ?? 'Summary not available yet.'}
                  </p>
                </div>

                <div className="card" style={{ padding: '12px' }}>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Transcript</p>

                  {transcriptLoading ? (
                    <div className="space-y-2">
                      <div className="skeleton h-4 w-full" />
                      <div className="skeleton h-4 w-11/12" />
                      <div className="skeleton h-4 w-9/12" />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transcript processing...</p>
                    </div>
                  ) : !detailTranscript?.entries || detailTranscript.entries.length === 0 ? (
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transcript processing...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailTranscript.entries.map((entry, index) => (
                        <div key={`${entry.timestamp}-${index}`} className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{entry.speaker.replace('_', ' ')}</span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{entry.timestamp}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{entry.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {['Schedule Follow-up', 'Move to Next Stage', 'Add Note', 'Reject Candidate'].map((action) => (
                    <button key={action} className="btn-secondary" onClick={() => void handleAction(action)}>
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <NewCallModal
        isOpen={isNewModalOpen}
        candidates={candidates}
        roles={roles}
        submitting={submittingCall}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateCall}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
