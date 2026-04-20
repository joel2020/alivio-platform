import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { withNextParam } from '../../lib/nextRedirect';

function RouteLoading() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={24} className="animate-spin" style={{ color: '#2563EB' }} />
    </div>
  );
}

export function RequireLoggedOut() {
  const location = useLocation();
  const { loading, session, user } = useAuth();

  if (loading) return <RouteLoading />;
  if (!session) return <Outlet />;

  const next = `${location.pathname}${location.search}`;
  if (!user) return <Navigate to={withNextParam('/onboarding/org', next)} replace />;
  return <Navigate to="/dashboard" replace />;
}

export function RequireOnboarding() {
  const location = useLocation();
  const { loading, session, user } = useAuth();

  if (loading) return <RouteLoading />;
  if (!session) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={withNextParam('/login', next)} replace />;
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
