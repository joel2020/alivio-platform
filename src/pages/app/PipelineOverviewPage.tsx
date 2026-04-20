import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, PointerSensor, TouchSensor, closestCorners, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search } from 'lucide-react';
import Toast from '../../components/app/Toast';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

type PipelineColumnId = 'sourced' | 'screened' | 'interview_scheduled' | 'offer_extended' | 'placed' | 'rejected';

interface PipelineRole {
  id: string;
  title: string;
}

interface PipelineCandidate {
  id: string;
  role_id: string;
  full_name: string;
  current_title: string | null;
  pipeline_stage: string;
  ai_score: number | null;
}

interface ActivityRow {
  candidate_id: string | null;
  created_at: string;
}

interface CandidateCardData extends PipelineCandidate {
  last_activity_at: string | null;
}

const COLUMN_ORDER: PipelineColumnId[] = ['sourced', 'screened', 'interview_scheduled', 'offer_extended', 'placed', 'rejected'];

const COLUMN_LABELS: Record<PipelineColumnId, string> = {
  sourced: 'Sourced',
  screened: 'Screened',
  interview_scheduled: 'Interview Scheduled',
  offer_extended: 'Offer Extended',
  placed: 'Placed',
  rejected: 'Rejected',
};

const PIPELINE_TO_COLUMN: Record<string, PipelineColumnId> = {
  discovered: 'sourced',
  scored: 'screened',
  voice_qualified: 'screened',
  engaged: 'interview_scheduled',
  responded: 'interview_scheduled',
  scheduled: 'offer_extended',
  archived: 'rejected',
  sourced: 'sourced',
  screened: 'screened',
  interview_scheduled: 'interview_scheduled',
  offer_extended: 'offer_extended',
  placed: 'placed',
  rejected: 'rejected',
};

const COLUMN_TO_PIPELINE: Record<PipelineColumnId, string> = {
  sourced: 'discovered',
  screened: 'scored',
  interview_scheduled: 'engaged',
  offer_extended: 'scheduled',
  placed: 'responded',
  rejected: 'archived',
};

function columnFromPipelineStage(stage: string): PipelineColumnId {
  return PIPELINE_TO_COLUMN[stage] ?? 'sourced';
}

