import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface CrmEntry {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  sent_at: string;
}

export default function AdminCrmPage() {
  const [items, setItems] = useState<CrmEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('outreach_history')
        .select('id, recipient, subject, status, sent_at')
        .order('sent_at', { ascending: false })
        .limit(25);

      if (error) {
        setError(error.message);
        return;
      }

      setItems((data as CrmEntry[]) ?? []);
    };

    void load();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Admin • CRM</h1>
      </div>

      <div className="page-content">
        {error && (
          <div className="card p-4" style={{ color: 'var(--danger)' }}>
            Could not load CRM records from outreach_history: {error}
          </div>
        )}

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
              {items.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3">{item.recipient}</td>
                  <td className="p-3">{item.subject}</td>
                  <td className="p-3">{item.status}</td>
                  <td className="p-3">{new Date(item.sent_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
