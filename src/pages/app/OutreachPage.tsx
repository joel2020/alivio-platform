import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Candidate, Role } from '../../lib/types';
import Toast from '../../components/app/Toast';

type SequenceStatus = 'pending' | 'active' | 'completed' | 'paused';

type OutreachSequence = {
  id: string;
  org_id: string;
  candidate_id: string;
  role_id: string;
  status: SequenceStatus;
  current_step: number;
  created_at: string;
  updated_at: string;
};

type OutreachMessage = {
  id: string;
  sequence_id: string;
  step_number: number;
  channel: 'email' | 'sms' | 'linkedin';
  message_body: string;
  sent_at: string | null;
  opened_at: string | null;
  replied_at: string | null;
  status: string;
};

type SequenceDraft = {
  day: string;
  stepNumber: number;
  channel: 'email';
  subject: string;
  body: string;
};

const STATUS_COLORS: Record<SequenceStatus, { bg: string; text: string }> = {
  active: { bg: '#ECFDF3', text: '#027A48' },
  completed: { bg: '#EFF8FF', text: '#175CD3' },
  paused: { bg: '#FFF6ED', text: '#C4320A' },
  pending: { bg: '#F2F4F7', text: '#344054' },
};

function responseRate(messages: OutreachMessage[]): number {
  const sentCount = messages.filter((msg) => !!msg.sent_at || msg.status === 'sent' || msg.status === 'opened' || msg.status === 'replied').length;
  if (sentCount === 0) return 0;
  const repliedCount = messages.filter((msg) => !!msg.replied_at || msg.status === 'replied').length;
  return Math.round((repliedCount / sentCount) * 100);
}

function prettyStatus(status: SequenceStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DraftEditor({
  draft,
  onChange,
}: {
  draft: SequenceDraft;
  onChange: (next: SequenceDraft) => void;
}) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{draft.day} · {draft.channel.toUpperCase()}</p>
      </div>
      <input
        value={draft.subject}
        onChange={(e) => onChange({ ...draft, subject: e.target.value })}
        placeholder="Subject"
        className="w-full rounded-lg border px-3 py-2 text-sm mb-2"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
      />
      <textarea
        value={draft.body}
        onChange={(e) => onChange({ ...draft, body: e.target.value })}
        rows={5}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
      />
    </div>
  );
}

