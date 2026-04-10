import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Briefcase, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Role } from '../../lib/types';
import { FAKE_CANDIDATES } from '../../components/app/outreach/messageTemplates';
import type { FakeCandidate, Channel, Tone, GeneratedMessage } from '../../components/app/outreach/messageTemplates';
import OutreachGenerator from '../../components/app/outreach/OutreachGenerator';
import OutreachHistory from '../../components/app/outreach/OutreachHistory';
import type { OutreachRecord } from '../../components/app/outreach/OutreachHistory';

function SelectBox({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
      <label
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            height: '44px',
            padding: '0 36px 0 14px',
            backgroundColor: disabled ? 'var(--bg-subtle)' : 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: value ? 500 : 400,
            color: value ? 'var(--text-primary)' : 'var(--text-muted)',
            fontFamily: 'Inter, sans-serif',
            cursor: disabled ? 'not-allowed' : 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            opacity: disabled ? 0.6 : 1,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-subtle)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {children}
        </select>
        <ChevronDown
          size={14}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

function CandidateSummaryCard({ candidate }: { candidate: FakeCandidate }) {
  const scoreColor =
    candidate.score >= 90
      ? 'var(--success)'
      : candidate.score >= 75
      ? 'var(--warning)'
      : 'var(--error)';

  const scoreBg =
    candidate.score >= 90
      ? 'var(--success-subtle)'
      : candidate.score >= 75
      ? 'var(--warning-subtle)'
      : 'var(--error-subtle)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        backgroundColor: '#FAFAFA',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        marginBottom: '28px',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 700,
          flexShrink: 0,
          letterSpacing: '0.02em',
        }}
      >
        {candidate.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)}
      </div>

      <div style={{ flex: 1, minWidth: '140px' }}>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '2px',
          }}
        >
          {candidate.name}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {candidate.title} · {candidate.company}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: scoreBg,
            color: scoreColor,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {candidate.score}% match
        </span>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {candidate.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              style={{
                padding: '2px 7px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {skill}
            </span>
          ))}
        </div>

        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {candidate.experience}y exp.
        </span>
      </div>
    </div>
  );
}

export default function OutreachPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [history, setHistory] = useState<OutreachRecord[]>([]);

  useEffect(() => {
    if (!user?.org_id) return;
    supabase
      .from('roles')
      .select('*')
      .eq('org_id', user.org_id)
      .in('status', ['active', 'paused'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRoles(data || []);
        setRolesLoading(false);
      });
  }, [user?.org_id]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null;
  const selectedCandidate = FAKE_CANDIDATES.find((c) => c.id === selectedCandidateId) || null;

  function handleRoleChange(roleId: string) {
    setSelectedRoleId(roleId);
    setSelectedCandidateId('');
  }

  const handleMessageGenerated = useCallback(
    (msg: {
      candidateName: string;
      roleTitle: string;
      channel: Channel;
      tone: Tone;
      message: GeneratedMessage;
    }) => {
      const record: OutreachRecord = {
        id: `${Date.now()}-${Math.random()}`,
        candidateName: msg.candidateName,
        roleTitle: msg.roleTitle,
        channel: msg.channel,
        tone: msg.tone,
        message: msg.message,
        generatedAt: new Date(),
      };
      setHistory((prev) => [record, ...prev]);
    },
    []
  );

  const showEmptyState = !rolesLoading && roles.length === 0;
  const showGenerator = !!selectedRole && !!selectedCandidate;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1
          style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
          }}
        >
          Outreach
        </h1>
      </div>

      <div
        style={{
          flex: 1,
          padding: '28px 28px 56px',
          maxWidth: '800px',
        }}
      >
        {rolesLoading ? (
          <div style={{ display: 'flex', gap: '6px', padding: '40px 0', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-bounce"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        ) : showEmptyState ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '48px 0',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Briefcase size={20} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Create a role first
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '20px',
                maxWidth: '380px',
              }}
            >
              You need at least one active role to generate outreach. Create a role to define
              the position and start reaching out to candidates.
            </p>
            <Link
              to="/roles/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '40px',
                padding: '0 18px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Create Role
            </Link>
          </div>
        ) : (
          <>
            <section style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: selectedCandidate ? '16px' : '0',
                  flexWrap: 'wrap',
                }}
              >
                <SelectBox
                  label="Role"
                  value={selectedRoleId}
                  onChange={handleRoleChange}
                  placeholder="Select a role..."
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </SelectBox>

                <SelectBox
                  label="Candidate"
                  value={selectedCandidateId}
                  onChange={setSelectedCandidateId}
                  disabled={!selectedRoleId}
                  placeholder={
                    selectedRoleId ? 'Select a candidate...' : 'Select a role first'
                  }
                >
                  {FAKE_CANDIDATES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.score}% match
                    </option>
                  ))}
                </SelectBox>
              </div>

              {selectedCandidate && <CandidateSummaryCard candidate={selectedCandidate} />}
            </section>

            <section style={{ marginBottom: '56px' }}>
              {showGenerator ? (
                <OutreachGenerator
                  candidate={selectedCandidate}
                  role={selectedRole}
                  senderName={user?.full_name || 'Your name'}
                  onMessageGenerated={handleMessageGenerated}
                />
              ) : (
                <div
                  style={{
                    padding: '32px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {!selectedRoleId
                      ? 'Select a role and candidate to start generating outreach.'
                      : 'Select a candidate to generate a personalized message.'}
                  </p>
                </div>
              )}
            </section>

            <section>
              <OutreachHistory records={history} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
