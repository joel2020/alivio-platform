import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../lib/auth';
import { withNextParam } from '../../lib/nextRedirect';
import { supabase } from '../../lib/supabase';

interface HeaderTask {
  id: string;
  title: string;
}

interface HeaderEmail {
  id: string;
  subject: string | null;
}

export default function AppLayout() {
  const location = useLocation();
  const { session, loading, needsOrg, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [urgentTasks, setUrgentTasks] = useState<HeaderTask[]>([]);
  const [unreadEmails, setUnreadEmails] = useState<HeaderEmail[]>([]);

  useEffect(() => {
    if (!user?.org_id) return;
    Promise.all([
      supabase.from('tasks').select('id,title').eq('org_id', user.org_id).eq('priority', 'urgent').eq('status', 'open').order('created_at', { ascending: false }).limit(5),
      supabase.from('email_inbox').select('id,subject').eq('org_id', user.org_id).eq('processed', false).order('received_at', { ascending: false }).limit(5),
    ]).then(([taskRes, emailRes]) => {
      setUrgentTasks((taskRes.data || []) as HeaderTask[]);
      setUnreadEmails((emailRes.data || []) as HeaderEmail[]);
    });
  }, [user?.org_id]);

  const unreadCount = useMemo(() => urgentTasks.length + unreadEmails.length, [urgentTasks.length, unreadEmails.length]);

  async function handleOpenNotifications() {
    const next = !dropdownOpen;
    setDropdownOpen(next);
    if (next && user?.org_id && unreadEmails.length > 0) {
      const emailIds = unreadEmails.map((email) => email.id);
      await supabase.from('email_inbox').update({ processed: true }).in('id', emailIds).eq('org_id', user.org_id);
      setUnreadEmails([]);
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <div className="text-center space-y-4">
          <div
            className="w-8 h-8 rounded-md mx-auto flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)',
              boxShadow: '0 2px 8px rgba(26,108,247,0.35)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 9L5 3L8 7L9.5 5L11 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  backgroundColor: 'var(--accent)',
                  animationDelay: `${i * 150}ms`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={withNextParam('/login', location.pathname)} replace />;
  }

  if (needsOrg) {
    return <Navigate to={withNextParam('/onboarding/org', location.pathname)} replace />;
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <Sidebar />
      <main
        className="min-h-screen pt-14 md:pt-0"
        style={{ marginLeft: '0' }}
      >
        <div
          className="md:ml-[var(--sidebar-width)]"
        >
          <div className="hidden md:flex" style={{ height: '52px', justifyContent: 'flex-end', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 30, backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ position: 'relative' }}>
              <button
                className="btn-ghost"
                style={{ position: 'relative', padding: '6px 8px' }}
                onClick={() => void handleOpenNotifications()}
                aria-label="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 ? (
                  <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '999px', minWidth: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {unreadCount}
                  </span>
                ) : null}
              </button>
              {dropdownOpen ? (
                <div className="card" style={{ position: 'absolute', right: 0, top: '38px', width: '320px', padding: '12px', zIndex: 40 }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Urgent Tasks</p>
                  <ul style={{ margin: '8px 0', paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {urgentTasks.map((task) => <li key={task.id}><a href="/pipeline" style={{ color: 'inherit' }}>{task.title}</a></li>)}
                    {urgentTasks.length === 0 ? <li>No urgent tasks</li> : null}
                  </ul>
                  <a href="/pipeline" style={{ fontSize: '12px', color: 'var(--accent)' }}>View all tasks →</a>
                  <p style={{ margin: '10px 0 0', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Unread Emails</p>
                  <ul style={{ margin: '8px 0', paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {unreadEmails.map((email) => <li key={email.id}><a href="/admin/email-inbox" style={{ color: 'inherit' }}>{email.subject || 'No subject'}</a></li>)}
                    {unreadEmails.length === 0 ? <li>No unread emails</li> : null}
                  </ul>
                  <a href="/admin/email-inbox" style={{ fontSize: '12px', color: 'var(--accent)' }}>View all emails →</a>
                </div>
              ) : null}
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
