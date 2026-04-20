import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import type { Client, OutreachHistoryItem } from '../../../lib/types';
import { canAccessCrm } from './crmShared';

export default function CrmClientPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<OutreachHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ subject: '', body: '' });
  const [generating, setGenerating] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !canAccessCrm(user?.role)) return;
    Promise.all([
      supabase.from('clients').select('*').eq('id', id).maybeSingle(),
      supabase.from('outreach_history').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    ]).then(([clientRes, historyRes]) => {
      setClient((clientRes.data || null) as Client | null);
      setHistory((historyRes.data || []) as OutreachHistoryItem[]);
      setLoading(false);
    });
  }, [id, user?.role]);

  const nextStep = useMemo(() => Math.min(3, history.filter((row) => row.status === 'sent').length + 1) as 1 | 2 | 3, [history]);

  async function saveNotes(notes: string) {
    if (!client) return;
    const { error } = await supabase.from('clients').update({ notes }).eq('id', client.id);
    if (!error) setClient({ ...client, notes });
  }

  async function generateWithAi() {
    if (!client) return;
    setGenerating(true);
    setSendError(null);
    const { data, error } = await supabase.functions.invoke<{ data: { subject: string; body: string } }>('generate-outreach', {
      body: {
        contact_name: client.contact_name,
        hospital_name: client.name,
        title: client.title,
        location: client.location,
        sequence_step: nextStep,
      },
    });
    if (error) {
      setSendError(error.message);
    } else if (data?.data) {
      setDraft({ subject: data.data.subject, body: data.data.body });
    }
    setGenerating(false);
  }

  async function sendOutreach() {
    if (!client || !draft.subject || !draft.body || !client.contact_email) return;

    const sendRes = await supabase.functions.invoke('send-outreach-email', {
      body: { to: client.contact_email, subject: draft.subject, body: draft.body },
    });
    if (sendRes.error) {
      setSendError(sendRes.error.message);
      return;
    }

    await supabase.from('outreach_history').insert({
      org_id: client.org_id,
      client_id: client.id,
      type: 'email',
      subject: draft.subject,
      message: draft.body,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    await supabase.from('clients').update({
      last_contacted_at: new Date().toISOString(),
      next_followup_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: client.status === 'prospect' ? 'contacted' : client.status,
    }).eq('id', client.id);

    setHistory((prev) => [{
      id: `${Date.now()}`,
      org_id: client.org_id,
      client_id: client.id,
      type: 'email',
      subject: draft.subject,
      message: draft.body,
      status: 'sent',
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }, ...prev]);
    setDraft({ subject: '', body: '' });
  }

  if (!canAccessCrm(user?.role)) return <div className="min-h-screen p-8">CRM is available only to admin/owner accounts.</div>;
  if (loading) return <div className="min-h-screen p-8">Loading...</div>;
  if (!client) return <div className="min-h-screen p-8">Client not found.</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header"><h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{client.name}</h1></div>
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 16 }}>
        <div className="card p-4">
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Contact details</h3>
          <p style={{ fontSize: 13 }}>{client.contact_name} · {client.title}</p>
          <p style={{ fontSize: 13 }}>{client.contact_email}</p>
          <p style={{ fontSize: 13 }}>{client.contact_phone}</p>
          <p style={{ fontSize: 13 }}>{client.location}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Next follow up: {client.next_followup_at ? new Date(client.next_followup_at).toLocaleDateString() : 'Not set'}</p>

          <h4 style={{ marginTop: 16, fontWeight: 700 }}>Notes</h4>
          <textarea defaultValue={client.notes || ''} onBlur={(e) => saveNotes(e.target.value)} rows={6} style={{ width: '100%', marginTop: 8, borderRadius: 8, border: '1px solid var(--border)', padding: 10, background: 'var(--bg-surface)' }} />
        </div>

        <div className="card p-4">
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Outreach</h3>
          <input value={draft.subject} onChange={(e) => setDraft((prev) => ({ ...prev, subject: e.target.value }))} placeholder="Subject" style={{ width: '100%', height: 36, marginBottom: 8, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }} />
          <textarea value={draft.body} onChange={(e) => setDraft((prev) => ({ ...prev, body: e.target.value }))} rows={7} placeholder="Email body" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)', padding: 10 }} />
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ height: 36, padding: '0 12px' }} onClick={sendOutreach}>Send Outreach</button>
            <button className="btn-ghost" style={{ height: 36, padding: '0 12px' }} onClick={generateWithAi} disabled={generating}>{generating ? 'Generating…' : 'Generate Email with AI'}</button>
          </div>
          {sendError ? <p style={{ marginTop: 8, color: 'var(--error)', fontSize: 12 }}>{sendError}</p> : null}
        </div>

        <div className="card p-4" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 10 }}>Outreach history timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((item) => (
              <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.type} · {item.status} · {new Date(item.created_at).toLocaleString()}</p>
                <p style={{ fontWeight: 600, fontSize: 13 }}>{item.subject}</p>
                <p style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{item.message}</p>
              </div>
            ))}
            {history.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No outreach history yet.</p>}
          </div>
          {sendError ? <p style={{ marginTop: 8, color: 'var(--error)', fontSize: 12 }}>{sendError}</p> : null}
        </div>
      </div>
    </div>
  );
}
