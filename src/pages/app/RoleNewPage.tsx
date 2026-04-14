import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import Toast from '../../components/app/Toast';
import StepBasics from '../../components/app/roles/StepBasics';
import StepRequirements from '../../components/app/roles/StepRequirements';
import StepScoring from '../../components/app/roles/StepScoring';
import StepReview from '../../components/app/roles/StepReview';
import { DEFAULT_FORM_DATA, type RoleFormData } from '../../components/app/roles/roleFormTypes';

const STEPS = [
  { number: 1, label: 'Role Details' },
  { number: 2, label: 'Requirements' },
  { number: 3, label: 'Scoring' },
  { number: 4, label: 'Review' },
];

const STEP_SUBTITLES = [
  'Start with the fundamentals.',
  'Define what you\'re looking for in candidates.',
  'Adjust how candidates are evaluated. Leave defaults if you\'re unsure.',
  'Confirm your role details and activate your agents.',
];

function ProgressBar({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '32px' }}>
      {STEPS.map((step, idx) => {
        const isDone = step.number < current;
        const isActive = step.number === current;
        const isLast = idx === STEPS.length - 1;
        return (
          <div key={step.number} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDone ? '#2563EB' : isActive ? '#EFF6FF' : '#F4F4F5',
                  border: `2px solid ${isDone ? '#2563EB' : isActive ? '#2563EB' : '#E4E4E7'}`,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <Check size={14} style={{ color: '#FFFFFF' }} strokeWidth={2.5} />
                ) : (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isActive ? '#2563EB' : '#A1A1AA',
                    }}
                  >
                    {step.number}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 500,
                  color: isDone ? '#2563EB' : isActive ? '#09090B' : '#A1A1AA',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease',
                }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: isDone ? '#2563EB' : '#E4E4E7',
                  margin: '0 8px',
                  marginTop: '-16px',
                  transition: 'background-color 0.3s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function validateStep(step: number, data: RoleFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 1) {
    if (!data.title.trim()) errors.title = 'Job title is required.';
    if ((data.locationType === 'Hybrid' || data.locationType === 'On-site') && !data.cityRegion.trim()) {
      errors.cityRegion = 'City or region is required for Hybrid and On-site roles.';
    }
  }
  return errors;
}

export default function RoleNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RoleFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [isDescriptionAIGenerated, setIsDescriptionAIGenerated] = useState(false);

  function handleChange(partial: Partial<RoleFormData>) {
    setData(prev => ({ ...prev, ...partial }));
    if (Object.prototype.hasOwnProperty.call(partial, 'description')) {
      setIsDescriptionAIGenerated(false);
    }
    const clearedErrors = { ...errors };
    Object.keys(partial).forEach(k => delete clearedErrors[k]);
    setErrors(clearedErrors);
  }

  function handleContinue() {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setErrors({});
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(status: 'active' | 'draft') {
    if (!user?.org_id) return;
    setSubmitting(true);
    setSubmitError('');

    const locationForDB = data.locationType === 'Remote'
      ? 'Remote'
      : data.cityRegion || data.locationType;

    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        org_id: user.org_id,
        title: data.title.trim(),
        department: data.department || null,
        seniority: data.seniority || null,
        employment_type: data.employmentType.toLowerCase().replace('-', '-') as 'full-time' | 'part-time' | 'contract' | 'freelance',
        location: locationForDB,
        location_type: data.locationType,
        city_region: data.locationType !== 'Remote' ? data.cityRegion || null : null,
        remote: data.locationType === 'Remote',
        compensation_min: data.salaryMin ? parseInt(data.salaryMin) : null,
        compensation_max: data.salaryMax ? parseInt(data.salaryMax) : null,
        compensation_currency: data.currency,
        must_have_requirements: data.mustHaveSkills,
        nice_to_have_requirements: data.niceToHaveSkills,
        experience_min: data.experienceMin ? parseInt(data.experienceMin) : 0,
        experience_max: 20,
        education_requirement: data.education !== 'No requirement' ? data.education : null,
        description: data.description || null,
        scoring_weights: data.scoringWeights,
        outreach_tone: 'conversational',
        target_candidate_volume: 50,
        status,
      })
      .select()
      .single();

    if (error || !role) {
      setSubmitError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    await supabase.from('voice_settings').insert({
      role_id: role.id,
      enabled: false,
      score_threshold: 0.75,
      calling_window_start: '09:00',
      calling_window_end: '19:00',
      max_attempts: 3,
      verification_points: [],
      escalation_rules: {
        on_human_request: true,
        on_ambiguous_credentials: true,
        on_high_score: true,
        high_score_threshold: 0.92,
        on_all_calls: false,
      },
      auto_advance_qualified: false,
      escalation_email: null,
    });

    if (status === 'active') {
      setToast(`Agents are now searching for candidates for ${role.title}`);
      setTimeout(() => navigate(`/roles/${role.id}/pipeline`), 1200);
    } else {
      setToast('Role saved as draft');
      setTimeout(() => navigate('/roles'), 1200);
    }
  }

  const stepTitles = ['Role Details', 'Requirements & Skills', 'Scoring Preferences', 'Review & Launch'];
  const stepSubtitles = STEP_SUBTITLES;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#FFFFFF',
          padding: '0 32px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/roles"
            style={{ fontSize: '13px', color: '#71717A', textDecoration: 'none' }}
            className="hover:underline"
          >
            Roles
          </Link>
          <span style={{ color: '#E4E4E7', fontSize: '14px' }}>/</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#09090B' }}>New Role</span>
        </div>
        <Link
          to="/roles"
          style={{ fontSize: '13px', color: '#71717A', textDecoration: 'none' }}
        >
          Cancel
        </Link>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <ProgressBar current={step} />

        <div style={{ marginBottom: '28px' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#2563EB',
              marginBottom: '6px',
            }}
          >
            Step {step} of 4
          </p>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#09090B',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            {stepTitles[step - 1]}
          </h1>
          <p style={{ fontSize: '14px', color: '#71717A', lineHeight: '1.5' }}>
            {stepSubtitles[step - 1]}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E4E4E7',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            marginBottom: '24px',
          }}
        >
          {step === 1 && (
            <StepBasics data={data} onChange={handleChange} errors={errors} />
          )}
          {step === 2 && (
            <StepRequirements
              data={data}
              onChange={handleChange}
              isAIGenerated={isDescriptionAIGenerated}
              onAIGeneratedChange={setIsDescriptionAIGenerated}
              onGenerationError={setToast}
            />
          )}
          {step === 3 && (
            <StepScoring data={data} onChange={handleChange} />
          )}
          {step === 4 && (
            <StepReview data={data} />
          )}
        </div>

        {submitError && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              marginBottom: '16px',
            }}
          >
            <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>{submitError}</p>
          </div>
        )}

        {step < 4 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              onClick={handleContinue}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1D4ED8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563EB'; }}
            >
              Continue
            </button>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#71717A',
                  padding: '4px',
                  textAlign: 'center',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Back
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleSubmit('active')}
              disabled={submitting}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: submitting ? '#93C5FD' : '#2563EB',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1D4ED8'; }}
              onMouseLeave={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563EB'; }}
            >
              {submitting ? 'Launching...' : 'Launch Role & Activate Agents'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={submitting}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                color: '#09090B',
                fontSize: '15px',
                fontWeight: 500,
                border: '1px solid #E4E4E7',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
                opacity: submitting ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F4F4F5'; }}
              onMouseLeave={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF'; }}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#71717A',
                padding: '4px',
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Back
            </button>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast}
          onDismiss={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  );
}
