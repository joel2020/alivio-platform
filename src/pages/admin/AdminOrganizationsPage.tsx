import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AdminOrgRow {
  id: string;
  name: string;
  created_at: string;
  roleCount: number;
  candidateCount: number;
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<AdminOrgRow[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<AdminOrgRow | null>(null);

  useEffect(() => {
    const load = async () => {
      const orgRes = await supabase.from('organizations').select('id, name, created_at').order('created_at', { ascending: false });
      if (orgRes.error || !orgRes.data) return;

      const rows = await Promise.all(
        orgRes.data.map(async (org) => {
          const [rolesRes, candidatesRes] = await Promise.all([
            supabase.from('roles').select('id', { count: 'exact', head: true }).eq('org_id', org.id),
            supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('org_id', org.id),
          ]);

          return {
            id: org.id,
            name: org.name,
            created_at: org.created_at,
            roleCount: rolesRes.count ?? 0,
            candidateCount: candidatesRes.count ?? 0,
          };
        }),
      );

      setOrgs(rows);
    };

    void load();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Admin • Organizations</h1>
      </div>

      <div className="page-content space-y-4">
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                <th className="p-3">Name</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Role Count</th>
                <th className="p-3">Candidate Count</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{org.name}</td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{new Date(org.created_at).toLocaleString()}</td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{org.roleCount}</td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{org.candidateCount}</td>
                  <td className="p-3">
                    <button className="btn-secondary" onClick={() => setSelectedOrg(org)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedOrg && (
          <div className="card p-4">
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedOrg.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}><strong>Created:</strong> {new Date(selectedOrg.created_at).toLocaleString()}</p>
            <p style={{ color: 'var(--text-secondary)' }}><strong>Roles:</strong> {selectedOrg.roleCount}</p>
            <p style={{ color: 'var(--text-secondary)' }}><strong>Candidates:</strong> {selectedOrg.candidateCount}</p>
          </div>
        )}
      </div>
    </div>
  );
}
