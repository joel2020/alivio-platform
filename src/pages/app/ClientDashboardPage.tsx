import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Clock, Users, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Candidate, Role } from '../../lib/types';

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    if (!user?.org_id) return;
    Promise.all([
      supabase.from('roles').select('*').eq('org_id', user.org_id),
      supabase.from('candidates').select('*').eq('org_id', user.org_id),
    ]).then(([r, c]) => {
      setRoles((r.data || []) as Role[]);
      setCandidates((c.data || []) as Candidate[]);
    });
  }, [user?.org_id]);

  const metrics = useMemo(() => {
    const submitted = candidates.filter(c => c.pipeline_stage === 'submitted').length;
    const interviews = candidates.filter(c => c.pipeline_stage === 'interview').length;
    const offers = candidates.filter(c => c.pipeline_stage === 'offer').length;
    const hires = candidates.filter(c => c.pipeline_stage === 'hired').length;
    return { submitted, interviews, offers, hires };
  }, [candidates]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: 15, fontWeight: 700 }}>Client Dashboard</h1>
      </div>

      <div className="page-content" style={{ maxWidth: 1000 }}>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="card p-4"><Users /> {metrics.submitted} Submitted</div>
          <div className="card p-4"><Clock /> {metrics.interviews} Interviews</div>
          <div className="card p-4"><BarChart3 /> {metrics.offers} Offers</div>
          <div className="card p-4"><CheckCircle2 /> {metrics.hires} Hires</div>
        </div>

        <div className="card p-4">
          <h2 style={{ fontWeight: 600 }}>Active Roles</h2>
          {roles.map(role => (
            <div key={role.id} style={{ padding: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600 }}>{role.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{role.location}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