function formatLastActivity(dateStr: string | null): string {
  if (!dateStr) return 'No activity yet';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'No activity yet';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function scoreLabel(score: number | null): string {
  if (score === null) return 'No score';
  return `${Math.round(score * 100)}%`;
}

function scoreClasses(score: number | null): string {
  if (score === null) return 'bg-slate-100 text-slate-500 border-slate-200';
  if (score >= 0.85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 0.7) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

function candidateInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function CandidateCard({ candidate, onOpen }: { candidate: CandidateCardData; onOpen: (candidateId: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: candidate.id });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      onClick={() => onOpen(candidate.id)}
      className="w-full rounded-xl border p-3 text-left transition hover:border-slate-300 hover:shadow-sm"
      {...attributes}
      {...listeners}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
            {candidateInitials(candidate.full_name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{candidate.full_name}</p>
            <p className="text-xs text-slate-500">{candidate.current_title ?? 'Role not specified'}</p>
          </div>
        </div>
        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${scoreClasses(candidate.ai_score)}`}>
          {scoreLabel(candidate.ai_score)}
        </span>
      </div>
      <p className="text-xs text-slate-500">Last activity: {formatLastActivity(candidate.last_activity_at)}</p>
    </button>
  );
}

function PipelineColumn({
  id,
  candidates,
  onOpen,
}: {
  id: PipelineColumnId;
  candidates: CandidateCardData[];
  onOpen: (candidateId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={`w-[280px] min-w-[280px] rounded-2xl border p-3 md:w-auto md:min-w-0 md:flex-1 ${isOver ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-slate-50/40'}`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{COLUMN_LABELS[id]}</h2>
        <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">{candidates.length}</span>
      </header>
      <div className="space-y-2">
        {candidates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-4 text-center text-xs text-slate-400">
            Drop candidates here
          </div>
        ) : (
          candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} onOpen={onOpen} />)
        )}
      </div>
    </section>
  );
}

export default function PipelineOverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roles, setRoles] = useState<PipelineRole[]>([]);
  const [candidates, setCandidates] = useState<CandidateCardData[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const loadPipelineData = useCallback(async () => {
    if (!user?.org_id) return;

    setLoading(true);
    try {
      const [rolesRes, candidatesRes, activityRes] = await Promise.all([
        supabase.from('roles').select('id,title').eq('org_id', user.org_id).order('title', { ascending: true }),
        supabase.from('candidates').select('id,role_id,full_name,current_title,pipeline_stage,ai_score').eq('org_id', user.org_id),
        supabase.from('agent_activity_log').select('candidate_id,created_at').eq('org_id', user.org_id).order('created_at', { ascending: false }),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (candidatesRes.error) throw candidatesRes.error;
      if (activityRes.error) throw activityRes.error;

      setRoles((rolesRes.data ?? []) as PipelineRole[]);

      const activityByCandidate = new Map<string, string>();
      (activityRes.data as ActivityRow[]).forEach((row) => {
        if (!row.candidate_id || activityByCandidate.has(row.candidate_id)) return;
        activityByCandidate.set(row.candidate_id, row.created_at);
      });

      const nextCandidates = ((candidatesRes.data ?? []) as PipelineCandidate[]).map((candidate) => ({
        ...candidate,
        last_activity_at: activityByCandidate.get(candidate.id) ?? null,
      }));

      setCandidates(nextCandidates);
    } catch (error) {
      console.error(error);
      setToast(error instanceof Error ? error.message : 'Failed to load pipeline data.');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id]);

  useEffect(() => {
    loadPipelineData();
  }, [loadPipelineData]);

  useEffect(() => {
    if (!user?.org_id) return;

    const channel = supabase
      .channel(`pipeline-candidates-${user.org_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `org_id=eq.${user.org_id}`,
        },
        () => {
          loadPipelineData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadPipelineData, user?.org_id]);

  const visibleCandidates = useMemo(() => {
    const searchTerm = searchQuery.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesRole = selectedRoleId === 'all' || candidate.role_id === selectedRoleId;
      const matchesSearch = searchTerm.length === 0 || candidate.full_name.toLowerCase().includes(searchTerm);
      return matchesRole && matchesSearch;
    });
  }, [candidates, searchQuery, selectedRoleId]);

  const candidatesByColumn = useMemo(() => {
    return COLUMN_ORDER.reduce((acc, columnId) => {
      acc[columnId] = visibleCandidates.filter((candidate) => columnFromPipelineStage(candidate.pipeline_stage) === columnId);
      return acc;
    }, {} as Record<PipelineColumnId, CandidateCardData[]>);
  }, [visibleCandidates]);

  async function handleDragEnd(event: DragEndEvent) {
    const candidateId = String(event.active.id);
    const destination = event.over?.id;
    if (!destination) return;

    const nextColumn = String(destination) as PipelineColumnId;
    if (!COLUMN_ORDER.includes(nextColumn)) return;

    const targetCandidate = candidates.find((candidate) => candidate.id === candidateId);
    if (!targetCandidate) return;

    const previousStage = targetCandidate.pipeline_stage;
    const nextStage = COLUMN_TO_PIPELINE[nextColumn];
    if (previousStage === nextStage) return;

    setCandidates((prev) => prev.map((candidate) => (candidate.id === candidateId ? { ...candidate, pipeline_stage: nextStage } : candidate)));

    const { error } = await supabase.from('candidates').update({ pipeline_stage: nextStage }).eq('id', candidateId);

    if (error) {
      setCandidates((prev) => prev.map((candidate) => (candidate.id === candidateId ? { ...candidate, pipeline_stage: previousStage } : candidate)));
      setToast(`Could not move candidate: ${error.message}`);
    }
  }

  function handleOpenCandidate(candidateId: string) {
    navigate(`/candidates/${candidateId}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pipeline</h1>
          <p className="text-sm text-slate-500">Drag and drop candidates through each hiring stage.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <label className="flex-1 text-sm font-medium text-slate-700">
            Role
            <select
              value={selectedRoleId}
              onChange={(event) => setSelectedRoleId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
            >
              <option value="all">All roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
          </label>

          <label className="flex-1 text-sm font-medium text-slate-700">
            Search candidate
            <span className="relative mt-1 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by candidate name"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
            </span>
          </label>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Loading pipeline…</div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto pb-2">
              <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="flex gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {COLUMN_ORDER.map((columnId) => (
                    <PipelineColumn
                      key={columnId}
                      id={columnId}
                      candidates={candidatesByColumn[columnId]}
                      onOpen={handleOpenCandidate}
                    />
                  ))}
                </div>
              </DndContext>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent md:hidden" />
          </div>
        )}
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
