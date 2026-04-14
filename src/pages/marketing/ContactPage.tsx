import { FormEvent, useState } from 'react';

type ContactFormState = {
  name: string;
  email: string;
  company: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: '',
  email: '',
  company: '',
  message: '',
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setForm(initialFormState);
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#4F46E5' }}>
          Contact
        </p>
        <h1 className="font-bold text-white mb-4" style={{ fontSize: '48px', lineHeight: '1.05' }}>
          Book a Demo
        </h1>
        <p className="mb-10" style={{ color: '#A0A0A0', lineHeight: '1.7' }}>
          Tell us about your healthcare hiring goals and we&apos;ll follow up to schedule a live platform walkthrough.
        </p>

        <form onSubmit={onSubmit} className="space-y-5 p-6 rounded-xl border" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
          <div>
            <label htmlFor="name" className="block text-sm mb-2" style={{ color: '#E5E7EB' }}>Name</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-md border px-4 py-2.5 text-sm bg-transparent"
              style={{ borderColor: '#2B2B2B', color: '#F9FAFB' }}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm mb-2" style={{ color: '#E5E7EB' }}>Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-md border px-4 py-2.5 text-sm bg-transparent"
              style={{ borderColor: '#2B2B2B', color: '#F9FAFB' }}
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm mb-2" style={{ color: '#E5E7EB' }}>Company</label>
            <input
              id="company"
              required
              value={form.company}
              onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
              className="w-full rounded-md border px-4 py-2.5 text-sm bg-transparent"
              style={{ borderColor: '#2B2B2B', color: '#F9FAFB' }}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm mb-2" style={{ color: '#E5E7EB' }}>Message</label>
            <textarea
              id="message"
              required
              rows={5}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              className="w-full rounded-md border px-4 py-2.5 text-sm bg-transparent"
              style={{ borderColor: '#2B2B2B', color: '#F9FAFB' }}
            />
          </div>

          <button type="submit" className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5' }}>
            Submit
          </button>

          {submitted && (
            <p className="text-sm" style={{ color: '#22C55E' }}>
              Thanks! Your demo request has been received. Our team will contact you shortly.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
