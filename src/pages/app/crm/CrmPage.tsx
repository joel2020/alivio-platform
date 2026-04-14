import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import type { Client, ClientStatus } from '../../../lib/types';
import { ALL_CRM_STATUSES, CRM_STATUS_COLUMNS, canAccessCrm } from './crmShared';

export default function CrmPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const [locationFilter, setLocationFilter] = useState('all');

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

  async function addClient() {
    if (!user?.org_id) return;
    const { data } = await supabase.from('clients').insert({
      org_id: user.org_id,
      name: 'New Hospital Prospect',
      contact_name: 'New Contact',
      status: 'prospect',
      next_followup_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Manual entry',
    }).select('*').single();

    if (data) setClients((prev) => [data as Client, ...prev]);
  }

  async function moveClient(clientId: string, status: ClientStatus) {
    const { error } = await supabase.from('clients').update({ status }).eq('id', clientId);
    if (!error) setClients((prev) => prev.map((client) => (client.id === clientId ? { ...client, status } : client)));
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
          <button onClick={addClient} className="btn-primary" style={{ height: 38, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={14} />Add new client</button>
          <Link to="/dashboard/crm/templates" className="btn-ghost" style={{ height: 38, padding: '0 14px', display: 'inline-flex', alignItems: 'center' }}>Templates</Link>
        </div>

        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            {CRM_STATUS_COLUMNS.map((column) => (
              <div key={column.status} className="card p-3" style={{ minHeight: 320 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{column.label}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredClients.filter((client) => client.status === column.status).map((client) => (
                    <div key={client.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, background: 'var(--bg-surface)' }}>
                      <Link to={`/dashboard/crm/${client.id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>{client.name}</Link>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{client.contact_name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.location}</p>
                      <div style={{ marginTop: 8 }}>
                        <select value={client.status} onChange={(e) => moveClient(client.id, e.target.value as ClientStatus)} style={{ width: '100%', height: 30, fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                          {ALL_CRM_STATUSES.map((status) => <option key={status.status} value={status.status}>{status.label}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {filteredClients.filter((client) => client.status === column.status).length === 0 && <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: 16, textAlign: 'center' }}><Building2 size={18} style={{ margin: '0 auto 6px', color: 'var(--text-muted)' }} /><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No clients</p></div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
