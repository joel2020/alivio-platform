import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileText } from 'lucide-react';
import { supabaseFunctionsUrl } from '../../lib/supabase';
import './ApplicationForm.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const questions = [
  { key: 'location', label: 'Current location and preferred work arrangement', hint: 'City, country, and whether you prefer on-site, hybrid, or remote work.' },
  { key: 'experience', label: 'Relevant experience', hint: 'Briefly describe the experience you would bring to this position.' },
  { key: 'skills', label: 'Relevant skills, licenses, or certifications', hint: 'Focus on the requirements listed for this role.' },
  { key: 'availability', label: 'Availability to start', hint: 'Share your earliest start date or notice period.' },
  { key: 'interest', label: 'What interests you about this role?', hint: 'A few sentences are enough.' },
] as const;
type QuestionKey = typeof questions[number]['key'];
const steps = ['Contact & résumé', 'Your background', 'Review & submit'];

export default function ApplicationForm({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ first_name: '', last_name: '', email: '', phone: '', linkedin_url: '', website: '' });
  const [answers, setAnswers] = useState<Record<QuestionKey, string>>({ location: '', experience: '', skills: '', availability: '', interest: '' });
  const [resume, setResume] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(0);
  const attemptedSubmission = useRef<{ payload: string; resume: File } | null>(null);
  const [retryLocked, setRetryLocked] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => { if (error || reference) feedbackRef.current?.focus(); }, [error, reference]);
  useEffect(() => {
    if (previousStep.current !== step) stepRef.current?.focus();
    previousStep.current = step;
  }, [step]);

  function changeStep(next: number) {
    if (attemptedSubmission.current) return;
    setError(null);
    setStep(next);
  }

  function validateStep() {
    const fields = formRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`[data-step="${step}"] input:not([type="file"]), [data-step="${step}"] textarea`);
    for (const field of fields ?? []) {
      if ((field.required && !field.value.trim()) || !field.checkValidity()) {
        const label = field.labels?.[0]?.textContent?.trim() || 'this field';
        setError({ message: field.type === 'checkbox' ? 'Please acknowledge the applicant privacy notice before submitting.' : `Please check ${label.toLowerCase()}. ${field.validationMessage || 'An answer is required.'}`, field: field.id });
        return false;
      }
    }
    if (step === 0 && !resume) {
      setError({ message: 'Choose a PDF or DOCX résumé, up to 5 MB, to continue.', field: 'application-resume' });
      return false;
    }
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || (!attemptedSubmission.current && !validateStep())) return;
    if (step < 2) { changeStep(step + 1); return; }
    if (!resume || !consent) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45_000);
    try {
      if (!supabaseFunctionsUrl) throw new Error('Unavailable');
      // Keep the exact bytes and file immutable until the server confirms a definitive rejection.
      // A timeout or invalid response may arrive after the application was already saved.
      attemptedSubmission.current ??= {
        resume,
        payload: JSON.stringify({
          submission_id: crypto.randomUUID(),
          job_id: jobId,
          ...Object.fromEntries(Object.entries(contact).map(([key, value]) => [key, value.trim()])),
          privacy_consent: consent,
          questionnaire: Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, value.trim()])),
        }),
      };
      setRetryLocked(true);
      const body = new FormData();
      body.append('resume', attemptedSubmission.current.resume);
      body.append('payload', attemptedSubmission.current.payload);
      const response = await fetch(`${supabaseFunctionsUrl}/submit-application`, { method: 'POST', body, signal: controller.signal });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true || typeof result.reference !== 'string' || !result.reference.trim()) {
        const validationError = [400, 413, 415, 422].includes(response.status) && typeof result?.error === 'string' ? result.error.slice(0, 500) : null;
        if (validationError) {
          attemptedSubmission.current = null;
          setRetryLocked(false);
        }
        setError({ message: response.status === 429
          ? 'Please wait a moment, then retry your original submission. Your details and résumé are still here.'
          : response.status === 409
            ? 'We could not reconcile this submission. Retry your original submission, or email hello@aliviosearchpartners.com for help confirming it.'
            : validationError ? `${validationError} Your details and résumé are still here. You can go back to make changes.`
              : 'We could not confirm your application. Retry your original submission to check whether it was saved, or email hello@aliviosearchpartners.com.' });
        return;
      }
      setReference(result.reference);
    } catch {
      setError({ message: attemptedSubmission.current
        ? 'We could not confirm your application. Check your connection and retry your original submission, or email hello@aliviosearchpartners.com.'
        : 'We could not connect. Your details and résumé are still here. Please try again or email hello@aliviosearchpartners.com.' });
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  if (reference) return (
    <div className="candidate-application" ref={feedbackRef} role="status" tabIndex={-1}>
      <CheckCircle2 size={32} color="#188653" aria-hidden="true" />
      <h2>Application received.</h2>
      <p>Your application for <strong>{jobTitle}</strong> has been saved. Our team will review it and reach out if there’s a fit.</p>
      <p className="candidate-reference">Your reference <strong>{reference}</strong></p>
      <p>Keep this reference for your records. You can also explore other <Link to="/careers">open positions</Link>.</p>
    </div>
  );

  return (
    <div className="candidate-application">
      <h2>Apply for this role</h2>
      <p className="mkt-form-note">About 3 minutes. No account needed. All fields are required unless marked optional.</p>
      <ol className="candidate-steps" aria-label="Application progress">
        {steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={index < step ? 'is-complete' : undefined}><span aria-hidden="true">{index < step ? '✓' : index + 1}</span>{label}</li>)}
      </ol>
      <h3 ref={stepRef} tabIndex={-1}>Step {step + 1} of 3: {steps[step]}</h3>
      <form ref={formRef} onSubmit={event => void handleSubmit(event)} noValidate aria-busy={submitting}>
        <fieldset disabled={submitting} className="candidate-fieldset">
          <legend className="candidate-sr-only">Application details</legend>
          <div data-step="0" hidden={step !== 0}>
            <div className="mkt-form-fields">
              <div className="mkt-form-row">
                {(['first_name', 'last_name'] as const).map((key) => <label className="mkt-field" key={key}>{key === 'first_name' ? 'First name' : 'Last name'}<input id={`application-${key}`} name={key} required maxLength={100} autoComplete={key === 'first_name' ? 'given-name' : 'family-name'} value={contact[key]} onChange={event => setContact({ ...contact, [key]: event.target.value })} aria-invalid={error?.field === `application-${key}` || undefined} /></label>)}
              </div>
              <label className="mkt-field">Email<input id="application-email" name="email" type="email" required maxLength={254} autoComplete="email" spellCheck={false} value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} aria-invalid={error?.field === 'application-email' || undefined} /></label>
              <label className="mkt-field">Phone (optional)<input id="application-phone" name="phone" type="tel" maxLength={50} autoComplete="tel" value={contact.phone} onChange={event => setContact({ ...contact, phone: event.target.value })} aria-invalid={error?.field === 'application-phone' || undefined} /></label>
              <label className="mkt-field">LinkedIn URL (optional)<input id="application-linkedin_url" name="linkedin_url" type="url" maxLength={500} autoComplete="url" placeholder="https://www.linkedin.com/in/your-name" value={contact.linkedin_url} onChange={event => setContact({ ...contact, linkedin_url: event.target.value })} aria-invalid={error?.field === 'application-linkedin_url' || undefined} /></label>
              <div className="candidate-upload">
                <label className="mkt-field">Résumé<input id="application-resume" type="file" name="resume" required accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-describedby="application-resume-help application-resume-selected" aria-invalid={error?.field === 'application-resume' || undefined} onChange={event => {
                  const file = event.target.files?.[0] ?? null;
                  if (file && (!/\.(pdf|docx)$/i.test(file.name) || file.size === 0 || file.size > MAX_FILE_SIZE)) {
                    event.target.value = '';
                    setResume(null);
                    setError({ message: 'Choose a nonempty PDF or DOCX résumé no larger than 5 MB.', field: 'application-resume' });
                  } else { setResume(file); setError(null); }
                }} /></label>
                <p id="application-resume-help" className="mkt-form-note">PDF or DOCX · Maximum 5 MB. Uploaded when you submit.</p>
                <p id="application-resume-selected" className="candidate-file" aria-live="polite">{resume ? <><FileText size={18} aria-hidden="true" /><span>{resume.name} ({Math.max(1, Math.round(resume.size / 1024))} KB)</span></> : 'No résumé selected.'}</p>
              </div>
              <div className="mkt-honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" value={contact.website} onChange={event => setContact({ ...contact, website: event.target.value })} /></div>
            </div>
          </div>
          <div data-step="1" hidden={step !== 1}>
            <p className="mkt-form-note">Tell us a little about your background for {jobTitle}. Short answers are welcome.</p>
            <div className="mkt-form-fields">
              {questions.map(({ key, label, hint }) => <div key={key}>
                <label className="mkt-field">{label}<textarea id={`application-${key}`} name={key} rows={key === 'experience' || key === 'interest' ? 3 : 2} required maxLength={2000} aria-describedby={`application-${key}-hint`} aria-invalid={error?.field === `application-${key}` || undefined} value={answers[key]} onChange={event => setAnswers({ ...answers, [key]: event.target.value })} /></label>
                <p id={`application-${key}-hint`} className="mkt-form-note">{hint} Up to 2,000 characters.</p>
              </div>)}
            </div>
          </div>
          <div data-step="2" hidden={step !== 2}>
            <p className="mkt-form-note">Check your details before submitting to {jobTitle}.</p>
            <div className="candidate-review-heading"><h4>Contact & résumé</h4><button type="button" disabled={retryLocked} onClick={() => changeStep(0)}>Edit contact details</button></div>
            <dl className="candidate-review">
              <div><dt>Name</dt><dd>{contact.first_name} {contact.last_name}</dd></div>
              <div><dt>Email</dt><dd>{contact.email}</dd></div>
              {contact.phone && <div><dt>Phone</dt><dd>{contact.phone}</dd></div>}
              {contact.linkedin_url && <div><dt>LinkedIn</dt><dd>{contact.linkedin_url}</dd></div>}
              <div><dt>Résumé</dt><dd>{resume?.name}</dd></div>
            </dl>
            <div className="candidate-review-heading"><h4>Your background</h4><button type="button" disabled={retryLocked} onClick={() => changeStep(1)}>Edit answers</button></div>
            <dl className="candidate-review">{questions.map(({ key, label }) => <div key={key}><dt>{label}</dt><dd>{answers[key]}</dd></div>)}</dl>
            <label className="candidate-consent"><input id="application-consent" type="checkbox" required disabled={retryLocked} checked={consent} onChange={event => setConsent(event.target.checked)} aria-invalid={error?.field === 'application-consent' || undefined} /><span>I acknowledge the <Link to="/privacy" target="_blank" rel="noopener noreferrer">applicant privacy notice (opens in a new tab)</Link> and consent to Alivio using my details and résumé to review this application.</span></label>
          </div>
          {retryLocked && !submitting && <p className="mkt-form-note">Your original application is kept unchanged while we confirm its status. Editing is paused to avoid creating a duplicate. Retry sends the same details and résumé.</p>}
          {error && <div className="candidate-error" ref={feedbackRef} role="alert" tabIndex={-1}>{error.message}{error.field && <button type="button" onClick={() => document.getElementById(error.field!)?.focus()}>Go to field</button>}</div>}
          <div className="candidate-actions">
            {step > 0 && <button type="button" className="candidate-back" disabled={retryLocked} onClick={() => changeStep(step - 1)}>Back</button>}
            <button type="submit" className="mkt-btn-primary">{submitting ? 'Submitting…' : retryLocked ? 'Retry original submission' : step === 2 ? 'Submit application' : step === 0 ? 'Continue to background' : 'Review application'}</button>
          </div>
        </fieldset>
        {submitting && <p role="status" className="candidate-submitting">Uploading your résumé and saving your application. Please keep this page open.</p>}
      </form>
    </div>
  );
}
