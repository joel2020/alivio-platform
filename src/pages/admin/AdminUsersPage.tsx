import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AdminUserRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

type SignInFilter = 'all' | 'signed_in' | 'never_signed_in';

const safeDate = (value: string | null) => (value ? new Date(value).toLocaleString() : '—');

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState('');
  const [signInFilter, setSignInFilter] = useState<SignInFilter>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: adminData, error: adminError } = await supabase.rpc('get_admin_auth_users');

      if (!adminError) {
        setUsers((adminData as AdminUserRow[]) ?? []);
        return;
      }

      const fallback = await supabase.from('users').select('id, email, created_at').order('created_at', { ascending: false });
      if (fallback.error) {
        setError(adminError.message);
        return;
      }

      setUsers(((fallback.data ?? []) as Array<{ id: string; email: string; created_at: string }>).map((user) => ({
        ...user,
        last_sign_in_at: null,
      })));
      setError('Showing fallback user data because auth metadata was not available.');
    };

    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = term.length === 0 || user.email.toLowerCase().includes(term);
      const matchesSignIn =
        signInFilter === 'all'
          ? true
          : signInFilter === 'signed_in'
            ? Boolean(user.last_sign_in_at)
            : !user.last_sign_in_at;

      return matchesSearch && matchesSignIn;
    });
  }, [search, signInFilter, users]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Admin • Users</h1>
      </div>

      <div className="page-content space-y-4">
        {error && <div className="card p-4" style={{ color: 'var(--warning)' }}>{error}</div>}

        <div className="card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email"
            className="input w-full"
          />
          <select className="input w-full" value={signInFilter} onChange={(event) => setSignInFilter(event.target.value as SignInFilter)}>
            <option value="all">All users</option>
            <option value="signed_in">Signed in at least once</option>
            <option value="never_signed_in">Never signed in</option>
          </select>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                <th className="p-3">Email</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Last Sign In</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{user.email}</td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{safeDate(user.created_at)}</td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{safeDate(user.last_sign_in_at)}</td>
                  <td className="p-3">
                    <button className="btn-secondary" onClick={() => setSelectedUser(user)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <div className="card p-4">
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>User Details</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}><strong>Email:</strong> {selectedUser.email}</p>
            <p style={{ color: 'var(--text-secondary)' }}><strong>Created:</strong> {safeDate(selectedUser.created_at)}</p>
            <p style={{ color: 'var(--text-secondary)' }}><strong>Last Sign In:</strong> {safeDate(selectedUser.last_sign_in_at)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
