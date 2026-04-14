import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, GripVertical, Plus, Search, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import type { Client, ClientStatus } from '../../../lib/types';
import { ALL_CRM_STATUSES, CRM_STATUS_COLUMNS, canAccessCrm } from './crmShared';

interface ClientFormState {
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  title: string;
  location: string;
  source: string;
  notes: string;
}

const INITIAL_FORM: ClientFormState = {
  name: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  title: '',
  location: '',
  source: '',
  notes: '',
};

export default function CrmPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [draggingClientId, setDraggingClientId] = useState<string | null>(null);
  const [hoverStatus, setHoverStatus] = useState<ClientStatus | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<ClientFormState>(INITIAL_FORM);

  useEffect(() => {
    if (!user?.org_id || !canAccessCrm(user.role)) return;
    supabase
      .from('clients')
      .select('*')
      .eq('org_id', user.org_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setClients((data || []) as Client[]);
        setLoading(false);
      });
  }, [user?.org_id, user?.role]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (statusFilter !== 'all' && client.status !== statusFilter) return false;
      if (locationFilter !== 'all' && client.location !== locationFilter) return false;
      if (!search.trim()) return true;
      const text = `${client.name} ${client.contact_name} ${client.title || ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [clients, locationFilter, search, statusFilter]);

  const locations = useMemo(() => Array.from(new Set(clients.map((client) => client.location).filter(Boolean))) as string[], [clients]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      totalProspects: clients.filter((client) => client.status === 'prospect').length,
      contactedThisWeek: clients.filter((client) => client.last_contacted_at && new Date(client.last_contacted_at) >= weekAgo).length,
      meetingsScheduled: clients.filter((client) => client.status === 'meeting_scheduled').length,
      activeClients: clients.filter((client) => client.status === 'active_client').length,
    };
  }, [clients]);

  async function addClientFromModal() {
    if (!user?.org_id) return;
    if (!form.name.trim() || !form.contact_name.trim() || !form.contact_email.trim()) return;

    const { data } = await supabase.from('clients').insert({
      org_id: user.org_id,
      name: form.name.trim(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone.trim() || null,
      title: form.title.trim() || null,
      location: form.location.trim() || null,
      status: 'prospect',
      source: form.source.trim() || null,
      notes: form.notes.trim() || null,
      next_followup_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    }).select('*').single();

    if (data) {
      setClients((prev) => [data as Client, ...prev]);
      setShowCreateModal(false);
      setForm(INITIAL_FORM);
    }
  }

  async function moveClient(clientId: string, status: ClientStatus) {
    const { error } = await supabase.from('clients').update({ status }).eq('id', clientId);
    if (!error) setClients((prev) => prev.map((client) => (client.id === clientId ? { ...client, status } : client)));
  }

  function handleDrop(nextStatus: ClientStatus) {
    if (!draggingClientId) return;
    const current = clients.find((client) => client.id === draggingClientId);
    if (current && current.status !== nextStatus) void moveClient(draggingClientId, nextStatus);
    setDraggingClientId(null);
    setHoverStatus(null);
  }

  if (!canAccessCrm(user?.role)) {
    return <div className="min-h-screen p-8"><p style={{ color: 'var(--text-secondary)' }}>CRM is available only to admin/owner accounts.</p></div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header"><h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>CRM</h1></div>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px', marginBottom: '16px' }}>
          {[['Total prospects', stats.totalProspects], ['Contacted this week', stats.contactedThisWeek], ['Meetings scheduled', stats.meetingsScheduled], ['Active clients', stats.activeClients]].map(([label, value]) => (
            <div key={String(label)} className="card p-4">
              <p className="section-label">{label}</p><p className="metric-value">{value}</p>
            </div>
          ))}
        </div>

        <div className="card p-4" style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients" style={{ width: '100%', height: 38, padding: '0 10px 0 32px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-surface)' }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | ClientStatus)} style={{ height: 38, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px', background: 'var(--bg-surface)' }}>
            <option value="all">All statuses</option>
            {ALL_CRM_STATUSES.map((item) => <option key={item.status} value={item.status}>{item.label}</option>)}
          </select>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ height: 38, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px', background: 'var(--bg-surface)' }}>
            <option value="all">All locations</option>
            {locations.map((location) => <option key={location} value={location}>{location}</option>)}
          </select>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ height: 38, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={14} />Add new client</button>
          <Link to="/dashboard/crm/templates" className="btn-ghost" style={{ height: 38, padding: '0 14px', display: 'inline-flex', alignItems: 'center' }}>Templates</Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            {CRM_STATUS_COLUMNS.map((column) => (
              <div key={column.status} className="card p-3" style={{ minHeight: 320 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{column.label}</h3>
                {[0, 1, 2].map((item) => (
                  <div key={item} className="animate-pulse" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, background: 'var(--bg-subtle)', height: 86, marginBottom: 8 }} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            {CRM_STATUS_COLUMNS.map((column) => {
              const columnClients = filteredClients.filter((client) => client.status === column.status);
              return (
                <div
                  key={column.status}
                  className="card p-3"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setHoverStatus(column.status);
                  }}
                  onDragLeave={() => setHoverStatus(null)}
                  onDrop={() => handleDrop(column.status)}
                  style={{ minHeight: 320, borderColor: hoverStatus === column.status ? 'var(--accent)' : 'var(--border)', transition: 'border-color 0.2s ease' }}
                >
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{column.label}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {columnClients.map((client) => (
                      <div
                        key={client.id}
                        draggable
                        onDragStart={() => setDraggingClientId(client.id)}
                        onDragEnd={() => {
                          setDraggingClientId(null);
                          setHoverStatus(null);
                        }}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: 10,
                          background: draggingClientId === client.id ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                          opacity: draggingClientId === client.id ? 0.6 : 1,
                          transform: draggingClientId === client.id ? 'scale(0.98)' : 'scale(1)',
                          transition: 'all 160ms ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <Link to={`/dashboard/crm/${client.id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>{client.name}</Link>
                          <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{client.contact_name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.location}</p>
                        <div style={{ marginTop: 8 }}>
                          <select value={client.status} onChange={(e) => moveClient(client.id, e.target.value as ClientStatus)} style={{ width: '100%', height: 30, fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                            {ALL_CRM_STATUSES.map((status) => <option key={status.status} value={status.status}>{status.label}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                    {columnClients.length === 0 && (
                      <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                        <Building2 size={18} style={{ margin: '0 auto 6px', color: 'var(--text-muted)' }} />
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No {column.label.toLowerCase()} clients</p>
                        <button className="btn-secondary mt-2" style={{ fontSize: 12 }} onClick={() => setShowCreateModal(true)}><Plus size={12} /> Add Client</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {draggingClientId && (
        <div className="fixed right-4 bottom-4 px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent)', color: 'var(--accent)', zIndex: 30 }}>
          Move client to another status column
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="card p-5 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Add New Client</h2>
              <button className="btn-ghost" onClick={() => setShowCreateModal(false)}><X size={14} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input-base w-full" placeholder="Hospital/org name *" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              <input className="input-base w-full" placeholder="Contact name *" value={form.contact_name} onChange={(e) => setForm((prev) => ({ ...prev, contact_name: e.target.value }))} />
              <input className="input-base w-full" placeholder="Contact email *" type="email" value={form.contact_email} onChange={(e) => setForm((prev) => ({ ...prev, contact_email: e.target.value }))} />
              <input className="input-base w-full" placeholder="Contact phone" value={form.contact_phone} onChange={(e) => setForm((prev) => ({ ...prev, contact_phone: e.target.value }))} />
              <input className="input-base w-full" placeholder="Job title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
              <input className="input-base w-full" placeholder="Location" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
              <input className="input-base w-full" placeholder="Source" value={form.source} onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))} />
              <textarea className="input-base w-full md:col-span-2" rows={3} placeholder="Notes" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={addClientFromModal} disabled={!form.name.trim() || !form.contact_name.trim() || !form.contact_email.trim()}>Save Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