export default function OutreachPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sequences, setSequences] = useState<OutreachSequence[]>([]);
  const [messagesBySequence, setMessagesBySequence] = useState<Record<string, OutreachMessage[]>>({});

  const [statusFilter, setStatusFilter] = useState<'all' | SequenceStatus>('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [drafts, setDrafts] = useState<SequenceDraft[]>([]);

  const loadData = useCallback(async () => {
    if (!user?.org_id) return;

    setLoading(true);
    try {
      const [rolesRes, candidatesRes, sequencesRes] = await Promise.all([
        supabase.from('roles').select('*').eq('org_id', user.org_id).order('created_at', { ascending: false }),
        supabase.from('candidates').select('*').eq('org_id', user.org_id).order('created_at', { ascending: false }),
        supabase.from('outreach_sequences').select('*').eq('org_id', user.org_id).order('updated_at', { ascending: false }),
      ]);

      if (rolesRes.error) throw new Error(rolesRes.error.message);
      if (candidatesRes.error) throw new Error(candidatesRes.error.message);
      if (sequencesRes.error) throw new Error(sequencesRes.error.message);

      const loadedRoles = rolesRes.data || [];
      const loadedCandidates = candidatesRes.data || [];
      const loadedSequences = (sequencesRes.data || []) as OutreachSequence[];

      setRoles(loadedRoles);
      setCandidates(loadedCandidates);
      setSequences(loadedSequences);

      if (loadedSequences.length === 0) {
        setMessagesBySequence({});
      } else {
        const ids = loadedSequences.map((item) => item.id);
        const messagesRes = await supabase
          .from('outreach_messages')
          .select('*')
          .in('sequence_id', ids)
          .order('step_number', { ascending: true });

        if (messagesRes.error) throw new Error(messagesRes.error.message);

        const grouped: Record<string, OutreachMessage[]> = {};
        for (const msg of (messagesRes.data || []) as OutreachMessage[]) {
          grouped[msg.sequence_id] = [...(grouped[msg.sequence_id] || []), msg];
        }
        setMessagesBySequence(grouped);
      }
    } catch (error) {
      console.error(error);
      setToast('Failed to load outreach sequences.');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const candidateId = searchParams.get('candidateId');
    if (candidateId) {
      setSelectedCandidateId(candidateId);
      setModalOpen(true);
    }
  }, [searchParams]);

  const selectedCandidate = useMemo(() => candidates.find((candidate) => candidate.id === selectedCandidateId) || null, [candidates, selectedCandidateId]);
  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId) || null, [roles, selectedRoleId]);

  const filteredSequences = useMemo(() => {
    return sequences.filter((sequence) => {
      if (statusFilter !== 'all' && sequence.status !== statusFilter) {
        return false;
      }
      if (roleFilter !== 'all' && sequence.role_id !== roleFilter) {
        return false;
      }
      return true;
    });
  }, [roleFilter, sequences, statusFilter]);

  const openStartModal = useCallback(() => {
    setDrafts([]);
    setGenerating(false);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setDrafts([]);
    const next = new URLSearchParams(searchParams);
    next.delete('candidateId');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const generateDrafts = useCallback(async () => {
    if (!selectedCandidate || !selectedRole) {
      setToast('Please select a candidate and role first.');
      return;
    }

    setGenerating(true);
    try {
      const steps = [
        { day: 'Day 1', stepNumber: 1, notes: 'Initial outreach' },
        { day: 'Day 3', stepNumber: 2, notes: 'Follow-up outreach after no response' },
        { day: 'Day 7', stepNumber: 3, notes: 'Final touch outreach message' },
      ] as const;

      const nextDrafts: SequenceDraft[] = [];

      for (const step of steps) {
        const { data, error } = await supabase.functions.invoke<{ data: { subject?: string; body: string } }>('generate-outreach', {
          body: {
            candidate: {
              id: selectedCandidate.id,
              full_name: selectedCandidate.full_name,
              skills: selectedCandidate.skills,
              experience_years: selectedCandidate.experience_years,
              notes: `${selectedCandidate.current_title || 'Candidate'} at ${selectedCandidate.current_company || 'unknown organization'} · ${step.notes}`,
            },
            role: `${selectedRole.title}${selectedRole.description ? ` - ${selectedRole.description}` : ''}`,
            tone: selectedRole.outreach_tone,
            channel: 'email',
          },
        });

        if (error || !data?.data) {
          throw new Error(error?.message || 'Failed to generate sequence draft.');
        }

        nextDrafts.push({
          day: step.day,
          stepNumber: step.stepNumber,
          channel: 'email',
          subject: data.data.subject || `${selectedRole.title} opportunity`,
          body: data.data.body,
        });
      }

      setDrafts(nextDrafts);
    } catch (error) {
      console.error(error);
      setToast('Unable to generate drafts right now. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [selectedCandidate, selectedRole]);

  const confirmSequence = useCallback(async () => {
    if (!user?.org_id || !selectedCandidate || !selectedRole || drafts.length !== 3) {
      setToast('Complete all outreach steps before confirming.');
      return;
    }

    setSaving(true);
    try {
      const { data: createdSequence, error: sequenceError } = await supabase
        .from('outreach_sequences')
        .insert({
          org_id: user.org_id,
          candidate_id: selectedCandidate.id,
          role_id: selectedRole.id,
          status: 'pending',
          current_step: 1,
        })
        .select('*')
        .single();

      if (sequenceError || !createdSequence) {
        throw new Error(sequenceError?.message || 'Failed to create outreach sequence.');
      }

      const rows = drafts.map((draft) => ({
        sequence_id: createdSequence.id,
        step_number: draft.stepNumber,
        channel: 'email',
        message_body: `Subject: ${draft.subject}\n\n${draft.body}`,
        status: 'draft',
        sent_at: null,
      }));

      const { error: messagesError } = await supabase.from('outreach_messages').insert(rows);
      if (messagesError) {
        throw new Error(messagesError.message);
      }

      setToast('Outreach drafts saved. No emails have been sent. Use Applications to send reviewed candidate messages.');
      closeModal();
      await loadData();
    } catch (error) {
      console.error(error);
      setToast('Failed to save outreach drafts.');
    } finally {
      setSaving(false);
    }
  }, [closeModal, drafts, loadData, selectedCandidate, selectedRole, user?.org_id]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header"><h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Outreach</h1></div>

      <div className="p-7 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | SequenceStatus)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>

            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
              <option value="all">All roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
          </div>

          <button onClick={openStartModal} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
            <Plus size={14} /> Create drafts
          </button>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b text-xs font-semibold uppercase" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <div className="col-span-3">Candidate</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2">Current step</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Response rate</div>
          </div>

          {loading ? (
            <div className="px-4 py-10 flex justify-center"><Loader2 className="animate-spin" size={18} style={{ color: 'var(--text-muted)' }} /></div>
          ) : filteredSequences.length === 0 ? (
            <div className="px-4 py-10 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              No outreach sequences found for the selected filters.
            </div>
          ) : (
            filteredSequences.map((sequence) => {
              const candidate = candidates.find((item) => item.id === sequence.candidate_id);
              const role = roles.find((item) => item.id === sequence.role_id);
              const sequenceMessages = messagesBySequence[sequence.id] || [];
              const rate = responseRate(sequenceMessages);
              const colors = STATUS_COLORS[sequence.status];

              return (
                <div key={sequence.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 items-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <div className="col-span-3 font-medium">{candidate?.full_name || 'Unknown candidate'}</div>
                  <div className="col-span-3">{role?.title || 'Unknown role'}</div>
                  <div className="col-span-2">Step {sequence.current_step} of 3</div>
                  <div className="col-span-2">
                    <span className="inline-flex rounded-md px-2 py-1 text-xs font-semibold" style={{ backgroundColor: colors.bg, color: colors.text }}>
                      {prettyStatus(sequence.status)}
                    </span>
                  </div>
                  <div className="col-span-2 font-semibold">{rate}%</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-3xl rounded-xl border max-h-[90vh] overflow-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-base)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Create outreach drafts</h2>
              <button onClick={closeModal} className="rounded-md p-1" style={{ color: 'var(--text-secondary)' }}><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Candidate</label>
                  <select value={selectedCandidateId} onChange={(event) => setSelectedCandidateId(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                    <option value="">Select candidate</option>
                    {candidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>{candidate.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Role</label>
                  <select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>3-step sequence</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Day 1 (email), Day 3 (follow-up), Day 7 (final touch)</p>
              </div>

              <div className="flex gap-2">
                <button onClick={generateDrafts} disabled={generating || !selectedCandidateId || !selectedRoleId} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-70" style={{ backgroundColor: 'var(--accent)' }}>
                  {generating ? <Loader2 size={14} className="animate-spin" /> : null}
                  {generating ? 'Generating drafts...' : 'Generate AI drafts'}
                </button>
              </div>

              {drafts.length > 0 && (
                <div className="space-y-3">
                  {drafts.map((draft, index) => (
                    <DraftEditor
                      key={draft.stepNumber}
                      draft={draft}
                      onChange={(next) => {
                        setDrafts((prev) => prev.map((entry, i) => (i === index ? next : entry)));
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={closeModal} className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button onClick={confirmSequence} disabled={saving || drafts.length !== 3} className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-70" style={{ backgroundColor: 'var(--accent)' }}>
                {saving ? 'Saving...' : 'Save drafts'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
