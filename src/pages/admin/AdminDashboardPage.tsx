import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface RecentSignup {
  id: string;
  email: string;
  created_at: string;
}

interface ActivityItem {
  id: string;
  agent_name: string;
  action: string;
  created_at: string;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ users: 0, organizations: 0, candidates: 0, roles: 0, aiCallsToday: 0 });
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [usersCountRes, orgCountRes, candidateCountRes, roleCountRes, aiCallsRes, signupsRes, activityRes] = await Promise.all([
        supabase.schema('auth').from('users').select('id', { count: 'exact', head: true }),
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('roles').select('id', { count: 'exact', head: true }),
        supabase.from('agent_activity_log').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.schema('auth').from('users').select('id, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('agent_activity_log').select('id, agent_name, action, created_at').order('created_at', { ascending: false }).limit(10),
      ]);

      const anyError = usersCountRes.error || orgCountRes.error || candidateCountRes.error || roleCountRes.error || aiCallsRes.error || signupsRes.error || activityRes.error;
      if (anyError) {
        setError(anyError.message);
      }

      setStats({
        users: usersCountRes.count ?? 0,
        organizations: orgCountRes.count ?? 0,
        candidates: candidateCountRes.count ?? 0,
        roles: roleCountRes.count ?? 0,
        aiCallsToday: aiCallsRes.count ?? 0,
      });
      setRecentSignups((signupsRes.data as RecentSignup[]) ?? []);
      setRecentActivity((activityRes.data as ActivityItem[]) ?? []);
      setLoading(false);
    };

    void load();
  }, []);

  const cards = useMemo(
    () => [
      { label: 'Total Users', value: stats.users },
      { label: 'Total Organizations', value: stats.organizations },
      { label: 'Total Candidates', value: stats.candidates },
      { label: 'Total Roles', value: stats.roles },
      { label: 'AI Agent Calls Today', value: stats.aiCallsToday },
    ],
    [stats],
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Admin Dashboard</h1>
      </div>

      <div className="page-content space-y-6">
        {error && <div className="card p-4" style={{ color: 'var(--danger)' }}>Some admin metrics could not be loaded: {error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="card p-5">
              <p className="section-label">{card.label}</p>
              <p className="metric-value mt-2">{loading ? '—' : card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>Recent Signups</h2>
            <div className="mt-3 space-y-2">
              {recentSignups.map((signup) => (
                <div key={signup.id} className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>{signup.email}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDateTime(signup.created_at)}</span>
                </div>
              ))}
              {recentSignups.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No signups found.</p>}
            </div>
          </div>

          <div className="card p-5">
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>Recent Activity Feed</h2>
            <div className="mt-3 space-y-2">
              {recentActivity.map((item) => (
                <div key={item.id} className="border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                    <strong>{item.agent_name}</strong> — {item.action}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDateTime(item.created_at)}</p>
                </div>
              ))}
              {recentActivity.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No activity yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
