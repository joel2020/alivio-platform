import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface EmailRow {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  sent_at: string;
}

export default function AdminEmailsPage() {
  const [rows, setRows] = useState<EmailRow[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('outreach_history')
        .select('id, recipient, subject, status, sent_at')
        .order('sent_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setRows((data as EmailRow[]) ?? []);
    };

    void load();
  }, []);

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return rows;
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  const statuses = Array.from(new Set(rows.map((row) => row.status)));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Admin • Email History</h1>
      </div>

      <div className="page-content space-y-4">
        {error && (
          <div className="card p-4" style={{ color: 'var(--danger)' }}>
            Could not load outreach_history: {error}
          </div>
        )}

        <div className="card p-4">
          <label className="section-label">Filter by status</label>
          <select className="input mt-2" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                <th className="p-3">Recipient</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Status</th>
                <th className="p-3">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3">{row.recipient}</td>
                  <td className="p-3">{row.subject}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">{new Date(row.sent_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
