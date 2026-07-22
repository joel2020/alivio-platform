import { useSeo } from '../../lib/seo';

const sectionTitleStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' };
const paragraphStyle: React.CSSProperties = { color: '#A0A0A0', lineHeight: 1.75, fontSize: '15px' };

export default function AccessibilityPage() {
  useSeo({
    title: 'Accessibility Statement | Alivio Search Partners',
    description:
      'Alivio Search Partners is committed to an accessible website and platform for all users, targeting WCAG 2.1 AA. How to report an accessibility issue.',
    canonicalUrl: 'https://aliviosearchpartners.com/accessibility',
  });

  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-bold text-white mb-2" style={{ fontSize: '36px' }}>Accessibility Statement</h1>
        <p className="mb-10" style={{ color: '#6B6B6B', fontSize: '14px' }}>Last updated: July 22, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 style={sectionTitleStyle}>Our commitment</h2>
            <p style={paragraphStyle}>
              Alivio Search Partners is committed to making our website and recruiting platform usable by everyone,
              including people who rely on assistive technologies. Our target standard is the Web Content
              Accessibility Guidelines (WCAG) 2.1, Level AA.
            </p>
          </section>

          <section>
            <h2 style={sectionTitleStyle}>Measures we take</h2>
            <p style={paragraphStyle}>
              We build with semantic HTML, labeled form controls, keyboard-operable navigation and menus, visible
              focus states, sufficient color contrast on text, alternative text for meaningful imagery, and captions
              or transcripts for narrated video content. Accessibility checks are part of our development review for
              new pages and features.
            </p>
          </section>

          <section>
            <h2 style={sectionTitleStyle}>Known limitations</h2>
            <p style={paragraphStyle}>
              Some older content and embedded third-party components (for example, scheduling widgets) may not yet
              fully conform. We prioritize fixes as issues are identified and when third-party providers release
              accessible updates.
            </p>
          </section>

          <section>
            <h2 style={sectionTitleStyle}>Report an issue</h2>
            <p style={paragraphStyle}>
              If you encounter an accessibility barrier on this site or in the Alivio platform, email
              hello@aliviosearchpartners.com with the subject line "Accessibility" and a description of the page and
              problem. We aim to acknowledge reports within 7 days and to remediate confirmed issues promptly. If you
              need assistance with a job application, we will provide an alternative application path.
            </p>
          </section>
        </div>

        <p className="text-xs mt-12 pt-6 border-t" style={{ color: '#6B6B6B', borderColor: '#1E1E1E' }}>
          © 2026 Alivio Search Partners. All rights reserved.
        </p>
      </section>
    </div>
  );
}
