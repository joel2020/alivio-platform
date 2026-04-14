import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { withNextParam } from '../../lib/nextRedirect';
import { supabase } from '../../lib/supabase';

export default function AdminRoute() {
  const location = useLocation();
  const { session, loading } = useAuth();
  const [adminCheckLoading, setAdminCheckLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      setAdminCheckError(null);
      setAdminCheckLoading(false);
      return;
    }

    let active = true;
    setAdminCheckLoading(true);
    setAdminCheckError(null);

    supabase.rpc('is_platform_admin')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setAdminCheckError(error.message);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(Boolean(data));
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAdminCheckError(error instanceof Error ? error.message : 'Unknown error checking admin access');
        setIsAdmin(false);
      })
      .finally(() => {
        if (active) setAdminCheckLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session]);

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

  if (adminCheckLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Checking admin access…</p>
      </div>
    );
  }

  if (adminCheckError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="card p-4 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
          Unable to verify admin permissions. Please sign out and sign in again.
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
