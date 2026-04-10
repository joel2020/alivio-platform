import { useState } from 'react';
import { Check, Key, Building2, User, CreditCard } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function SettingsPage() {
  const { user, org } = useAuth();
  const [saved, setSaved] = useState(false);

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1
          style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
          }}
        >
          Settings
        </h1>
        {saved && (
          <div
            className="flex items-center gap-1.5 animate-fade-in"
            style={{ color: 'var(--success)' }}
          >
            <Check size={13} strokeWidth={2.5} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Saved</span>
          </div>
        )}
      </div>

      <div className="page-content max-w-2xl space-y-4">
        <div className="card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-subtle)' }}
            >
              <User size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <h2
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Account
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="block mb-1.5"
                style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}
              >
                Full name
              </label>
              <input
                defaultValue={user?.full_name || ''}
                className="input-base w-full"
                style={{ padding: '8px 12px' }}
              />
            </div>
            <div>
              <label
                className="block mb-1.5"
                style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}
              >
                Email
              </label>
              <input
                defaultValue={user?.email || ''}
                disabled
                className="input-base w-full"
                style={{
                  padding: '8px 12px',
                  opacity: 0.6,
                  cursor: 'not-allowed',
                }}
              />
            </div>
            <div>
              <label
                className="block mb-1"
                style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}
              >
                Role
              </label>
              <span
                className="badge badge-neutral capitalize"
                style={{ display: 'inline-flex' }}
              >
                {user?.role || 'admin'}
              </span>
            </div>
            <div className="pt-1">
              <button onClick={showSaved} className="btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-subtle)' }}
            >
              <Building2 size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <h2
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Organization
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="block mb-1.5"
                style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}
              >
                Company name
              </label>
              <input
                defaultValue={org?.name || ''}
                className="input-base w-full"
                style={{ padding: '8px 12px' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block mb-1.5"
                  style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                  Size
                </label>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{org?.size}</span>
              </div>
              <div>
                <label
                  className="block mb-1.5"
                  style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                  Industry
                </label>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{org?.industry}</span>
              </div>
            </div>
            <div className="pt-1">
              <button onClick={showSaved} className="btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-subtle)' }}
            >
              <Key size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                API Access
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Integrate Alivio with your infrastructure
              </p>
            </div>
          </div>

          <div
            className="font-mono rounded-lg mb-3"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.02em',
            }}
          >
            ak_live_••••••••••••••••••••••••••••••••
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" style={{ fontSize: '0.75rem' }}>Reveal key</button>
            <button className="btn-secondary" style={{ fontSize: '0.75rem' }}>Regenerate</button>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-subtle)' }}
            >
              <CreditCard size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <h2
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Plan
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Growth
                </p>
                <span className="badge badge-success">Current plan</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                $1,249 / mo · Renews April 10, 2025
              </p>
            </div>
            <button className="btn-secondary" style={{ fontSize: '0.75rem' }}>
              Manage plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
