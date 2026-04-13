const sectionTitleStyle = {
  fontSize: '22px',
  color: '#FFFFFF',
  margin: '0 0 12px 0',
  letterSpacing: '-0.01em',
};

const paragraphStyle = {
  color: '#A0A0A0',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: 0,
};

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: 'calc(100vh - 64px)' }}>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24">
        <div className="rounded-2xl border p-8 md:p-12" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#4F46E5' }}>Legal</p>
          <h1 className="font-bold text-white mb-3" style={{ fontSize: '48px', lineHeight: '1.05' }}>Privacy Policy</h1>
          <p className="text-sm mb-10" style={{ color: '#6B6B6B' }}>
            Last updated: April 13, 2026
          </p>

          <div className="space-y-8">
            <section>
              <h2 style={sectionTitleStyle}>1. Information We Collect</h2>
              <p style={paragraphStyle}>
                Alivio Search Partners collects information you provide directly, information generated through platform use, and technical data collected automatically.
                This may include account registration details, employer and recruiter profile information, job requisition data, candidate pipeline data,
                communication preferences, billing details, support interactions, device information, log data, and usage analytics.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>2. How We Use Information</h2>
              <p style={paragraphStyle}>
                We use collected information to provide and improve our healthcare staffing and recruiting SaaS services, operate platform features,
                personalize workflows, process transactions, monitor performance and security, respond to inquiries, send operational communications,
                and comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>3. Data Sharing and Third Parties</h2>
              <p style={paragraphStyle}>
                We do not sell personal information. We may share information with trusted service providers that support hosting, analytics,
                customer support, communications, payment processing, and infrastructure operations. We may also disclose information when required by law,
                to protect rights and safety, or in connection with a merger, acquisition, financing, or asset sale.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>4. Cookies and Tracking Technologies</h2>
              <p style={paragraphStyle}>
                We use cookies and similar technologies to maintain session functionality, remember preferences, analyze traffic, and improve user experience.
                You can control cookie preferences through browser settings; however, disabling certain cookies may affect site functionality.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>5. Data Security</h2>
              <p style={paragraphStyle}>
                We maintain administrative, technical, and organizational safeguards designed to protect information against unauthorized access,
                disclosure, alteration, and destruction. No system is completely secure, but we continually evaluate and enhance our controls.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>6. User Rights (CCPA/GDPR Basics)</h2>
              <p style={paragraphStyle}>
                Depending on your location, you may have rights to request access to, correction of, deletion of, or portability of your personal data,
                and to object to or restrict certain processing. California residents may have rights under CCPA/CPRA, and users in the EEA/UK may have rights under GDPR.
                To exercise rights, contact us using the email below. We may need to verify identity before processing requests.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>7. Data Retention</h2>
              <p style={paragraphStyle}>
                We retain information for as long as necessary to provide services, meet contractual commitments, resolve disputes,
                enforce agreements, and comply with legal obligations. Retention periods vary based on data category, legal requirements, and business needs.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>8. Changes to This Policy</h2>
              <p style={paragraphStyle}>
                We may update this Privacy Policy from time to time. If we make material changes, we will update the "Last updated" date and,
                where required, provide additional notice.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>9. Contact Information</h2>
              <p style={paragraphStyle}>
                Alivio Search Partners<br />
                Website: aliviosearchpartners.com<br />
                Email: hello@aliviosearchpartners.com
              </p>
            </section>
          </div>

          <p className="text-xs mt-12 pt-6 border-t" style={{ color: '#6B6B6B', borderColor: '#1E1E1E' }}>
            © 2026 Alivio. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
