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
              <h2 style={sectionTitleStyle}>1. Scope and Roles</h2>
              <p style={paragraphStyle}>
                This Privacy Policy explains how Alivio Search Partners, Inc. ("Alivio," "we," "us," or "our") collects, uses, discloses, and protects personal information when you use our website, software platform, APIs, and related services (collectively, the "Services").
                In many cases, our business customers act as controllers or businesses and Alivio acts as a processor or service provider for candidate and workforce data they submit to the platform.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>2. Categories of Information We Collect</h2>
              <p style={paragraphStyle}>
                We collect: (a) account and profile data (name, work email, company, role, login credentials); (b) recruiting and candidate workflow data uploaded by customers;
                (c) communications and support records; (d) transaction and billing metadata; (e) technical and device data such as IP address, browser type, logs, and session identifiers;
                and (f) usage analytics and diagnostic data to operate, secure, and improve the Services.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>3. Sources of Information</h2>
              <p style={paragraphStyle}>
                We obtain information directly from users and customers, automatically through interaction with the Services, from integrations configured by customers,
                and from service providers that support identity verification, security, infrastructure, communications, and payments.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>4. Purposes and Legal Bases for Processing</h2>
              <p style={paragraphStyle}>
                We process personal information to provide contracted services, authenticate users, secure systems, perform analytics, provide customer support,
                comply with legal obligations, and enforce agreements. Where applicable under GDPR/UK GDPR, our legal bases include performance of a contract,
                legitimate interests, compliance with law, and consent (for example, for optional non-essential cookies where required).
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>5. Cookies and Similar Technologies</h2>
              <p style={paragraphStyle}>
                We use cookies and similar technologies for essential session management, security, preferences, and platform performance. Where legally required,
                we obtain consent before placing non-essential cookies. Browser settings may allow you to refuse cookies, but some functionality may be degraded.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>6. Disclosures to Third Parties</h2>
              <p style={paragraphStyle}>
                We may disclose information to subprocessors and vendors that help operate the Services (e.g., hosting, authentication, support, and payment providers),
                to professional advisors, and to authorities when required by law. We do not sell personal information for monetary consideration.
                We do not share personal information for cross-context behavioral advertising except as may be permitted by customer configuration and applicable law.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>7. International Transfers</h2>
              <p style={paragraphStyle}>
                If personal information is transferred across borders, we use lawful transfer mechanisms where required, which may include Standard Contractual Clauses,
                adequacy decisions, or comparable safeguards.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>8. Data Retention</h2>
              <p style={paragraphStyle}>
                We retain personal information for as long as needed to deliver Services, satisfy contractual commitments, resolve disputes, maintain audit trails,
                and comply with legal, tax, and accounting requirements. Retention periods vary by data type, customer instructions, and legal obligations.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>9. Security</h2>
              <p style={paragraphStyle}>
                We maintain administrative, technical, and organizational safeguards designed to protect personal information, including access controls,
                role-based permissions, encryption in transit, and security monitoring. No method of storage or transmission is completely secure.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>10. Your Privacy Rights</h2>
              <p style={paragraphStyle}>
                Depending on your jurisdiction, you may have rights to access, correct, delete, restrict, object to processing, and request portability of personal information,
                and to appeal certain decisions. U.S. state residents may have rights under laws such as the CCPA/CPRA. If we process data on behalf of a customer,
                we will direct your request to the relevant customer when appropriate.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>11. Children</h2>
              <p style={paragraphStyle}>
                The Services are intended for business users and are not directed to children under 16. If you believe information from a child was provided to us,
                please contact us so we can take appropriate action.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>12. Changes to This Policy</h2>
              <p style={paragraphStyle}>
                We may update this Privacy Policy periodically. If we make material changes, we will update the "Last updated" date and provide additional notice when required by law.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>13. Contact Us</h2>
              <p style={paragraphStyle}>
                Alivio Search Partners, Inc.<br />
                Website: aliviosearchpartners.com<br />
                Email: privacy@aliviosearchpartners.com
              </p>
            </section>
          </div>

          <p className="text-xs mt-12 pt-6 border-t" style={{ color: '#6B6B6B', borderColor: '#1E1E1E' }}>
            © 2026 Alivio Search Partners. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
