import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardCopy, FileBarChart2, ListChecks, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Role, Client } from '../../lib/types';
import Toast from '../../components/app/Toast';

/**
 * Client deliverables hub: candidate shortlists (shared with clients by
 * token link, decisions flow back) and weekly client reports.
 */

interface ShortlistRow {
  id: string;
  role_id: string | null;
  client_id: string | null;
  title: string;
  share_token: string;
  status: string;
  created_at: string;
  roles: { title: string } | null;
  clients: { name: string } | null;
  client_shortlist_candidates: Array<{ id: string; client_decision: string | null }>;
}

interface ReportRow {
  id: string;
  role_id: string | null;
  client_id: string | null;
  week_start: string;
  week_end: string;
  candidates_sourced: number;
  candidates_screened: number;
  candidates_shortlisted: number;
  candidates_submitted: number;
  summary: string | null;
  share_token: string;
  status: string;
  created_at: string;
  roles: { title: string } | null;
  clients: { name: string } | null;
}

interface MatchOption {
  id: string;
  match_score: number | null;
  reasons: string[] | null;
  candidates: { full_name: string; current_title: string | null; current_company: string | null } | null;
}

function newToken() {
  return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '');
}

function shareUrl(path: string, token: string) {
  return `${window.location.origin}${path}/${token}`;
}

