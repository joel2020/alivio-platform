import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface RpcStatus {
  database_connection: boolean;
  rls: {
    total_public_tables: number;
    rls_enabled_tables: number;
    all_enabled: boolean;
  };
  auth: {
    auth_schema_present: boolean;
    auth_users_table_present: boolean;
    status: boolean;
  };
  checked_at: string;
}

interface EnvStatus {
  [key: string]: boolean;
}

interface AgentHealthStatus {
  azure: "ok" | "error";
  db: "ok" | "error";
  storage: "ok" | "error";
  timestamp: string;
  errors?: Record<string, string>;
}

interface FunctionStatus {
  database_connection: boolean;
  database_error: string | null;
  env: EnvStatus;
  auth: {
    hasUser: boolean;
    userEmailPresent: boolean;
    providerCount: number;
    status: boolean;
  };
  checked_at: string;
}

export default function AdminSystemCheckPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rpcStatus, setRpcStatus] = useState<RpcStatus | null>(null);
  const [fnStatus, setFnStatus] = useState<FunctionStatus | null>(null);
  const [health, setHealth] = useState<AgentHealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const [rpcRes, fnRes] = await Promise.all([
        supabase.rpc('get_admin_system_check'),
        supabase.functions.invoke<FunctionStatus>('admin-system-check', { body: {} }),
      ]);

      if (rpcRes.error) {
        setError(rpcRes.error.message);
      } else {
        setRpcStatus(rpcRes.data as RpcStatus);
      }

      if (fnRes.error) {
        setError((existing) => existing ? `${existing} | ${fnRes.error.message}` : fnRes.error.message);
      } else {
        setFnStatus(fnRes.data ?? null);
      }

      setLoading(false);
    };

    void load();
  }, []);

  const runAgentHealthCheck = async () => {
    setHealthLoading(true);
    const { data, error: healthError } = await supabase.functions.invoke<AgentHealthStatus>('health-check', { body: {} });
    if (healthError) {
      setError((existing) => existing ? `${existing} | ${healthError.message}` : healthError.message);
    } else {
      setHealth(data ?? null);
    }
    setHealthLoading(false);
  };

  const envEntries = Object.entries(fnStatus?.env ?? {});

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          System Check
        </h1>
      </div>

      <div className="page-content space-y-4">
        {error && <div className="card p-4" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>{error}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Database Connection</h2>
            {loading ? <div className="skeleton h-5 w-28 mt-3" /> : (
              <p className="mt-3 text-sm" style={{ color: rpcStatus?.database_connection && fnStatus?.database_connection ? 'var(--success)' : 'var(--error)' }}>
                {rpcStatus?.database_connection && fnStatus?.database_connection ? 'Healthy' : 'Failed'}
              </p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Auth Configuration</h2>
            {loading ? <div className="skeleton h-5 w-36 mt-3" /> : (
              <p className="mt-3 text-sm" style={{ color: rpcStatus?.auth.status && fnStatus?.auth.status ? 'var(--success)' : 'var(--error)' }}>
                {rpcStatus?.auth.status && fnStatus?.auth.status ? 'Configured' : 'Needs attention'}
              </p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>RLS Coverage (public schema)</h2>
          {loading ? (
            <div className="space-y-2 mt-3">
              <div className="skeleton h-4 w-56" />
              <div className="skeleton h-4 w-44" />
            </div>
          ) : (
            <div className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>Total tables: {rpcStatus?.rls.total_public_tables ?? 0}</p>
              <p>RLS enabled: {rpcStatus?.rls.rls_enabled_tables ?? 0}</p>
              <p style={{ color: rpcStatus?.rls.all_enabled ? 'var(--success)' : 'var(--error)' }}>
                {rpcStatus?.rls.all_enabled ? 'All public tables have RLS enabled.' : 'Some public tables are missing RLS.'}
              </p>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Environment Variables (presence only)</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              {Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="skeleton h-4 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              {envEntries.map(([key, present]) => (
                <div key={key} className="flex items-center justify-between rounded border px-3 py-2" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{key}</span>
                  <span className="text-xs font-semibold" style={{ color: present ? 'var(--success)' : 'var(--error)' }}>
                    {present ? 'Present' : 'Missing'}
                  </span>
                </div>
              ))}
              {envEntries.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No env data available.</p>}
            </div>
          )}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Agent Health Check</h2>
            <button className="btn-primary" onClick={runAgentHealthCheck} disabled={healthLoading}>
              {healthLoading ? 'Running…' : 'Run Agent Health Check'}
            </button>
          </div>
          {health ? (
            <div className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>Azure OpenAI: <span style={{ color: health.azure === 'ok' ? 'var(--success)' : 'var(--error)' }}>{health.azure}</span></p>
              <p>Database: <span style={{ color: health.db === 'ok' ? 'var(--success)' : 'var(--error)' }}>{health.db}</span></p>
              <p>Storage: <span style={{ color: health.storage === 'ok' ? 'var(--success)' : 'var(--error)' }}>{health.storage}</span></p>
              <p>Checked at: {new Date(health.timestamp).toLocaleString()}</p>
            </div>
          ) : <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>Run the check to validate agent dependencies.</p>}
        </div>
      </div>
    </div>
  );
}
