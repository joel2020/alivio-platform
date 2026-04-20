import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Download, Mic, Search, TrendingUp, UserRoundCheck, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import Toast from '../../components/app/Toast';
import OnboardingWizard from '../../components/app/OnboardingWizard';

const DATE_RANGE_OPTIONS = [
  { label: 'Last 7d', days: 7 },
  { label: 'Last 30d', days: 30 },
  { label: 'Last 90d', days: 90 },
] as const;

type DateRangeDays = typeof DATE_RANGE_OPTIONS[number]['days'];

type CandidateRow = {
  id: string;
  score: number | null;
  pipeline_stage: string;
  role_id: string;
  created_at: string;
};

type RoleRow = {
  id: string;
  title: string;
  status: string;
};

type AgentActivityRow = {
  role_id: string | null;
  created_at: string;
};

type KpiStats = {
  totalCandidates: number;
  activeRoles: number;
  voiceCallsThisWeek: number;
  averageAiScore: number;
  placementsThisMonth: number;
};

type CandidatesByDayPoint = {
  date: string;
  count: number;
};

type FunnelPoint = {
  stage: string;
  count: number;
};

type RoleActivityPoint = {
  role: string;
  activityCount: number;
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  loading?: boolean;
}

function MetricCard({ label, value, icon, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-20 mb-4" />
        <div className="skeleton h-8 w-24 mb-2" />
        <div className="skeleton h-4 w-16" />
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="section-label">{label}</p>
        <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
      </div>
      <p className="metric-value">{value}</p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton h-56 w-full" />
    </div>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-center px-5" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
      {message}
    </div>
  );
}

function LineChartCard({ data, loading }: { data: CandidatesByDayPoint[]; loading: boolean }) {
  if (loading) return <ChartSkeleton />;
  if (data.every(point => point.count === 0)) {
    return <EmptyChartState message="No candidates were added in this date range yet." />;
  }

  const width = 640;
  const height = 220;
  const padding = 24;
  const maxCount = Math.max(...data.map(point => point.count), 1);
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : width - padding * 2;

  const points = data.map((point, idx) => {
    const x = padding + idx * stepX;
    const y = height - padding - ((height - padding * 2) * point.count) / maxCount;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px]" role="img" aria-label="Candidates added by day">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" />
        <polyline fill="none" stroke="#3B82F6" strokeWidth="3" points={points} />
        {data.map((point, idx) => {
          const x = padding + idx * stepX;
          const y = height - padding - ((height - padding * 2) * point.count) / maxCount;
          return <circle key={point.date} cx={x} cy={y} r="3.5" fill="#3B82F6" />;
        })}
      </svg>
      <div className="flex justify-between mt-2" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
        <span>{data[0]?.date ?? ''}</span>
        <span>{data[data.length - 1]?.date ?? ''}</span>
      </div>
    </div>
  );
}

