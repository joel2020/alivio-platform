import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { withNextParam } from '../../lib/nextRedirect';
import { supabase } from '../../lib/supabase';

export default function AdminRoute() {
  const location = useLocation();
  const { session, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      if (!session) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      setCheckingAdmin(true);
      const { data, error } = await supabase.rpc('is_platform_admin');
      if (!cancelled) {
        setIsAdmin(!error && !!data);
        setCheckingAdmin(false);
      }
    };

    void checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading admin portal…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={withNextParam('/login', location.pathname)} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
