import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { getSafeNextPath, withNextParam } from '../../lib/nextRedirect';

const inputStyle = {
  width: '100%',
  height: '44px',
  padding: '0 14px',
  backgroundColor: '#FFFFFF',
  border: '1px solid #E4E4E7',
  borderRadius: '10px',
  fontSize: '15px',
  fontFamily: 'Inter, sans-serif',
  color: '#09090B',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A1A1AA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '40px',
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500 as const,
  color: '#09090B',
  marginBottom: '6px',
};

function ProgressIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-0 mb-8" style={{ width: 'fit-content' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: step >= 1 ? '#2563EB' : 'transparent',
          border: step >= 1 ? 'none' : '2px solid #E4E4E7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: step >= 1 ? '#FFFFFF' : '#A1A1AA' }}>1</span>
      </div>
      <div
        style={{
          width: '48px',
          height: '2px',
          backgroundColor: step >= 2 ? '#2563EB' : '#E4E4E7',
        }}
      />
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: step >= 2 ? '#2563EB' : 'transparent',
          border: step >= 2 ? 'none' : '2px solid #E4E4E7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: step >= 2 ? '#FFFFFF' : '#A1A1AA' }}>2</span>
      </div>
    </div>
  );
}

export default function OnboardingOrgPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user, loading, refreshProfile } = useAuth();
  const safeNext = getSafeNextPath(searchParams.get('next'));

  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [userRole, setUserRole] = useState('');
  const [referral, setReferral] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!session) {
        navigate(withNextParam('/login', safeNext), { replace: true });
      } else if (user) {
        navigate(safeNext ?? '/dashboard', { replace: true });
      }
    }
  }, [loading, session, user, navigate, safeNext]);

  async function createOrg(name: string, size: string) {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user) throw new Error('No session');

    const fullName =
      sessionStorage.getItem('signup_full_name') ||
      currentSession.user.user_metadata?.full_name ||
      currentSession.user.email?.split('@')[0] ||
      'User';

    const { error: rpcError } = await supabase.rpc('create_organization_and_user', {
      org_name: name,
      org_size: size || '1-10',
      org_industry: 'Technology',
      user_id: currentSession.user.id,
      user_full_name: fullName,
      user_email: currentSession.user.email ?? '',
    });

    if (rpcError) throw rpcError;
    sessionStorage.removeItem('signup_full_name');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    setError('');
    setSubmitting(true);

    try {
      await createOrg(companyName.trim(), companySize);
      await refreshProfile();
      navigate(withNextParam('/onboarding/first-role', safeNext));
    } catch {
      setError('Failed to set up your organization. Please try again.');
      setSubmitting(false);
    }
  }

  async function handleSkip() {
    setSubmitting(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const defaultName =
        currentSession?.user?.email?.split('@')[1]?.split('.')[0] || 'My Company';
      await createOrg(defaultName, '1-10');
      await refreshProfile();
      navigate(withNextParam('/onboarding/first-role', safeNext));
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function getInputFocusStyle(field: string) {
    return {
      ...inputStyle,
      borderColor: focusedField === field ? '#2563EB' : '#E4E4E7',
      boxShadow: focusedField === field ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
    };
  }

  function getSelectFocusStyle(field: string) {
    return {
      ...selectStyle,
      borderColor: focusedField === field ? '#2563EB' : '#E4E4E7',
      boxShadow: focusedField === field ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
    };
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#2563EB' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAFA',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div className="flex items-center gap-2 mb-12">
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 9L5 3L8 7L9.5 5L11 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#09090B', letterSpacing: '-0.02em' }}>Alivio</span>
        </div>

        <ProgressIndicator step={1} />

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#09090B',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            marginBottom: '8px',
          }}
        >
          Set up your organization
        </h1>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 400,
            color: '#71717A',
            marginBottom: '32px',
          }}
        >
          This helps Alivio tailor the experience for your team.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Company name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onFocus={() => setFocusedField('companyName')}
              onBlur={() => setFocusedField(null)}
              placeholder="Acme Inc."
              required
              style={getInputFocusStyle('companyName')}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Company size</label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              onFocus={() => setFocusedField('companySize')}
              onBlur={() => setFocusedField(null)}
              style={getSelectFocusStyle('companySize')}
            >
              <option value="">Select size</option>
              <option value="1-50">1–50 employees</option>
              <option value="51-200">51–200 employees</option>
              <option value="201-1000">201–1,000 employees</option>
              <option value="1000+">1,000+ employees</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Your role</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              onFocus={() => setFocusedField('userRole')}
              onBlur={() => setFocusedField(null)}
              style={getSelectFocusStyle('userRole')}
            >
              <option value="">Select your role</option>
              <option value="founder">Founder / CEO</option>
              <option value="talent">Head of Talent / HR</option>
              <option value="hiring_manager">Hiring Manager</option>
              <option value="recruiter">Recruiter</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              How did you hear about Alivio?{' '}
              <span style={{ color: '#A1A1AA', fontWeight: 400 }}>(Optional)</span>
            </label>
            <select
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              onFocus={() => setFocusedField('referral')}
              onBlur={() => setFocusedField(null)}
              style={getSelectFocusStyle('referral')}
            >
              <option value="">Select an option</option>
              <option value="linkedin">LinkedIn</option>
              <option value="google">Google search</option>
              <option value="referral">Referral</option>
              <option value="twitter">Twitter/X</option>
              <option value="other">Other</option>
            </select>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '14px', color: '#DC2626' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !companyName.trim()}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: submitting || !companyName.trim() ? '#93C5FD' : '#2563EB',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              borderRadius: '10px',
              cursor: submitting || !companyName.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
              transition: 'background-color 0.15s ease',
            }}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Setting up...' : 'Continue'}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting}
            style={{
              width: '100%',
              height: '44px',
              backgroundColor: 'transparent',
              color: '#2563EB',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              borderRadius: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
