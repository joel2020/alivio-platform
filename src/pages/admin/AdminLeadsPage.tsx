import { useEffect, useMemo, useState } from 'react';
import { Mail, Building2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/app/Toast';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'spam';

interface Lead {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  company: string | null;
  role: string | null;
  service: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
}

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'closed', 'spam'];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#2563EB',
  contacted: '#F97316',
  qualified: '#16A34A',
  closed: '#6B7280',
  spam: '#DC2626',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | LeadStatus>('new');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  function load() {
    setLoading(true);
    supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (loadError) {
          setError(loadError.message);
        } else {
          setError(null);
          setLeads((data as Lead[]) ?? []);
        }
        setLoading(false);
      });
  }

  useEffect(load, []);

  const stats = useMemo(
    () => Object.fromEntries(STATUSES.map((status) => [status, leads.filter((lead) => lead.status === status).length])) as Record<LeadStatus, number>,
    [leads],
  );

  const visible = useMemo(
    () => (activeTab === 'all' ? leads : leads.filter((lead) => lead.status === activeTab)),
    [activeTab, leads],
  );

  async function updateLead(leadId: string, patch: Partial<Pick<Lead, 'status' | 'notes'>>) {
    const { error: updateError } = await supabase.from('leads').update(patch).eq('id', leadId);
    if (updateError) {
      setToast(`Update failed: ${updateError.message}`);
      return;
    }
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, ...patch } : lead)));
    setSelected((prev) => (prev && prev.id === leadId ? { ...prev, ...patch } : prev));
    setToast('Lead updated.');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header flex items-center justify-between">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Admin • Inbound Leads</h1>
        <button className="btn-ghost" onClick={load} aria-label="Refresh leads"><RefreshCw size={14} /></button>
      </div>

      <div className="page-content space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {STATUSES.map((status) => (
            <div key={status} className="card p-4">
              <p className="section-label" style={{ color: STATUS_COLORS[status], textTransform: 'capitalize' }}>{status}</p>
              <p className="metric-value mt-1">{stats[status]}</p>
            </div>
          ))}
        </div>

        <div className="card p-4 flex items-center gap-2 flex-wrap">
          {(['new', 'contacted', 'qualified', 'closed', 'spam', 'all'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'btn-primary' : 'btn-ghost'}
              style={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading leads…</p>
        ) : error ? (
          <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>Unable to load leads: {error}</p>
        ) : visible.length === 0 ? (
          <div className="card p-6 text-center">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No {activeTab === 'all' ? '' : activeTab + ' '}leads yet. Marketing forms on the website write here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => {
                  setSelected(lead);
                  setNotesDraft(lead.notes ?? '');
                }}
                className="card p-4 w-full text-left"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {lead.name ?? 'Unknown'}
                      {lead.company ? <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> · {lead.company}</span> : null}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 2 }}>
                      {lead.service ?? 'General inquiry'} · via {lead.source ?? 'website'} · {formatDate(lead.created_at)}
                    </p>
                  </div>
                  <span style={{ backgroundColor: `${STATUS_COLORS[lead.status]}1A`, color: STATUS_COLORS[lead.status], borderRadius: 999, padding: '3px 10px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'capitalize' }}>
                    {lead.status}
                  </span>
                </div>
                {lead.message ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.message}</p>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-40" style={{ backgroundColor: 'rgba(9,9,11,0.25)' }}>
          <div className="absolute inset-0" onClick={() => setSelected(null)} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Lead detail</p>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name ?? 'Unknown'}</h2>
              </div>
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="card p-4 space-y-2">
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={13} /> {selected.email ?? '—'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={13} /> {selected.company ?? '—'}{selected.role ? ` · ${selected.role}` : ''}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Service: {selected.service ?? '—'}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Source: {selected.source ?? 'website'} · {formatDate(selected.created_at)}</p>
              </div>
              <div className="card p-4">
                <p className="section-label mb-2">Message</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{selected.message ?? '—'}</p>
              </div>
              <div className="card p-4">
                <p className="section-label mb-2">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={selected.status === status ? 'btn-primary' : 'btn-secondary'}
                      style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                      onClick={() => void updateLead(selected.id, { status })}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card p-4">
                <p className="section-label mb-2">Notes</p>
                <textarea
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  rows={4}
                  className="input-base w-full"
                  placeholder="Internal notes about this lead"
                  style={{ fontSize: '0.8125rem' }}
                />
                <button className="btn-primary mt-2" style={{ fontSize: '0.75rem' }} onClick={() => void updateLead(selected.id, { notes: notesDraft.trim() || null })}>
                  Save notes
                </button>
              </div>
              <a className="btn-secondary inline-block" style={{ fontSize: '0.75rem' }} href={`mailto:${selected.email ?? ''}`}>Reply by email</a>
            </div>
          </aside>
        </div>
      ) : null}

      {toast ? <Toast message={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}
