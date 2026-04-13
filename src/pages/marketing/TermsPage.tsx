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

export default function TermsPage() {
  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: 'calc(100vh - 64px)' }}>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24">
        <div className="rounded-2xl border p-8 md:p-12" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#4F46E5' }}>Legal</p>
          <h1 className="font-bold text-white mb-3" style={{ fontSize: '48px', lineHeight: '1.05' }}>Terms of Service</h1>
          <p className="text-sm mb-10" style={{ color: '#6B6B6B' }}>
            Last updated: April 13, 2026
          </p>

          <div className="space-y-8">
            <section>
              <h2 style={sectionTitleStyle}>1. Acceptance of Terms</h2>
              <p style={paragraphStyle}>
                By accessing or using Alivio Search Partners services, website, and related applications, you agree to be bound by these Terms of Service.
                If you do not agree, do not use the service.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>2. Description of Service</h2>
              <p style={paragraphStyle}>
                Alivio Search Partners provides a healthcare staffing and recruiting SaaS platform that supports candidate sourcing,
                recruiting operations, workflow automation, and analytics for organizations and authorized users.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>3. User Accounts and Responsibilities</h2>
              <p style={paragraphStyle}>
                You are responsible for maintaining account confidentiality, restricting unauthorized access, and ensuring all information provided is accurate.
                You agree to use the platform in compliance with applicable laws, including privacy, employment, and anti-discrimination laws relevant to recruiting.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>4. Acceptable Use Policy</h2>
              <p style={paragraphStyle}>
                You may not use the service to violate laws, infringe intellectual property rights, transmit malicious code,
                interfere with platform operations, attempt unauthorized access, or engage in abusive, fraudulent, or deceptive conduct.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>5. Intellectual Property</h2>
              <p style={paragraphStyle}>
                The service, including software, branding, documentation, and related content, is owned by Alivio Search Partners and protected by applicable intellectual property laws.
                Except for limited usage rights granted under these terms, no ownership rights are transferred.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>6. Payment Terms</h2>
              <p style={paragraphStyle}>
                Paid plans are billed according to your selected subscription terms. Fees are non-refundable unless required by law or stated otherwise in a written agreement.
                You authorize us and our payment processors to charge applicable fees, taxes, and any overdue balances.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>7. Limitation of Liability</h2>
              <p style={paragraphStyle}>
                To the fullest extent permitted by law, Alivio Search Partners will not be liable for indirect, incidental, special, consequential,
                or punitive damages, or for lost profits, revenues, data, or business opportunities arising from or related to use of the service.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>8. Disclaimer of Warranties</h2>
              <p style={paragraphStyle}>
                The service is provided "as is" and "as available" without warranties of any kind, express or implied,
                including merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>9. Termination</h2>
              <p style={paragraphStyle}>
                We may suspend or terminate access if you violate these terms or if required for legal, security, or operational reasons.
                You may stop using the service at any time. Certain provisions, including payment obligations and liability limitations, survive termination.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>10. Governing Law</h2>
              <p style={paragraphStyle}>
                These terms are governed by applicable laws of the jurisdiction specified in your subscription agreement,
                without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>11. Changes to Terms</h2>
              <p style={paragraphStyle}>
                We may update these Terms of Service periodically. Continued use of the service after updates become effective constitutes acceptance of revised terms.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>12. Contact Information</h2>
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
