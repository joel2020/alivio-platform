import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

const CARE_SETTINGS = ['Hospital', 'SNF', 'LTC', 'AMC', 'Clinic'] as const;
const CREDENTIAL_OPTIONS = ['RN', 'BSN', 'MSN', 'NP', 'LNHA', 'MDS', 'LPN/LVN', 'CNA'] as const;
const URGENCY_OPTIONS = ['ASAP', 'Within 30 days', 'Planning ahead'] as const;
const OUTREACH_STYLE_OPTIONS = ['Conservative', 'Moderate', 'Aggressive'] as const;

interface OnboardingWizardProps {
  onComplete: () => Promise<void>;
}

interface RoleStepData {
  roleTitle: string;
  careSetting: string;
  requiredCredentials: string[];
  location: string;
  niceToHaves: string;
}

interface PreferenceStepData {
  urgency: string;
  outreachStyle: string;
  notifyEmail: string;
}

function StepHeader({ step }: { step: 1 | 2 | 3 }) {
  const progressPct = (step / 3) * 100;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Step {step} of 3
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Onboarding
        </p>
      </div>
      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border)' }}>
        <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progressPct}%`, backgroundColor: 'var(--accent)' }} />
      </div>
    </div>
  );
}

function AnimatedStatusRow() {
  const labels = ['Scout', 'Enrich', 'Signal', 'Engage'];
  return (
    <div className="flex flex-wrap items-center gap-2 justify-center mt-5">
      {labels.map((label, idx) => (
        <div key={label} className="flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-55"
              style={{ backgroundColor: 'var(--success)', animationDelay: `${idx * 140}ms` }}
            />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
          {idx < labels.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const { user, supabaseUser } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRoleId, setCreatedRoleId] = useState<string | null>(null);
  const [roleData, setRoleData] = useState<RoleStepData>({
    roleTitle: '',
    careSetting: CARE_SETTINGS[0],
    requiredCredentials: [],
    location: '',
    niceToHaves: '',
  });
  const [preferenceData, setPreferenceData] = useState<PreferenceStepData>({
    urgency: URGENCY_OPTIONS[0],
    outreachStyle: OUTREACH_STYLE_OPTIONS[1],
    notifyEmail: supabaseUser?.email ?? user?.email ?? '',
  });

  const canSubmitStep1 = useMemo(() => (
    roleData.roleTitle.trim().length > 0 &&
    roleData.location.trim().length > 0 &&
    roleData.requiredCredentials.length > 0
  ), [roleData]);

  const canSubmitStep2 = useMemo(() => preferenceData.notifyEmail.trim().length > 0, [preferenceData.notifyEmail]);

  async function handleStep1Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user?.org_id || !canSubmitStep1) return;
    setSaving(true);
    setError(null);

    const parsedNiceToHaves = roleData.niceToHaves
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    const { data, error: insertError } = await supabase
      .from('roles')
      .insert({
        org_id: user.org_id,
        title: roleData.roleTitle.trim(),
        care_setting: roleData.careSetting,
        required_credentials: roleData.requiredCredentials,
        location: roleData.location.trim(),
        must_have_requirements: roleData.requiredCredentials,
        nice_to_have_requirements: parsedNiceToHaves,
        description: roleData.niceToHaves.trim() || null,
      })
      .select('id')
      .single();

    if (insertError || !data?.id) {
      setError('Could not create role. Please try again.');
      setSaving(false);
      return;
    }

    setCreatedRoleId(data.id);
    setSaving(false);
    setStep(2);
  }

  async function handleStep2Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!createdRoleId || !canSubmitStep2) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('roles')
      .update({
        onboarding_urgency: preferenceData.urgency,
        onboarding_outreach_style: preferenceData.outreachStyle,
        onboarding_notify_email: preferenceData.notifyEmail.trim(),
      })
      .eq('id', createdRoleId)
      .eq('org_id', user?.org_id ?? '');

    if (updateError) {
      setError('Could not save sourcing preferences. Please try again.');
      setSaving(false);
      return;
    }

    setSaving(false);
    setStep(3);
  }

  async function handleFinish() {
    if (!user?.org_id) return;
    setSaving(true);
    setError(null);

    const { error: orgUpdateError } = await supabase
      .from('organizations')
      .update({ onboarding_complete: true })
      .eq('id', user.org_id);

    if (orgUpdateError) {
      setError('Could not complete onboarding. Please try again.');
      setSaving(false);
      return;
    }

    await onComplete();
    setSaving(false);
    navigate('/dashboard/pipeline');
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(9, 9, 11, 0.65)' }}>
      <div className="w-full max-w-2xl card p-8" style={{ borderColor: 'var(--border-strong)', boxShadow: '0 24px 70px rgba(0, 0, 0, 0.3)' }}>
        <StepHeader step={step} />

        {step === 1 && (
          <form onSubmit={(e) => void handleStep1Submit(e)} className="space-y-4">
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Create Your First Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Role title</span>
                <input
                  value={roleData.roleTitle}
                  onChange={(e) => setRoleData((prev) => ({ ...prev, roleTitle: e.target.value }))}
                  className="w-full"
                  style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', backgroundColor: 'var(--bg-surface)' }}
                  placeholder="Director of Nursing"
                />
              </label>
              <label className="space-y-1.5">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Care setting</span>
                <select
                  value={roleData.careSetting}
                  onChange={(e) => setRoleData((prev) => ({ ...prev, careSetting: e.target.value }))}
                  className="w-full"
                  style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', backgroundColor: 'var(--bg-surface)' }}
                >
                  {CARE_SETTINGS.map((setting) => <option key={setting} value={setting}>{setting}</option>)}
                </select>
              </label>
            </div>

            <label className="space-y-2 block">
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Required credentials</span>
              <div className="flex flex-wrap gap-2">
                {CREDENTIAL_OPTIONS.map((credential) => {
                  const selected = roleData.requiredCredentials.includes(credential);
                  return (
                    <button
                      key={credential}
                      type="button"
                      onClick={() => setRoleData((prev) => ({
                        ...prev,
                        requiredCredentials: selected
                          ? prev.requiredCredentials.filter((item) => item !== credential)
                          : [...prev.requiredCredentials, credential],
                      }))}
                      style={{
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '999px',
                        border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        backgroundColor: selected ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                        color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >
                      {credential}
                    </button>
                  );
                })}
              </div>
            </label>

            <div className="grid grid-cols-1 gap-4">
              <label className="space-y-1.5">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Location</span>
                <input
                  value={roleData.location}
                  onChange={(e) => setRoleData((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full"
                  style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', backgroundColor: 'var(--bg-surface)' }}
                  placeholder="Phoenix, AZ"
                />
              </label>
              <label className="space-y-1.5">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nice-to-haves (optional)</span>
                <textarea
                  value={roleData.niceToHaves}
                  onChange={(e) => setRoleData((prev) => ({ ...prev, niceToHaves: e.target.value }))}
                  className="w-full"
                  style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', minHeight: '92px', fontSize: '14px', backgroundColor: 'var(--bg-surface)' }}
                  placeholder="Line-separated preferences"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={!canSubmitStep1 || saving}>
                {saving ? 'Creating role...' : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => void handleStep2Submit(e)} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Sourcing Preferences</h2>
              <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
                <ChevronLeft size={14} />
                Back
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Urgency</span>
                <select
                  value={preferenceData.urgency}
                  onChange={(e) => setPreferenceData((prev) => ({ ...prev, urgency: e.target.value }))}
                  className="w-full"
                  style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', backgroundColor: 'var(--bg-surface)' }}
                >
                  {URGENCY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Outreach style</span>
                <select
                  value={preferenceData.outreachStyle}
                  onChange={(e) => setPreferenceData((prev) => ({ ...prev, outreachStyle: e.target.value }))}
                  className="w-full"
                  style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', backgroundColor: 'var(--bg-surface)' }}
                >
                  {OUTREACH_STYLE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <label className="space-y-1.5 block">
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Notify email</span>
              <input
                type="email"
                value={preferenceData.notifyEmail}
                onChange={(e) => setPreferenceData((prev) => ({ ...prev, notifyEmail: e.target.value }))}
                className="w-full"
                style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', backgroundColor: 'var(--bg-surface)' }}
              />
            </label>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={!canSubmitStep2 || saving}>
                {saving ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="flex justify-end mb-2">
              <button type="button" className="btn-ghost" onClick={() => setStep(2)}>
                <ChevronLeft size={14} />
                Back
              </button>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Alivio is now sourcing candidates for {roleData.roleTitle || 'your role'}
            </h2>
            <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              AI agents are spinning up your first pipeline now.
            </p>
            <AnimatedStatusRow />
            <button className="btn-primary mt-8" onClick={() => void handleFinish()} disabled={saving}>
              {saving ? 'Finishing...' : 'Go to Pipeline →'}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4" style={{ fontSize: '13px', color: 'var(--danger)' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
