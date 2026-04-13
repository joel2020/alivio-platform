import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
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

export default function OnboardingRolePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading } = useAuth();
  const skillInputRef = useRef<HTMLInputElement>(null);
  const nextPath = getSafeNextPath(location.search, '/dashboard');
  const loginPath = withNextParam('/login', nextPath);

  const [jobTitle, setJobTitle] = useState('');
  const [seniority, setSeniority] = useState('');
  const [locationType, setLocationType] = useState('');
  const [cityRegion, setCityRegion] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      navigate(loginPath, { replace: true });
    }
  }, [loading, session, navigate, loginPath]);

  function addSkill(value: string) {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 20) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1));
    }
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    setError('');
    setSubmitting(true);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.user) throw new Error('No session');

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (!userData?.org_id) throw new Error('No organization found');

      const location = locationType === 'Remote'
        ? 'Remote'
        : cityRegion.trim() || locationType || 'Remote';

      const { error: insertError } = await supabase.from('roles').insert({
        org_id: userData.org_id,
        title: jobTitle.trim(),
        location,
        remote: locationType === 'Remote',
        employment_type: 'full-time',
        experience_min: 0,
        experience_max: 10,
        must_have_requirements: skills,
        nice_to_have_requirements: [],
        compensation_min: null,
        compensation_max: null,
        compensation_currency: 'USD',
        description: null,
        target_candidate_volume: 20,
        outreach_tone: 'professional',
        status: 'active',
      });

      if (insertError) throw insertError;

      sessionStorage.setItem('onboarding_role_created', jobTitle.trim());
      navigate(nextPath);
    } catch {
      setError('Failed to create your role. Please try again.');
      setSubmitting(false);
    }
  }

  function handleSkip() {
    navigate(nextPath);
  }

  function getFocusStyle(field: string) {
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

        <ProgressIndicator step={2} />

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
          What role are you hiring for?
        </h1>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 400,
            color: '#71717A',
            marginBottom: '32px',
          }}
        >
          Tell us a little about your first role and our agents will start working immediately.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Job title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onFocus={() => setFocusedField('jobTitle')}
              onBlur={() => setFocusedField(null)}
              placeholder="Nurse Manager — ICU"
              required
              style={getFocusStyle('jobTitle')}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Seniority level</label>
            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              onFocus={() => setFocusedField('seniority')}
              onBlur={() => setFocusedField(null)}
              style={getSelectFocusStyle('seniority')}
            >
              <option value="">Select seniority</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Director">Director</option>
              <option value="VP">VP</option>
              <option value="C-Suite">C-Suite</option>
            </select>
          </div>

          <div style={{ marginBottom: locationType === 'Hybrid' || locationType === 'On-site' ? '8px' : '16px' }}>
            <label style={labelStyle}>Location</label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              onFocus={() => setFocusedField('locationType')}
              onBlur={() => setFocusedField(null)}
              style={getSelectFocusStyle('locationType')}
            >
              <option value="">Select location type</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {(locationType === 'Hybrid' || locationType === 'On-site') && (
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={cityRegion}
                onChange={(e) => setCityRegion(e.target.value)}
                onFocus={() => setFocusedField('cityRegion')}
                onBlur={() => setFocusedField(null)}
                placeholder="San Francisco, CA"
                style={getFocusStyle('cityRegion')}
              />
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Key skills</label>
            <div
              style={{
                minHeight: '44px',
                padding: skills.length > 0 ? '8px 10px' : '0 14px',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${focusedField === 'skillInput' ? '#2563EB' : '#E4E4E7'}`,
                borderRadius: '10px',
                boxShadow: focusedField === 'skillInput' ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '6px',
                cursor: 'text',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onClick={() => skillInputRef.current?.focus()}
            >
              {skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                      opacity: 0.7,
                    }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input
                ref={skillInputRef}
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onFocus={() => setFocusedField('skillInput')}
                onBlur={() => { setFocusedField(null); if (skillInput.trim()) addSkill(skillInput); }}
                placeholder={skills.length === 0 ? 'Type a skill and press Enter' : ''}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  height: skills.length > 0 ? '28px' : '42px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#09090B',
                  padding: skills.length > 0 ? '0 4px' : '0',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '4px' }}>
              Press Enter or comma to add a skill
            </p>
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
            disabled={submitting || !jobTitle.trim()}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: submitting || !jobTitle.trim() ? '#93C5FD' : '#2563EB',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              borderRadius: '10px',
              cursor: submitting || !jobTitle.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
              transition: 'background-color 0.15s ease',
            }}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Launching agents...' : 'Launch Agents & Go to Dashboard'}
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
            Skip — I'll create a role later
          </button>
        </form>
      </div>
    </div>
  );
}
