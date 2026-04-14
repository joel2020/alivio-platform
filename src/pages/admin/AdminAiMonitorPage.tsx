import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AgentRow {
  id: string;
  agent_name: string;
  action: string;
  created_at: string;
}

interface AgentBreakdown {
  agent_name: string;
  count: number;
}

export default function AdminAiMonitorPage() {
  const [counts, setCounts] = useState({ today: 0, week: 0, month: 0 });
  const [breakdown, setBreakdown] = useState<AgentBreakdown[]>([]);
  const [recent, setRecent] = useState<AgentRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      const monthStart = new Date(now);
      monthStart.setMonth(now.getMonth() - 1);

      const [todayRes, weekRes, monthRes, allRes, recentRes] = await Promise.all([
        supabase.from('agent_activity_log').select('id', { head: true, count: 'exact' }).gte('created_at', dayStart.toISOString()),
        supabase.from('agent_activity_log').select('id', { head: true, count: 'exact' }).gte('created_at', weekStart.toISOString()),
        supabase.from('agent_activity_log').select('id', { head: true, count: 'exact' }).gte('created_at', monthStart.toISOString()),
        supabase.from('agent_activity_log').select('agent_name'),
        supabase.from('agent_activity_log').select('id, agent_name, action, created_at').order('created_at', { ascending: false }).limit(20),
      ]);

      setCounts({
        today: todayRes.count ?? 0,
        week: weekRes.count ?? 0,
        month: monthRes.count ?? 0,
      });

      const grouped = new Map<string, number>();
      for (const row of allRes.data ?? []) {
        const key = row.agent_name;
        grouped.set(key, (grouped.get(key) ?? 0) + 1);
      }
      setBreakdown(Array.from(grouped.entries()).map(([agent_name, count]) => ({ agent_name, count })));
      setRecent((recentRes.data as AgentRow[]) ?? []);
    };

    void load();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Admin • AI Monitor</h1>
      </div>

      <div className="page-content space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5"><p className="section-label">Today</p><p className="metric-value">{counts.today}</p></div>
          <div className="card p-5"><p className="section-label">Week</p><p className="metric-value">{counts.week}</p></div>
          <div className="card p-5"><p className="section-label">Month</p><p className="metric-value">{counts.month}</p></div>
        </div>

        <div className="card p-5">
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>By Agent Type</h2>
          <div className="space-y-2">
            {breakdown.map((row) => (
              <div key={row.agent_name} className="flex items-center justify-between">
                <span>{row.agent_name}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Recent Activity</h2>
          <div className="space-y-2">
            {recent.map((row) => (
              <div key={row.id} className="border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                <p><strong>{row.agent_name}</strong> — {row.action}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(row.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
