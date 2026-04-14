import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import type { EmailInboxRow, EmailProcessingStatus, ResumeAttachment } from '../../../lib/types';

const STATUS_OPTIONS: Array<'all' | EmailProcessingStatus> = ['all', 'pending', 'processing', 'completed', 'failed', 'ignored'];

const badgeStyle: Record<EmailProcessingStatus, { background: string; color: string }> = {
  completed: { background: 'rgba(22,163,74,0.16)', color: '#16a34a' },
  pending: { background: 'rgba(100,116,139,0.16)', color: '#64748b' },
  processing: { background: 'rgba(234,179,8,0.16)', color: '#ca8a04' },
  failed: { background: 'rgba(239,68,68,0.16)', color: '#dc2626' },
  ignored: { background: 'rgba(107,114,128,0.16)', color: '#6b7280' },
};

export default function EmailInboxPage() {
  const { user, supabaseUser } = useAuth();
  const [canAccess, setCanAccess] = useState(false);
  const [emails, setEmails] = useState<EmailInboxRow[]>([]);
  const [attachments, setAttachments] = useState<ResumeAttachment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EmailProcessingStatus>('all');
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    let cancelled = false;
    if (!supabaseUser) {
      setCanAccess(false);
      return;
    }
    supabase.rpc('is_platform_admin').then(({ data, error }) => {
      if (!cancelled) setCanAccess(!error && !!data);
    });
    return () => { cancelled = true; };
  }, [supabaseUser]);
  async function loadInbox() {
    if (!user?.org_id || !canAccess) return;
    setLoading(true);
    const [{ data: emailData }, { data: attachmentData }] = await Promise.all([
      supabase
        .from('email_inbox')
        .select('*')
        .eq('org_id', user.org_id)
        .order('received_at', { ascending: false })
        .limit(500),
      supabase
        .from('resume_attachments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000),
    ]);
    setEmails((emailData || []) as EmailInboxRow[]);
    setAttachments((attachmentData || []) as ResumeAttachment[]);
    if (!selectedId && emailData?.[0]?.id) setSelectedId(emailData[0].id);
    setLoading(false);
  }

  useEffect(() => {
    loadInbox();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.org_id, canAccess]);

  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      if (statusFilter !== 'all' && email.processing_status !== statusFilter) return false;
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return `${email.from_name || ''} ${email.from_email || ''} ${email.subject || ''}`.toLowerCase().includes(query);
    });
  }, [emails, search, statusFilter]);

  const selectedEmail = useMemo(() => emails.find((item) => item.id === selectedId) || null, [emails, selectedId]);
  const selectedAttachments = useMemo(() => attachments.filter((item) => item.email_id === selectedId), [attachments, selectedId]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    return {
      totalToday: emails.filter((item) => (item.received_at || '').startsWith(today)).length,
      resumesToday: emails.filter((item) => item.classification === 'resume_submission' && (item.received_at || '').startsWith(today)).length,
      candidatesWeek: emails.filter((item) => !!item.candidate_id && new Date(item.created_at) >= weekAgo).length,
      clientInquiriesWeek: emails.filter((item) => item.classification === 'client_inquiry' && new Date(item.created_at) >= weekAgo).length,
    };
  }, [emails]);

  async function invoke(functionName: string, payload: Record<string, unknown>) {
    await supabase.functions.invoke(functionName, { body: payload });
    await loadInbox();
  }

  async function updateStatus(status: EmailProcessingStatus) {
    if (!selectedEmail) return;
    await supabase.from('email_inbox').update({ processing_status: status, processed: status === 'ignored' || status === 'completed' }).eq('id', selectedEmail.id);
    await loadInbox();
  }

  if (!canAccess) {
    return <div className="min-h-screen p-8"><p style={{ color: 'var(--text-secondary)' }}>Email Inbox is restricted to platform admin accounts.</p></div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header"><h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Email Inbox</h1></div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 16 }}>
          {[
            ['Total emails today', stats.totalToday],
            ['Resumes parsed today', stats.resumesToday],
            ['Candidates added this week', stats.candidatesWeek],
            ['Client inquiries this week', stats.clientInquiriesWeek],
          ].map(([label, value]) => (
            <div key={String(label)} className="card p-4">
              <p className="section-label">{label}</p><p className="metric-value">{value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,420px) 1fr', gap: 16 }}>
          <div className="card p-4" style={{ height: 'calc(100vh - 220px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails" style={{ width: '100%', height: 38, padding: '0 10px 0 32px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-surface)' }} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | EmailProcessingStatus)} style={{ height: 38, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px', background: 'var(--bg-surface)' }}>
                {STATUS_OPTIONS.map((item) => <option key={item} value={item}>{item === 'all' ? 'All statuses' : item}</option>)}
              </select>
              <button className="btn-ghost" style={{ height: 38 }} onClick={loadInbox}><RefreshCw size={14} /></button>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loading && <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Loading inbox…</p>}
              {!loading && filteredEmails.map((email) => (
                <button key={email.id} onClick={() => setSelectedId(email.id)} style={{ textAlign: 'left', border: `1px solid ${selectedId === email.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, padding: 10, background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{email.from_name || email.from_email}</p>
                    <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 999, ...badgeStyle[email.processing_status] }}>{email.processing_status}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{email.subject || '(No subject)'}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{new Date(email.received_at || email.created_at).toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4" style={{ minHeight: 'calc(100vh - 220px)' }}>
            {!selectedEmail ? <p style={{ color: 'var(--text-muted)' }}>Select an email to view details.</p> : (
              <>
                <h2 style={{ marginTop: 0, marginBottom: 8, color: 'var(--text-primary)', fontSize: 16 }}>{selectedEmail.subject || '(No subject)'}</h2>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>From: {selectedEmail.from_name || 'Unknown'} ({selectedEmail.from_email || 'unknown'})</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>Received: {new Date(selectedEmail.received_at || selectedEmail.created_at).toLocaleString()}</p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, marginBottom: 12 }}>
                  <button className="btn-primary" onClick={() => invoke('ai-process-email', { email_id: selectedEmail.id })}>Process Now</button>
                  <button className="btn-ghost" onClick={() => updateStatus('ignored')}>Mark as Ignored</button>
                  <button className="btn-ghost" onClick={() => updateStatus('pending')}>Reprocess</button>
                  <button className="btn-ghost" onClick={() => invoke('email-pipeline', {})}>Add to CRM</button>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 12, background: 'var(--bg-surface)' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700 }}>AI classification</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Type: {selectedEmail.classification}</p>
                  <pre style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(selectedEmail.classification_data || {}, null, 2)}</pre>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 12, background: 'var(--bg-surface)' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700 }}>Attachments</p>
                  {selectedAttachments.length === 0 ? <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>No attachments</p> : selectedAttachments.map((attachment) => (
                    <div key={attachment.id} style={{ marginBottom: 10 }}>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary)' }}>{attachment.file_name} ({attachment.file_type})</p>
                      {attachment.parsed_data && Object.keys(attachment.parsed_data).length > 0 && <pre style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(attachment.parsed_data, null, 2)}</pre>}
                    </div>
                  ))}
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--bg-surface)' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700 }}>Email body</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selectedEmail.body_text || '(No plain text body)'}</p>
                </div>

                {selectedEmail.candidate_id && (
                  <p style={{ marginTop: 12, fontSize: 12 }}>
                    Candidate profile: <Link to={`/candidates/${selectedEmail.candidate_id}`}>{selectedEmail.candidate_id}</Link>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
