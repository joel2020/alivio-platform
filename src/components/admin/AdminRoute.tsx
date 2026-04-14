import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { withNextParam } from '../../lib/nextRedirect';

const ADMIN_EMAIL = 'joel@aliviosearchpartners.com';

export default function AdminRoute() {
  const location = useLocation();
  const { session, loading, supabaseUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading admin portal…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={withNextParam('/login', location.pathname)} replace />;
  }

  const isAdmin = supabaseUser?.email === ADMIN_EMAIL;

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
