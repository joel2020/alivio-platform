import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Users, Mic, Calendar, ArrowRight, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Role, AgentActivityLog, Candidate } from '../../lib/types';
import LiveActivityFeed from '../../components/app/LiveActivityFeed';
import Toast from '../../components/app/Toast';

interface RoleWithStats extends Role {
  totalScored: number;
  voiceQualified: number;
  scheduled: number;
}

type CandidateMetricsRow = Pick<Candidate, 'id' | 'score' | 'pipeline_stage' | 'role_id'>;

const AGENT_DOT_COLORS: Record<string, string> = {
  scout: '#3B82F6',
  enrich: '#10B981',
  signal: '#F59E0B',
  voice: '#22C55E',
  engage: '#EC4899',
  schedule: '#06B6D4',
  cortex: '#6366F1',
};

const AGENT_NAMES = ['scout', 'enrich', 'signal', 'voice', 'engage', 'schedule', 'cortex'] as const;

function AgentStatusRow({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {AGENT_NAMES.map((agent, i) => {
        const color = AGENT_DOT_COLORS[agent];
        return (
          <div key={agent} className="relative group" title={`${agent} — ${active ? 'running' : 'idle'}`}>
            {active ? (
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                  style={{ backgroundColor: color, animationDelay: `${i * 120}ms`, animationDuration: '2s' }}
                />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: color }} />
              </span>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  accentColor: string;
  loading?: boolean;
}

function MetricCard({ label, value, icon, trend, accentColor, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-16 mb-4" />
        <div className="skeleton h-8 w-20 mb-2" />
        <div className="skeleton h-2.5 w-12" />
      </div>
    );
  }
  return (
    <div className="card p-5 transition-theme">
      <div className="flex items-start justify-between mb-3">
        <p
          className="section-label"
          style={{ letterSpacing: '0.06em' }}
        >
          {label}
        </p>
        <div style={{ color: accentColor, opacity: 0.7 }}>
          {icon}
        </div>
      </div>
      <p className="metric-value mb-1.5">{value}</p>
      {trend && (
        <div className="flex items-center gap-1">
          <TrendingUp size={10} style={{ color: 'var(--success)' }} />
          <span style={{ fontSize: '0.6875rem', color: 'var(--success)', fontWeight: 500 }}>{trend}</span>
        </div>
      )}
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 'calc(100vh - 64px)', padding: '48px 24px' }}
    >
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Search size={48} strokeWidth={1.25} style={{ color: '#D4D4D8' }} />
        </div>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#09090B',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}
        >
          Welcome to Alivio
        </h2>
        <p
          style={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#71717A',
            lineHeight: 1.7,
            marginBottom: '32px',
            maxWidth: '420px',
            margin: '0 auto 32px',
          }}
        >
          Create your first role and let our AI agents start finding candidates.
        </p>
        <Link
          to="/roles/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            height: '48px',
            padding: '0 28px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            borderRadius: '10px',
            textDecoration: 'none',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1D4ED8'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#2563EB'; }}
        >
          <Plus size={16} />
          Create Your First Role
        </Link>
        <p
          style={{
            fontSize: '13px',
            color: '#A1A1AA',
            marginTop: '12px',
          }}
        >
          Takes about 2 minutes
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<RoleWithStats[]>([]);
  const [activity, setActivity] = useState<AgentActivityLog[]>([]);
  const [metrics, setMetrics] = useState({ discovered: 0, avgScore: 0, qualRate: 0, scheduled: 0 });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const roleTitle = sessionStorage.getItem('onboarding_role_created');
    if (roleTitle) {
      sessionStorage.removeItem('onboarding_role_created');
      setToastMessage(`Agents are now searching for candidates for ${roleTitle}`);
    }
  }, []);

  useEffect(() => {
    if (!user?.org_id) return;
    loadData();
  }, [user?.org_id]);

  async function loadData() {
    if (!user?.org_id) return;
    setLoading(true);

    const [rolesRes, activityRes, candidatesRes, callsRes] = await Promise.all([
      supabase.from('roles').select('*').eq('org_id', user.org_id).neq('status', 'closed').order('created_at', { ascending: false }),
      supabase.from('agent_activity_log').select('*').eq('org_id', user.org_id).order('created_at', { ascending: false }).limit(20),
      supabase.from('candidates').select('id, score, pipeline_stage, role_id').eq('org_id', user.org_id),
      supabase.from('voice_calls').select('qualification_status').eq('org_id', user.org_id).eq('status', 'completed'),
    ]);

    const allCandidates: CandidateMetricsRow[] = candidatesRes.data || [];
    const allCalls = callsRes.data || [];

    const rolesWithStats: RoleWithStats[] = (rolesRes.data || []).map((role: Role) => {
      const roleCands = allCandidates.filter((c) => c.role_id === role.id);
      return {
        ...role,
        totalScored: roleCands.filter((c) => c.pipeline_stage !== 'discovered').length,
        voiceQualified: roleCands.filter((c) => c.pipeline_stage === 'voice_qualified').length,
        scheduled: roleCands.filter((c) => c.pipeline_stage === 'scheduled').length,
      };
    });

    const scored = allCandidates.filter(c => c.score !== null);
    const avgScore = scored.length > 0 ? scored.reduce((sum, c) => sum + (c.score || 0), 0) / scored.length : 0;
    const qualRate = allCalls.length > 0 ? (allCalls.filter(c => c.qualification_status === 'qualified').length / allCalls.length) * 100 : 0;

    setRoles(rolesWithStats);
    setActivity(activityRes.data || []);
    setMetrics({
      discovered: allCandidates.length,
      avgScore: Math.round(avgScore * 100),
      qualRate: Math.round(qualRate),
      scheduled: allCandidates.filter(c => c.pipeline_stage === 'scheduled').length,
    });
    setLoading(false);
  }

  const activeRoles = roles.filter(r => r.status === 'active');
  const hasRoles = roles.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}
          >
            Dashboard
          </h1>
          {hasRoles && activeRoles.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: 'var(--success)' }}
              >
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ backgroundColor: 'var(--success)' }}
                />
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                {activeRoles.length} active
              </span>
            </div>
          )}
        </div>
        <Link to="/roles/new" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
          <Plus size={13} />
          New Role
        </Link>
      </div>

      {!hasRoles ? (
        <EmptyDashboard />
      ) : (
        <div className="page-content space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Candidates Discovered"
              value={metrics.discovered}
              icon={<Users size={15} />}
              trend="+12 today"
              accentColor="#3B82F6"
              loading={loading}
            />
            <MetricCard
              label="Avg Signal Score"
              value={`${metrics.avgScore}%`}
              icon={<TrendingUp size={15} />}
              accentColor="#F59E0B"
              loading={loading}
            />
            <MetricCard
              label="Voice Qual Rate"
              value={`${metrics.qualRate}%`}
              icon={<Mic size={15} />}
              accentColor="#22C55E"
              loading={loading}
            />
            <MetricCard
              label="Interviews Scheduled"
              value={metrics.scheduled}
              icon={<Calendar size={15} />}
              trend="+2 this week"
              accentColor="#06B6D4"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <h2
                  className="section-label"
                >
                  Active Roles
                </h2>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {roles.length} total
                </span>
              </div>

              <div className="space-y-2">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="card p-5">
                      <div className="skeleton h-4 w-40 mb-2" />
                      <div className="skeleton h-3 w-24 mb-4" />
                      <div className="flex gap-6">
                        <div className="skeleton h-5 w-8" />
                        <div className="skeleton h-5 w-8" />
                        <div className="skeleton h-5 w-8" />
                      </div>
                    </div>
                  ))
                ) : (
                  roles.map((role) => {
                    const isActive = role.status === 'active';
                    return (
                      <Link
                        key={role.id}
                        to={`/roles/${role.id}/pipeline`}
                        className="card card-interactive block group"
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-1">
                                <p
                                  style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.01em',
                                  }}
                                >
                                  {role.title}
                                </p>
                                <span
                                  className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}
                                >
                                  {isActive ? 'Active' : role.status}
                                </span>
                              </div>
                              <p
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                  marginBottom: isActive ? '12px' : '16px',
                                }}
                              >
                                {role.location} · {role.employment_type}
                              </p>

                              {isActive && (
                                <div className="flex items-center gap-2 mb-4">
                                  <span
                                    style={{
                                      fontSize: '0.6875rem',
                                      color: 'var(--text-muted)',
                                      fontWeight: 500,
                                    }}
                                  >
                                    Agents
                                  </span>
                                  <AgentStatusRow active={isActive} />
                                </div>
                              )}

                              <div className="flex items-center gap-5">
                                {[
                                  { val: role.totalScored, label: 'scored', color: 'var(--text-primary)' },
                                  { val: role.voiceQualified, label: 'voice qual', color: 'var(--success)' },
                                  { val: role.scheduled, label: 'scheduled', color: '#0891B2' },
                                ].map(({ val, label, color }, idx) => (
                                  <div key={label} className="flex items-center gap-5">
                                    {idx > 0 && (
                                      <div
                                        className="w-px h-6"
                                        style={{ backgroundColor: 'var(--border)' }}
                                      />
                                    )}
                                    <div>
                                      <p
                                        style={{
                                          fontSize: '1.0625rem',
                                          fontWeight: 700,
                                          color,
                                          letterSpacing: '-0.02em',
                                          lineHeight: 1,
                                        }}
                                      >
                                        {val}
                                      </p>
                                      <p
                                        style={{
                                          fontSize: '0.6875rem',
                                          color: 'var(--text-muted)',
                                          marginTop: '2px',
                                        }}
                                      >
                                        {label}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div
                              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              style={{ color: 'var(--accent)' }}
                            >
                              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Pipeline</span>
                              <ArrowRight size={13} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="section-label">Agent Activity</h2>
                <div className="flex items-center gap-1.5">
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--success)' }}
                  >
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style={{ backgroundColor: 'var(--success)' }}
                    />
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    live
                  </span>
                </div>
              </div>
              <LiveActivityFeed initialEntries={activity} simulate={activeRoles.length > 0} />
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
          duration={5000}
        />
      )}
    </div>
  );
}