export default function ShortlistsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'shortlists' | 'reports'>('shortlists');
  const [shortlists, setShortlists] = useState<ShortlistRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const load = useCallback(() => {
    if (!user?.org_id) return;
    setLoading(true);
    Promise.all([
      supabase
        .from('client_shortlists')
        .select('*, roles(title), clients(name), client_shortlist_candidates(id, client_decision)')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false }),
      supabase
        .from('weekly_client_reports')
        .select('*, roles(title), clients(name)')
        .eq('org_id', user.org_id)
        .order('week_start', { ascending: false }),
      supabase.from('roles').select('*').eq('org_id', user.org_id).order('created_at', { ascending: false }),
      supabase.from('clients').select('*').eq('org_id', user.org_id).order('name'),
    ]).then(([shortlistRes, reportRes, roleRes, clientRes]) => {
      setShortlists((shortlistRes.data as ShortlistRow[]) ?? []);
      setReports((reportRes.data as ReportRow[]) ?? []);
      setRoles((roleRes.data as Role[]) ?? []);
      setClients((clientRes.data as Client[]) ?? []);
      setLoading(false);
    });
  }, [user?.org_id]);

  useEffect(load, [load]);

  function copyLink(path: string, token: string) {
    void navigator.clipboard.writeText(shareUrl(path, token)).then(
      () => setToast('Share link copied to clipboard.'),
      () => setToast(shareUrl(path, token)),
    );
  }

  const decisionSummary = (rows: ShortlistRow['client_shortlist_candidates']) => {
    const decided = rows.filter((row) => row.client_decision && row.client_decision !== 'pending').length;
    return `${rows.length} candidate${rows.length === 1 ? '' : 's'} · ${decided} decision${decided === 1 ? '' : 's'}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header flex items-center justify-between flex-wrap gap-2">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Client Deliverables</h1>
        <div className="flex gap-2">
          <button className="btn-primary" style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => (tab === 'shortlists' ? setCreateOpen(true) : setReportOpen(true))}>
            <Plus size={14} /> {tab === 'shortlists' ? 'New shortlist' : 'Generate report'}
          </button>
        </div>
      </div>

      <div className="page-content space-y-4">
        <div className="card p-3 flex gap-2">
          <button className={tab === 'shortlists' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setTab('shortlists')}>
            <ListChecks size={14} /> Shortlists
          </button>
          <button className={tab === 'reports' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setTab('reports')}>
            <FileBarChart2 size={14} /> Weekly reports
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading…</p>
        ) : tab === 'shortlists' ? (
          shortlists.length === 0 ? (
            <div className="card p-6 text-center">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No shortlists yet. Create one from a role&apos;s matched candidates and share the link with your client.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shortlists.map((shortlist) => (
                <div key={shortlist.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{shortlist.title}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 2 }}>
                      {shortlist.roles?.title ?? 'No role'} · {shortlist.clients?.name ?? 'No client'} · {decisionSummary(shortlist.client_shortlist_candidates)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--accent)', backgroundColor: 'var(--accent-subtle)', borderRadius: 999, padding: '3px 10px' }}>
                      {shortlist.status}
                    </span>
                    <button className="btn-secondary" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => copyLink('/client/shortlist', shortlist.share_token)}>
                      <ClipboardCopy size={13} /> Copy client link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : reports.length === 0 ? (
          <div className="card p-6 text-center">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No weekly reports yet. Generate one to summarize the week&apos;s pipeline activity for a client.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Week of {report.week_start} — {report.roles?.title ?? 'All roles'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 2 }}>
                    {report.clients?.name ?? 'No client'} · {report.candidates_sourced} sourced · {report.candidates_screened} screened · {report.candidates_submitted} submitted
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--accent)', backgroundColor: 'var(--accent-subtle)', borderRadius: 999, padding: '3px 10px' }}>
                    {report.status}
                  </span>
                  <button className="btn-secondary" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => copyLink('/client/report', report.share_token)}>
                    <ClipboardCopy size={13} /> Copy client link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createOpen ? (
        <CreateShortlistModal
          roles={roles}
          clients={clients}
          onClose={() => setCreateOpen(false)}
          onCreated={(token) => {
            setCreateOpen(false);
            load();
            copyLink('/client/shortlist', token);
          }}
        />
      ) : null}

      {reportOpen ? (
        <GenerateReportModal
          roles={roles}
          clients={clients}
          onClose={() => setReportOpen(false)}
          onCreated={(token) => {
            setReportOpen(false);
            load();
            copyLink('/client/report', token);
          }}
        />
      ) : null}

      {toast ? <Toast message={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}

function CreateShortlistModal({
  roles,
  clients,
  onClose,
  onCreated,
}: {
  roles: Role[];
  clients: Client[];
  onClose: () => void;
  onCreated: (token: string) => void;
}) {
  const { user } = useAuth();
  const [roleId, setRoleId] = useState('');
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roleId) {
      setMatches([]);
      setSelectedIds(new Set());
      return;
    }
    supabase
      .from('candidate_role_matches')
      .select('id, match_score, reasons, candidates(full_name, current_title, current_company)')
      .eq('role_id', roleId)
      .order('match_score', { ascending: false })
      .then(({ data }) => {
        setMatches((data as unknown as MatchOption[]) ?? []);
        setSelectedIds(new Set());
      });
    const role = roles.find((item) => item.id === roleId);
    if (role) setTitle(`${role.title} — candidate shortlist`);
  }, [roleId, roles]);

  const toggle = (matchId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
  };

  async function create() {
    if (!user?.org_id || !roleId || selectedIds.size === 0 || !title.trim()) {
      setError('Pick a role, at least one candidate, and a title.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = newToken();
      const { data: shortlist, error: shortlistError } = await supabase
        .from('client_shortlists')
        .insert({
          org_id: user.org_id,
          role_id: roleId,
          client_id: clientId || null,
          title: title.trim(),
          share_token: token,
          status: 'active',
          created_by: user.id,
        })
        .select('id, share_token')
        .single();
      if (shortlistError) throw shortlistError;

      const selected = matches.filter((match) => selectedIds.has(match.id));
      const { error: candidatesError } = await supabase.from('client_shortlist_candidates').insert(
        selected.map((match, index) => ({
          shortlist_id: shortlist.id,
          candidate_match_id: match.id,
          display_name: match.candidates?.full_name ?? 'Candidate',
          summary:
            match.reasons && match.reasons.length > 0
              ? match.reasons.join(' ')
              : [match.candidates?.current_title, match.candidates?.current_company].filter(Boolean).join(' at ') || null,
          display_order: index,
          client_decision: 'pending',
        })),
      );
      if (candidatesError) throw candidatesError;

      onCreated(shortlist.share_token);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create the shortlist.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(9,9,11,0.45)' }}>
      <div className="card w-full max-w-2xl" style={{ padding: 20, maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>New client shortlist</h2>
          <button className="btn-ghost" type="button" aria-label="Close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="space-y-3">
          <select className="input-base w-full" value={roleId} onChange={(event) => setRoleId(event.target.value)} aria-label="Role">
            <option value="">Select role…</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.title}</option>
            ))}
          </select>
          <select className="input-base w-full" value={clientId} onChange={(event) => setClientId(event.target.value)} aria-label="Client">
            <option value="">No client (internal)</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <input className="input-base w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Shortlist title" aria-label="Shortlist title" />

          {roleId ? (
            matches.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                No matched candidates for this role yet. Run matching from the role pipeline first.
              </p>
            ) : (
              <div className="rounded-lg border" style={{ borderColor: 'var(--border)', maxHeight: 260, overflowY: 'auto' }}>
                {matches.map((match) => (
                  <label key={match.id} className="flex items-start gap-3 p-3 border-b cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                    <input type="checkbox" checked={selectedIds.has(match.id)} onChange={() => toggle(match.id)} style={{ marginTop: 3 }} />
                    <span>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {match.candidates?.full_name ?? 'Candidate'}
                        {match.match_score != null ? <span style={{ color: 'var(--accent)', marginLeft: 8 }}>{Math.round(match.match_score)}</span> : null}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {[match.candidates?.current_title, match.candidates?.current_company].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )
          ) : null}

          {error ? <p style={{ color: 'var(--error)', fontSize: '0.8125rem' }}>{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="btn-primary" type="button" disabled={saving} onClick={() => void create()}>
              {saving ? 'Creating…' : `Create shortlist (${selectedIds.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerateReportModal({
  roles,
  clients,
  onClose,
  onCreated,
}: {
  roles: Role[];
  clients: Client[];
  onClose: () => void;
  onCreated: (token: string) => void;
}) {
  const { user } = useAuth();
  const [roleId, setRoleId] = useState('');
  const [clientId, setClientId] = useState('');
  const [weekEnd, setWeekEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekStart = useMemo(() => {
    const end = new Date(`${weekEnd}T00:00:00`);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return start.toISOString().slice(0, 10);
  }, [weekEnd]);

  async function generate() {
    if (!user?.org_id || !roleId) {
      setError('Pick a role for the report.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const startIso = `${weekStart}T00:00:00Z`;
      const endIso = `${weekEnd}T23:59:59Z`;

      const [sourced, screened, submitted, shortlisted, scheduled] = await Promise.all([
        supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('role_id', roleId).gte('created_at', startIso).lte('created_at', endIso),
        supabase.from('voice_calls').select('id', { count: 'exact', head: true }).eq('role_id', roleId).eq('status', 'completed').gte('created_at', startIso).lte('created_at', endIso),
        supabase.from('candidate_role_matches').select('id', { count: 'exact', head: true }).eq('role_id', roleId).not('submitted_at', 'is', null).gte('submitted_at', startIso).lte('submitted_at', endIso),
        supabase.from('client_shortlists').select('id, client_shortlist_candidates(id)').eq('role_id', roleId).gte('created_at', startIso).lte('created_at', endIso),
        supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('role_id', roleId).eq('pipeline_stage', 'scheduled'),
      ]);

      const shortlistedCount = ((shortlisted.data as Array<{ client_shortlist_candidates: Array<{ id: string }> }>) ?? []).reduce(
        (total, row) => total + row.client_shortlist_candidates.length,
        0,
      );

      const role = roles.find((item) => item.id === roleId);
      const autoSummary =
        summary.trim() ||
        `Week of ${weekStart}: sourced ${sourced.count ?? 0} new candidates for ${role?.title ?? 'the role'}, completed ${screened.count ?? 0} screening calls, added ${shortlistedCount} candidates to client shortlists, and submitted ${submitted.count ?? 0} for review.`;

      const token = newToken();
      const { data, error: insertError } = await supabase
        .from('weekly_client_reports')
        .insert({
          org_id: user.org_id,
          role_id: roleId,
          client_id: clientId || null,
          week_start: weekStart,
          week_end: weekEnd,
          candidates_sourced: sourced.count ?? 0,
          candidates_screened: screened.count ?? 0,
          candidates_shortlisted: shortlistedCount,
          candidates_submitted: submitted.count ?? 0,
          interviews_scheduled: scheduled.count ?? 0,
          summary: autoSummary,
          share_token: token,
          status: 'draft',
        })
        .select('share_token')
        .single();
      if (insertError) throw insertError;
      onCreated(data.share_token);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Could not generate the report.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(9,9,11,0.45)' }}>
      <div className="card w-full max-w-xl" style={{ padding: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Generate weekly report</h2>
          <button className="btn-ghost" type="button" aria-label="Close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="space-y-3">
          <select className="input-base w-full" value={roleId} onChange={(event) => setRoleId(event.target.value)} aria-label="Role">
            <option value="">Select role…</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.title}</option>
            ))}
          </select>
          <select className="input-base w-full" value={clientId} onChange={(event) => setClientId(event.target.value)} aria-label="Client">
            <option value="">No client (internal)</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }} htmlFor="report-week-end">
              Week ending (7-day window: {weekStart} → {weekEnd})
            </label>
            <input id="report-week-end" type="date" className="input-base w-full" value={weekEnd} onChange={(event) => setWeekEnd(event.target.value)} />
          </div>
          <textarea
            className="input-base w-full"
            rows={3}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Optional summary override (auto-generated from the week's activity if left blank)"
            aria-label="Summary"
          />
          {error ? <p style={{ color: 'var(--error)', fontSize: '0.8125rem' }}>{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="btn-primary" type="button" disabled={saving} onClick={() => void generate()}>
              {saving ? 'Generating…' : 'Generate & copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
