import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../lib/auth';

export default function AppLayout() {
  const { session, loading, needsOrg } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  if (needsOrg) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <Sidebar />
      <main
        className="min-h-screen pt-14 md:pt-0"
        style={{ marginLeft: '0' }}
      >
        <div
          className="md:block hidden"
          style={{ marginLeft: 'var(--sidebar-width)' }}
        >
          <Outlet />
        </div>
        <div className="md:hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
