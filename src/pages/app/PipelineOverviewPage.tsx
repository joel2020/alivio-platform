import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MoreHorizontal, Plus, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Role } from '../../lib/types';

type OverviewStage = 'New' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

interface FakeCandidate {
  id: string;
  name: string;
  email: string;
  score: number;
  skills: string[];
  experience: number;
  stage: OverviewStage;
  source: string;
  addedAgo: string;
}

const FAKE_CANDIDATES: FakeCandidate[] = [
  { id: '1', name: 'Maria Santos', email: 'm.santos@email.com', score: 96, skills: ['ICU', 'Critical Care', 'ACLS', 'Epic EMR'], experience: 10, stage: 'Interview', source: 'Scout', addedAgo: '2h ago' },
  { id: '2', name: 'James Mitchell', email: 'j.mitchell@email.com', score: 94, skills: ['Family Practice', 'Primary Care', 'EHR Systems', 'Chronic Disease Mgmt'], experience: 8, stage: 'Screening', source: 'Scout', addedAgo: '5h ago' },
  { id: '3', name: 'Angela Washington', email: 'a.washington@email.com', score: 91, skills: ['Nurse Management', 'Quality Improvement', 'Joint Commission', 'Budgeting'], experience: 12, stage: 'New', source: 'Scout', addedAgo: '6h ago' },
  { id: '4', name: 'Dr. Robert Kim', email: 'r.kim@email.com', score: 89, skills: ['Internal Medicine', 'Hospital Medicine', 'Patient Safety', 'EMR'], experience: 15, stage: 'Offer', source: 'Scout', addedAgo: '1d ago' },
  { id: '5', name: 'Patricia Hernandez', email: 'p.hernandez@email.com', score: 87, skills: ['Acute Care NP', 'Ventilator Mgmt', 'Central Line', 'ICU Protocols'], experience: 9, stage: 'New', source: 'Scout', addedAgo: '1d ago' },
  { id: '6', name: 'David Thompson', email: 'd.thompson@email.com', score: 85, skills: ['Emergency Dept', 'Triage', 'Trauma', 'BLS', 'PALS'], experience: 6, stage: 'New', source: 'Scout', addedAgo: '2d ago' },
  { id: '7', name: 'Rachel Foster', email: 'r.foster@email.com', score: 82, skills: ['Labor & Delivery', 'Fetal Monitoring', 'Neonatal Resuscitation'], experience: 7, stage: 'Screening', source: 'Scout', addedAgo: '2d ago' },
  { id: '8', name: 'Michael Chen', email: 'm.chen@email.com', score: 79, skills: ['Orthopedics', 'Surgical Assist', 'Post-Op Care', 'Sports Medicine'], experience: 5, stage: 'Rejected', source: 'Scout', addedAgo: '3d ago' },
];

const STAGES: OverviewStage[] = ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

const STAGE_STYLES: Record<OverviewStage, { bg: string; color: string }> = {
  New: { bg: '#EFF6FF', color: '#2563EB' },
  Screening: { bg: '#FAF5FF', color: '#7C3AED' },
  Interview: { bg: '#FFFBEB', color: '#D97706' },
  Offer: { bg: '#F0FDF4', color: '#059669' },
  Hired: { bg: '#ECFDF5', color: '#065F46' },
  Rejected: { bg: '#FEF2F2', color: '#DC2626' },
};

function ScoreCircle({ score }: { score: number }) {
  const size = 40;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F4F4F5"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        {score}%
      </span>
    </div>
  );
}

function SkillTags({ skills }: { skills: string[] }) {
  const shown = skills.slice(0, 3);
  const extra = skills.length - 3;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}>
      {shown.map((s) => (
        <span
          key={s}
          style={{
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: '#F4F4F5',
            color: '#71717A',
            whiteSpace: 'nowrap',
          }}
        >
          {s}
        </span>
      ))}
      {extra > 0 && (
        <span style={{ fontSize: '12px', color: '#A1A1AA', fontWeight: 500 }}>+{extra} more</span>
      )}
    </div>
  );
}

