import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import AuthBrandPanel from '../../components/auth/AuthBrandPanel';
import { getSafeNextPath, withNextParam } from '../../lib/redirects';

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

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500 as const,
  color: '#09090B',
  marginBottom: '6px',
};

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, user, loading } = useAuth();
  const nextPath = getSafeNextPath(location.search, '/dashboard');
  const onboardingPath = withNextParam('/onboarding', nextPath);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (session && user) navigate(nextPath, { replace: true });
      else if (session && !user) navigate(onboardingPath, { replace: true });
    }
  }, [loading, session, user, navigate, nextPath, onboardingPath]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!email.trim()) errs.email = 'Work email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setError('');
    setSubmitting(true);

    sessionStorage.setItem('signup_full_name', fullName.trim());

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (authError) {
      if (
        authError.message.toLowerCase().includes('already registered') ||
        authError.message.toLowerCase().includes('already exists') ||
        authError.message.toLowerCase().includes('user already registered')
      ) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) {
          setError('An account with this email already exists. Please sign in instead.');
          setSubmitting(false);
          return;
        }
        navigate(onboardingPath);
        return;
      }
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    navigate(onboardingPath);
  }

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${location.pathname}${location.search}` },
    });
  }

  function getInputStyle(field: string) {
    return {
      ...inputStyle,
      borderColor: fieldErrors[field] ? '#EF4444' : focusedField === field ? '#2563EB' : '#E4E4E7',
      boxShadow: fieldErrors[field]
        ? '0 0 0 3px rgba(239,68,68,0.1)'
        : focusedField === field
        ? '0 0 0 3px rgba(37,99,235,0.1)'
        : 'none',
    };
  }

  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel />

      <div
        className="flex flex-col items-center justify-center flex-1 px-6 py-12"
        style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div className="lg:hidden flex items-center gap-2 mb-8">
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

          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#09090B',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            Create your account
          </h1>
          <p
            style={{
              fontSize: '15px',
              fontWeight: 400,
              color: '#71717A',
              marginBottom: '32px',
            }}
          >
            Start sourcing candidates in under 5 minutes.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setFieldErrors(p => ({ ...p, fullName: '' })); }}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                placeholder="Alex Johnson"
                required
                style={getInputStyle('fullName')}
              />
              {fieldErrors.fullName && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{fieldErrors.fullName}</p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@company.com"
                required
                style={getInputStyle('email')}
              />
              {fieldErrors.email && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{fieldErrors.email}</p>
              )}
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  style={{ ...getInputStyle('password'), paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#A1A1AA',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{fieldErrors.password}</p>
              ) : (
                <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '4px' }}>Must be at least 8 characters</p>
              )}
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
              disabled={submitting}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: submitting ? '#93C5FD' : '#2563EB',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                borderRadius: '10px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '20px',
                transition: 'background-color 0.15s ease',
              }}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '24px 0',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E4E4E7' }} />
            <span style={{ fontSize: '13px', color: '#A1A1AA' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E4E4E7' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E4E7',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              color: '#09090B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F4F4F5'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF'; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#71717A',
              marginTop: '24px',
            }}
          >
            Already have an account?{' '}
            <Link
              to={`/login${location.search}`}
              style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}
            >
              Sign in
            </Link>
          </p>

          <p
            style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#A1A1AA',
              marginTop: '24px',
              lineHeight: 1.6,
            }}
          >
            By creating an account, you agree to our{' '}
            <a href="#" style={{ color: '#A1A1AA', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#A1A1AA', textDecoration: 'underline' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
