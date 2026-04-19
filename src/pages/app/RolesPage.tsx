import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, MapPin, Calendar, Users, Settings, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Role } from '../../lib/types';

interface RoleWithCount extends Role {
  candidate_count: number;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: Role['status'] }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: '#F0FDF4', text: '#059669', dot: '#10B981' },
    draft: { bg: '#F4F4F5', text: '#71717A', dot: '#A1A1AA' },
    paused: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
    closed: { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' },
  };
  const c = map[status] || map.draft;
  const labels: Record<string, string> = {
    active: 'Active',
    draft: 'Draft',
    paused: 'Paused',
    closed: 'Closed',
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.text,
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: c.dot,
          flexShrink: 0,
        }}
      />
      {labels[status] || status}
    </span>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '96px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          backgroundColor: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Briefcase size={22} style={{ color: '#2563EB' }} strokeWidth={1.5} />
      </div>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#09090B',
          letterSpacing: '-0.02em',
          marginBottom: '8px',
        }}
      >
        No roles yet
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: '#71717A',
          lineHeight: 1.6,
          maxWidth: '380px',
          marginBottom: '28px',
        }}
      >
        Create your first role and our AI agents will start searching for qualified candidates automatically.
      </p>
      <Link
        to="/roles/new"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          height: '44px',
          padding: '0 24px',
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          borderRadius: '10px',
          textDecoration: 'none',
          transition: 'background-color 0.15s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1D4ED8'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#2563EB'; }}
      >
        <Plus size={15} />
        Create Your First Role
      </Link>
    </div>
  );
}

export default function RolesPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<RoleWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Role['status']>('all');

  const loadRoles = useCallback(async () => {
    if (!user?.org_id) return;
    setLoading(true);
    setError(null);

    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .eq('org_id', user.org_id)
      .order('created_at', { ascending: false });

    if (rolesError || !rolesData) {
      setError(rolesError?.message ?? 'Unable to load roles right now.');
      setLoading(false);
      return;
    }

    const roleIds = rolesData.map(r => r.id);
    const { data: counts, error: countError } = roleIds.length > 0
      ? await supabase
          .from('candidates')
          .select('role_id')
          .in('role_id', roleIds)
      : { data: [], error: null };

    if (countError) {
      setError(countError.message);
      setLoading(false);
      return;
    }

    const countMap: Record<string, number> = {};
    (counts || []).forEach((c: { role_id: string }) => {
      countMap[c.role_id] = (countMap[c.role_id] || 0) + 1;
    });

    setRoles(rolesData.map(r => ({ ...r, candidate_count: countMap[r.id] || 0 })));
    setLoading(false);
  }, [user?.org_id]);

  useEffect(() => {
    if (!user?.org_id) return;
    loadRoles();
  }, [loadRoles, user?.org_id]);

  const filterOptions: { label: string; value: 'all' | Role['status'] }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Paused', value: 'paused' },
    { label: 'Closed', value: 'closed' },
  ];

  const filtered = filter === 'all' ? roles : roles.filter(r => r.status === filter);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}
          >
            Roles
          </h1>
          {!loading && (
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              {roles.length} total
            </span>
          )}
        </div>
        <Link to="/roles/new" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
          <Plus size={13} />
          New Role
        </Link>
      </div>

      <div className="page-content">
        {error ? (
          <div className="card" style={{ borderColor: 'var(--error)', padding: '16px', marginBottom: '16px' }}>
            <p style={{ color: 'var(--error)', marginBottom: '10px' }}>Unable to load roles. {error}</p>
            <button className="btn-primary" style={{ minHeight: '44px' }} onClick={() => void loadRoles()}>
              Retry
            </button>
          </div>
        ) : null}
        {!loading && roles.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {filterOptions.map(opt => {
                const count = opt.value === 'all' ? roles.length : roles.filter(r => r.status === opt.value).length;
                const isActive = filter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'color 0.15s, border-color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {opt.label}
                    {count > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-subtle)',
                          color: isActive ? '#fff' : 'var(--text-muted)',
                          lineHeight: '1.5',
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-6">
                    <div className="skeleton h-5 w-48 mb-3" />
                    <div className="skeleton h-3.5 w-32 mb-4" />
                    <div className="flex gap-4">
                      <div className="skeleton h-3 w-20" />
                      <div className="skeleton h-3 w-20" />
                      <div className="skeleton h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: '64px 24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-primary)' }}>No {filter} roles found</h2>
                <p style={{ fontSize: '14px', marginBottom: '16px' }}>Try switching to a different status filter or create a new role.</p>
                <Link to="/roles/new" className="btn-primary" style={{ minHeight: '44px' }}>
                  Create a role
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(role => (
                  <div
                    key={role.id}
                    className="card"
                    style={{
                      padding: '20px 24px',
                      transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3
                            style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#09090B',
                              letterSpacing: '-0.015em',
                              lineHeight: 1.3,
                            }}
                          >
                            {role.title}
                          </h3>
                          <StatusBadge status={role.status} />
                        </div>

                        <div
                          className="flex items-center gap-4 flex-wrap"
                          style={{ marginBottom: '16px' }}
                        >
                          {(role as RoleWithCount & { department?: string }).department && (
                            <span
                              style={{
                                fontSize: '13px',
                                color: '#71717A',
                                fontWeight: 500,
                              }}
                            >
                              {(role as RoleWithCount & { department?: string }).department}
                            </span>
                          )}
                          {(role as RoleWithCount & { seniority?: string }).seniority && (
                            <>
                              <span style={{ color: '#E4E4E7', fontSize: '13px' }}>·</span>
                              <span style={{ fontSize: '13px', color: '#71717A' }}>
                                {(role as RoleWithCount & { seniority?: string }).seniority}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} style={{ color: '#A1A1AA' }} />
                            <span style={{ fontSize: '13px', color: '#71717A' }}>
                              {(role as RoleWithCount & { location_type?: string }).location_type || (role.remote ? 'Remote' : role.location || 'Not specified')}
                              {(role as RoleWithCount & { city_region?: string; location_type?: string }).city_region && (role as RoleWithCount & { location_type?: string }).location_type !== 'Remote'
                                ? ` · ${(role as RoleWithCount & { city_region?: string }).city_region}`
                                : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} style={{ color: '#A1A1AA' }} />
                            <span style={{ fontSize: '13px', color: '#71717A' }}>
                              {formatDate(role.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users size={12} style={{ color: '#A1A1AA' }} />
                            <span style={{ fontSize: '13px', color: '#71717A' }}>
                              {role.candidate_count} candidates
                            </span>
                          </div>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 500,
                              backgroundColor: '#F4F4F5',
                              color: '#71717A',
                            }}
                          >
                            {role.employment_type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          to={`/roles/${role.id}/settings`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid #E4E4E7',
                            backgroundColor: '#FFFFFF',
                            color: '#71717A',
                            textDecoration: 'none',
                            transition: 'background-color 0.15s, color 0.15s',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#F4F4F5';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#09090B';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#FFFFFF';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#71717A';
                          }}
                          title="Settings"
                        >
                          <Settings size={14} />
                        </Link>
                        <Link
                          to={`/roles/${role.id}/pipeline`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            height: '32px',
                            padding: '0 14px',
                            borderRadius: '8px',
                            border: '1px solid #E4E4E7',
                            backgroundColor: '#FFFFFF',
                            color: '#09090B',
                            fontSize: '13px',
                            fontWeight: 500,
                            textDecoration: 'none',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#F4F4F5'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#FFFFFF'; }}
                        >
                          Pipeline
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
