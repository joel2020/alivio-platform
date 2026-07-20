import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitBranch, Briefcase, Mail, Zap, Settings, LogOut, Menu, X, Sun, Moon, Building2, Shield, Inbox, PhoneCall } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, org, signOut, supabaseUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeRoleCount, setActiveRoleCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    if (!user?.org_id) return;
    supabase
      .from('roles')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', user.org_id)
      .eq('status', 'active')
      .then(({ count }) => setActiveRoleCount(count ?? 0));
  }, [user?.org_id]);

  useEffect(() => {
    let cancelled = false;
    if (!supabaseUser) {
      setIsPlatformAdmin(false);
      return;
    }
    supabase.rpc('is_platform_admin').then(({ data, error }) => {
      if (!cancelled) setIsPlatformAdmin(!error && !!data);
    });
    return () => { cancelled = true; };
  }, [supabaseUser]);

  const isAdminUser = isPlatformAdmin;
  const adminNavItems = [
    { label: 'Admin Dashboard', href: '/admin', icon: Shield },
    { label: 'Email Inbox', href: '/admin/email-inbox', icon: Inbox },
    { label: 'Tasks', href: '/admin/tasks', icon: LayoutDashboard },
    { label: 'Leads', href: '/admin/leads', icon: Inbox },
    { label: 'CRM', href: '/crm', icon: Building2 },
    { label: 'Users', href: '/admin/users', icon: Briefcase },
    { label: 'AI Monitor', href: '/admin/ai-monitor', icon: Zap },
    { label: 'Blog Manager', href: '/admin/blog', icon: Mail },
  ];

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pipeline', href: '/pipeline', icon: GitBranch },
    { label: 'Roles', href: '/roles', icon: Briefcase, badge: activeRoleCount },
    { label: 'Outreach', href: '/outreach', icon: Mail },
    { label: 'Calls', href: '/calls', icon: PhoneCall },
    { label: 'CRM', href: '/crm', icon: Building2 },
    { label: 'Agents', href: '/agents', icon: Zap },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  function isItemActive(href: string) {
    if (href === '/crm') return location.pathname === '/crm' || location.pathname.startsWith('/crm/') || location.pathname.startsWith('/dashboard/crm');
    return location.pathname === href || location.pathname.startsWith(href + '/');
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-14 px-5 flex items-center border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)', boxShadow: '0 1px 4px rgba(26,108,247,0.4)' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 9L5 3L8 7L9.5 5L11 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '-0.025em' }}>Alivio</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          return (
            <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className={`nav-item${isActive ? ' active' : ''}`}>
              <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex-shrink-0 text-xs px-1.5 py-px rounded font-semibold" style={{ backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-subtle)', color: isActive ? '#fff' : 'var(--text-muted)', fontSize: '0.625rem', lineHeight: '1.4' }}>{item.badge}</span>
              )}
            </Link>
          );
        })}
        {isAdminUser && (
          <div className="pt-3 mt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 px-2 pb-1.5" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}><Shield size={12} />Admin</div>
            <div className="space-y-0.5">
              {adminNavItems.map((item) => {
                const isAdminActive = isItemActive(item.href);
                const AdminIcon = item.icon;
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className={`nav-item${isAdminActive ? ' active' : ''}`}>
                    <AdminIcon size={14} strokeWidth={isAdminActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <div className="flex-shrink-0 border-t px-3 py-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: 'var(--accent)', fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.03em' }}>{user ? getInitials(user.full_name) : 'U'}</div>
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3 }}>{user?.full_name || 'User'}</p>
            <p className="truncate" style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', lineHeight: 1.3 }}>{org?.name || ''}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={toggleTheme} className="btn-ghost justify-start w-full" style={{ fontSize: '0.75rem', padding: '6px 10px' }} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
            {theme === 'light' ? <Moon size={13} strokeWidth={1.8} /> : <Sun size={13} strokeWidth={1.8} />}
            <span style={{ color: 'var(--text-muted)' }}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
          <button onClick={handleSignOut} className="btn-ghost justify-start w-full" style={{ fontSize: '0.75rem', padding: '6px 10px', color: 'var(--text-secondary)' }} title="Log out">
            <LogOut size={13} strokeWidth={1.8} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 border-r" style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)', zIndex: 40 }}><SidebarContent /></aside>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 border-b" style={{ height: '56px', backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 9L5 3L8 7L9.5 5L11 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div><span style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Alivio</span></div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-ghost" style={{ padding: '6px 8px' }}>{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onClick={() => setMobileOpen(false)}>
          <aside className="absolute left-0 top-0 bottom-0 border-r flex flex-col" style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}><SidebarContent /></aside>
        </div>
      )}
    </>
  );
}