function StageBadge({
  stage,
  onStageChange,
}: {
  stage: OverviewStage;
  onStageChange: (s: OverviewStage) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const styles = STAGE_STYLES[stage];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: styles.bg,
          color: styles.color,
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {stage}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E4E7',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
            zIndex: 50,
            minWidth: '130px',
            overflow: 'hidden',
            padding: '4px',
          }}
        >
          {STAGES.map((s) => {
            const st = STAGE_STYLES[s];
            return (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  onStageChange(s);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '7px 10px',
                  border: 'none',
                  background: s === stage ? '#F4F4F5' : 'transparent',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: st.bg,
                    color: st.color,
                  }}
                >
                  {s}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const items = ['View Profile', 'Send Outreach', 'Move Stage', 'Remove'];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '30px',
          height: '30px',
          borderRadius: '6px',
          border: 'none',
          background: open ? '#F4F4F5' : 'transparent',
          color: '#A1A1AA',
          cursor: 'pointer',
          transition: 'background 0.15s ease, color 0.15s ease',
        }}
        className="action-btn"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E4E7',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
            zIndex: 50,
            minWidth: '150px',
            overflow: 'hidden',
            padding: '4px',
          }}
        >
          {items.map((item) => (
            <button
              key={item}
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: item === 'Remove' ? 500 : 500,
                color: item === 'Remove' ? '#EF4444' : '#09090B',
                borderRadius: '6px',
                transition: 'background 0.1s ease',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  item === 'Remove' ? '#FEF2F2' : '#F4F4F5';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleSelector({
  roles,
  selectedId,
  onChange,
}: {
  roles: Role[];
  selectedId: string | null;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = roles.find((r) => r.id === selectedId);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          height: '38px',
          padding: '0 14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4E4E7',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#09090B',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.1)' : '0 1px 2px rgba(0,0,0,0.04)',
          borderColor: open ? '#2563EB' : '#E4E4E7',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <span style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected?.title ?? 'Select a role'}
        </span>
        {selected && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              letterSpacing: '0.01em',
              flexShrink: 0,
            }}
          >
            Engineering
          </span>
        )}
        <ChevronDown size={14} style={{ color: '#71717A', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '300px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E4E7',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
            zIndex: 50,
            overflow: 'hidden',
            padding: '6px',
          }}
        >
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => { onChange(r.id); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                background: r.id === selectedId ? '#EFF6FF' : 'transparent',
                cursor: 'pointer',
                borderRadius: '8px',
                textAlign: 'left',
                gap: '12px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: r.id === selectedId ? '#2563EB' : '#09090B' }}>
                  {r.title}
                </div>
                <div style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '1px' }}>
                  {r.location || 'Remote'} · {r.employment_type}
                </div>
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: r.status === 'active' ? '#F0FDF4' : '#F4F4F5',
                  color: r.status === 'active' ? '#059669' : '#71717A',
                  flexShrink: 0,
                }}
              >
                {r.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PipelineOverviewPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<OverviewStage | 'All'>('All');
  const [candidates, setCandidates] = useState<FakeCandidate[]>(
    [...FAKE_CANDIDATES].sort((a, b) => b.score - a.score)
  );

  useEffect(() => {
    async function loadRoles() {
      const { data } = await supabase
        .from('roles')
        .select('*')
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false });
      const roleList = data || [];
      setRoles(roleList);
      if (roleList.length > 0) setSelectedRoleId(roleList[0].id);
      setRolesLoading(false);
    }
    loadRoles();
  }, []);

  function handleStageChange(candidateId: string, newStage: OverviewStage) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
  }

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = candidates.filter((c) => c.stage === s).length;
    return acc;
  }, {} as Record<OverviewStage, number>);

  const filtered =
    activeStage === 'All' ? candidates : candidates.filter((c) => c.stage === activeStage);

  if (rolesLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-base)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                animation: 'bounce 1s infinite',
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
        <div className="page-header">
          <h1
            style={{
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#09090B',
            }}
          >
            Pipeline
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 56px)',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#F4F4F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <UserPlus size={24} strokeWidth={1.5} style={{ color: '#A1A1AA' }} />
          </div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#09090B',
              marginBottom: '8px',
            }}
          >
            No active roles
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#71717A',
              maxWidth: '320px',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Create a role to start seeing candidates in your pipeline.
          </p>
          <Link
            to="/roles/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '40px',
              padding: '0 20px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '10px',
              textDecoration: 'none',
              transition: 'background 0.15s ease',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Plus size={15} />
            Create Role
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1
          style={{
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: '#09090B',
          }}
        >
          Pipeline
        </h1>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E4E4E7',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <RoleSelector
          roles={roles}
          selectedId={selectedRoleId}
          onChange={setSelectedRoleId}
        />
        <button className="btn-ghost" style={{ fontSize: '13px', height: '36px', padding: '0 14px' }}>
          <Plus size={14} />
          Add Candidate
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E4E4E7',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
        }}
      >
        {(['All', ...STAGES] as const).map((stage) => {
          const isActive = activeStage === stage;
          const count = stage === 'All' ? candidates.length : stageCounts[stage as OverviewStage];
          return (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              style={{
                padding: '11px 16px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                border: 'none',
                borderBottom: `2px solid ${isActive ? '#2563EB' : 'transparent'}`,
                color: isActive ? '#2563EB' : '#71717A',
                background: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {stage}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: isActive ? '#2563EB' : '#F4F4F5',
                  color: isActive ? '#FFFFFF' : '#71717A',
                  lineHeight: '1.6',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '20px 24px' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E4E7',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr>
                  {['Candidate', 'Score', 'Top Skills', 'Experience', 'Stage', 'Source', 'Added', ''].map(
                    (col, i) => (
                      <th
                        key={i}
                        style={{
                          padding: '11px 16px',
                          textAlign: 'left',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#A1A1AA',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '1px solid #E4E4E7',
                          backgroundColor: '#FAFAFA',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col === 'Score' ? (
                          <span style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Score
                            <ChevronDown size={11} style={{ color: '#2563EB' }} />
                          </span>
                        ) : (
                          col
                        )}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((candidate, idx) => (
                  <tr
                    key={candidate.id}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid #F4F4F5' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#FAFAFA';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '14px 16px', paddingLeft: '20px' }}>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#09090B',
                          lineHeight: 1.3,
                        }}
                      >
                        {candidate.name}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#A1A1AA',
                          marginTop: '2px',
                          lineHeight: 1.3,
                        }}
                      >
                        {candidate.email}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <ScoreCircle score={candidate.score} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <SkillTags skills={candidate.skills} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#09090B',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {candidate.experience} yrs
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StageBadge
                        stage={candidate.stage}
                        onStageChange={(s) => handleStageChange(candidate.id, s)}
                      />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: '#3B82F6',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '13px', color: '#71717A', fontWeight: 500 }}>
                          {candidate.source}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          color: '#A1A1AA',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {candidate.addedAgo}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', paddingRight: '16px' }}>
                      <ActionsMenu />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#09090B', marginBottom: '4px' }}>
                No candidates in this stage
              </p>
              <p style={{ fontSize: '13px', color: '#71717A' }}>
                Scout is actively sourcing. Check back soon.
              </p>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            padding: '0 4px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#A1A1AA' }}>
            Showing {filtered.length} of {candidates.length} candidates
          </span>
          <span style={{ fontSize: '12px', color: '#A1A1AA' }}>
            Sorted by match score · highest first
          </span>
        </div>
      </div>
    </div>
  );
}