function FunnelChartCard({ data, loading }: { data: FunnelPoint[]; loading: boolean }) {
  if (loading) return <ChartSkeleton />;
  const maxCount = Math.max(...data.map(item => item.count), 0);
  if (maxCount === 0) {
    return <EmptyChartState message="No pipeline stage distribution is available yet." />;
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.stage}>
          <div className="flex items-center justify-between mb-1" style={{ fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-primary)' }}>{item.stage}</span>
            <span style={{ color: 'var(--text-muted)' }}>{item.count}</span>
          </div>
          <div className="h-3 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div
              className="h-3 rounded-full"
              style={{
                width: `${Math.max((item.count / maxCount) * 100, 4)}%`,
                background: 'linear-gradient(90deg, #6366F1, #3B82F6)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BarChartCard({ data, loading }: { data: RoleActivityPoint[]; loading: boolean }) {
  if (loading) return <ChartSkeleton />;
  const maxCount = Math.max(...data.map(item => item.activityCount), 0);
  if (maxCount === 0) {
    return <EmptyChartState message="No agent activity has been logged for roles in this range." />;
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.role}>
          <div className="flex items-center justify-between mb-1" style={{ fontSize: '0.75rem' }}>
            <span className="truncate pr-3" style={{ color: 'var(--text-primary)' }}>{item.role}</span>
            <span style={{ color: 'var(--text-muted)' }}>{item.activityCount}</span>
          </div>
          <div className="h-3 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div
              className="h-3 rounded-full"
              style={{
                width: `${Math.max((item.activityCount / maxCount) * 100, 6)}%`,
                backgroundColor: '#14B8A6',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="card p-8 text-center" style={{ maxWidth: '560px', margin: '48px auto' }}>
      <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <Search size={22} style={{ color: 'var(--text-muted)' }} />
      </div>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>No roles yet</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
        Create your first role to start generating analytics from candidate and agent activity.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, org } = useAuth();
  const [selectedRange, setSelectedRange] = useState<DateRangeDays>(30);
  const [kpis, setKpis] = useState<KpiStats>({
    totalCandidates: 0,
    activeRoles: 0,
    voiceCallsThisWeek: 0,
    averageAiScore: 0,
    placementsThisMonth: 0,
  });
  const [lineChartData, setLineChartData] = useState<CandidatesByDayPoint[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelPoint[]>([]);
  const [roleActivityData, setRoleActivityData] = useState<RoleActivityPoint[]>([]);
  const [hasRoles, setHasRoles] = useState(true);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

  const csvData = useMemo(() => {
    const kpiRows = [
      ['metric', 'value'],
      ['total_candidates_in_pipeline', String(kpis.totalCandidates)],
      ['active_roles_open', String(kpis.activeRoles)],
      ['voice_calls_this_week', String(kpis.voiceCallsThisWeek)],
      ['average_ai_score', String(kpis.averageAiScore)],
      ['placements_this_month', String(kpis.placementsThisMonth)],
      [],
      ['candidates_added_per_day'],
      ['date', 'count'],
      ...lineChartData.map(point => [point.date, String(point.count)]),
      [],
      ['pipeline_funnel'],
      ['stage', 'count'],
      ...funnelData.map(point => [point.stage, String(point.count)]),
      [],
      ['top_roles_by_activity'],
      ['role', 'activity_count'],
      ...roleActivityData.map(point => [point.role, String(point.activityCount)]),
    ];

    return kpiRows.map(row => row.join(',')).join('\n');
  }, [funnelData, kpis, lineChartData, roleActivityData]);

  const exportCsv = () => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const roleTitle = sessionStorage.getItem('onboarding_role_created');
    if (roleTitle) {
      sessionStorage.removeItem('onboarding_role_created');
      setToastMessage(`Agents are now searching for candidates for ${roleTitle}`);
    }
  }, []);

  const loadKpis = useCallback(async () => {
    if (!user?.org_id) return;

    setLoadingKpis(true);
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getUTCDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - diffToMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [rolesRes, candidatesRes, voiceCallsRes, feedbackRes] = await Promise.all([
      supabase.from('roles').select('id, title, status').eq('org_id', user.org_id),
      supabase.from('candidates').select('id, score, pipeline_stage, role_id, created_at').eq('org_id', user.org_id),
      supabase.from('voice_calls').select('created_at').eq('org_id', user.org_id).gte('created_at', startOfWeek.toISOString()),
      supabase.from('candidate_feedback').select('stage, created_at').eq('org_id', user.org_id).eq('stage', 'hired').gte('created_at', startOfMonth.toISOString()),
    ]);

    if (rolesRes.error || candidatesRes.error || voiceCallsRes.error || feedbackRes.error) {
      setToastMessage(rolesRes.error?.message || candidatesRes.error?.message || voiceCallsRes.error?.message || feedbackRes.error?.message || 'Unable to load dashboard metrics.');
      setLoadingKpis(false);
      return;
    }

    const roles = (rolesRes.data ?? []) as RoleRow[];
    const candidates = (candidatesRes.data ?? []) as CandidateRow[];
    const scoredCandidates = candidates.filter(candidate => candidate.score !== null);
    const avgAiScore = scoredCandidates.length > 0
      ? scoredCandidates.reduce((sum, candidate) => sum + (candidate.score ?? 0), 0) / scoredCandidates.length
      : 0;

    setHasRoles(roles.length > 0);
    setKpis({
      totalCandidates: candidates.filter(candidate => candidate.pipeline_stage !== 'archived').length,
      activeRoles: roles.filter(role => role.status === 'active').length,
      voiceCallsThisWeek: (voiceCallsRes.data ?? []).length,
      averageAiScore: Math.round(avgAiScore * 100),
      placementsThisMonth: (feedbackRes.data ?? []).length,
    });

    setShowOnboardingWizard(roles.length === 0 && !org?.onboarding_complete);
    setLoadingKpis(false);
  }, [org?.onboarding_complete, user?.org_id]);

  const loadCharts = useCallback(async () => {
    if (!user?.org_id) return;
    setLoadingCharts(true);

    const now = new Date();
    const startDate = new Date(now);
    startDate.setUTCDate(startDate.getUTCDate() - (selectedRange - 1));
    startDate.setUTCHours(0, 0, 0, 0);

    const [candidatesRes, activityRes, rolesRes] = await Promise.all([
      supabase
        .from('candidates')
        .select('id, score, pipeline_stage, role_id, created_at')
        .eq('org_id', user.org_id)
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('agent_activity_log')
        .select('role_id, created_at')
        .eq('org_id', user.org_id)
        .gte('created_at', startDate.toISOString()),
      supabase.from('roles').select('id, title').eq('org_id', user.org_id),
    ]);

    if (candidatesRes.error || activityRes.error || rolesRes.error) {
      setToastMessage(candidatesRes.error?.message || activityRes.error?.message || rolesRes.error?.message || 'Unable to load dashboard charts.');
      setLoadingCharts(false);
      return;
    }

    const candidates = (candidatesRes.data ?? []) as CandidateRow[];
    const activity = (activityRes.data ?? []) as AgentActivityRow[];
    const roles = (rolesRes.data ?? []) as Pick<RoleRow, 'id' | 'title'>[];

    const dayLabels = Array.from({ length: selectedRange }, (_, idx) => {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + idx);
      return date.toISOString().slice(0, 10);
    });

    const candidateCountByDay = new Map<string, number>(dayLabels.map(date => [date, 0]));
    candidates.forEach((candidate) => {
      const dayKey = candidate.created_at.slice(0, 10);
      candidateCountByDay.set(dayKey, (candidateCountByDay.get(dayKey) ?? 0) + 1);
    });

    setLineChartData(dayLabels.map(date => ({ date: date.slice(5), count: candidateCountByDay.get(date) ?? 0 })));

    const stageBuckets: Record<string, number> = {
      sourced: 0,
      screened: 0,
      interviewed: 0,
      offered: 0,
      placed: 0,
    };

    candidates.forEach((candidate) => {
      const stage = candidate.pipeline_stage;
      if (stage === 'discovered') stageBuckets.sourced += 1;
      if (stage === 'scored' || stage === 'voice_qualified') stageBuckets.screened += 1;
      if (stage === 'engaged' || stage === 'responded') stageBuckets.interviewed += 1;
      if (stage === 'scheduled') stageBuckets.offered += 1;
      if (stage === 'archived') stageBuckets.placed += 1;
    });

    setFunnelData([
      { stage: 'Sourced', count: stageBuckets.sourced },
      { stage: 'Screened', count: stageBuckets.screened },
      { stage: 'Interviewed', count: stageBuckets.interviewed },
      { stage: 'Offered', count: stageBuckets.offered },
      { stage: 'Placed', count: stageBuckets.placed },
    ]);

    const roleNameById = new Map<string, string>(roles.map(role => [role.id, role.title]));
    const activityByRole = new Map<string, number>();

    activity.forEach((entry) => {
      if (!entry.role_id) return;
      const roleName = roleNameById.get(entry.role_id) ?? 'Unknown Role';
      activityByRole.set(roleName, (activityByRole.get(roleName) ?? 0) + 1);
    });

    const topRoles = Array.from(activityByRole.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([role, activityCount]) => ({ role, activityCount }));

    setRoleActivityData(topRoles);
    setLoadingCharts(false);
  }, [selectedRange, user?.org_id]);

  useEffect(() => {
    if (!user?.org_id) return;
    loadKpis();
  }, [loadKpis, user?.org_id]);

  useEffect(() => {
    if (!user?.org_id) return;
    loadCharts();
  }, [loadCharts, user?.org_id]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header flex-wrap gap-3">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          Analytics Dashboard
        </h1>

        <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
          <div className="rounded-lg border p-1 flex" style={{ borderColor: 'var(--border)' }}>
            {DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.days}
                type="button"
                className="px-3 py-1.5 rounded-md"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: selectedRange === option.days ? 'var(--bg-subtle)' : 'transparent',
                  color: selectedRange === option.days ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
                onClick={() => setSelectedRange(option.days)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button type="button" className="btn-secondary" onClick={exportCsv}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {!hasRoles && !loadingKpis ? (
        <EmptyDashboard />
      ) : (
        <div className="page-content space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <MetricCard label="Total Candidates in Pipeline" value={kpis.totalCandidates} icon={<Users size={16} />} loading={loadingKpis} />
            <MetricCard label="Active Roles Open" value={kpis.activeRoles} icon={<TrendingUp size={16} />} loading={loadingKpis} />
            <MetricCard label="Voice Calls This Week" value={kpis.voiceCallsThisWeek} icon={<Mic size={16} />} loading={loadingKpis} />
            <MetricCard label="Average AI Score" value={`${kpis.averageAiScore}%`} icon={<Search size={16} />} loading={loadingKpis} />
            <MetricCard label="Placements This Month" value={kpis.placementsThisMonth} icon={<UserRoundCheck size={16} />} loading={loadingKpis} />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="card p-5">
              <h2 className="section-label mb-4">Candidates Added Per Day ({selectedRange}d)</h2>
              <LineChartCard data={lineChartData} loading={loadingCharts} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="card p-5">
                <h2 className="section-label mb-4">Pipeline Funnel</h2>
                <FunnelChartCard data={funnelData} loading={loadingCharts} />
              </div>
              <div className="card p-5">
                <h2 className="section-label mb-4">Top 5 Roles by Candidate Activity</h2>
                <BarChartCard data={roleActivityData} loading={loadingCharts} />
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} duration={5000} />
      )}
      {showOnboardingWizard && (
        <OnboardingWizard
          onComplete={async () => {
            setShowOnboardingWizard(false);
            await Promise.all([loadKpis(), loadCharts()]);
          }}
        />
      )}
    </div>
  );
}
