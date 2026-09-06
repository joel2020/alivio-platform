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
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#A5B4FC' }}>Legal</p>
          <h1 className="font-bold text-white mb-3" style={{ fontSize: '48px', lineHeight: '1.05' }}>Terms of Service</h1>
          <p className="text-sm mb-10" style={{ color: '#A0A0A0' }}>
            Last updated: April 13, 2026
          </p>

          <div className="space-y-8">
            <section>
              <h2 style={sectionTitleStyle}>1. Agreement and Eligibility</h2>
              <p style={paragraphStyle}>
                These Terms of Service ("Terms") are a binding agreement between you and Alivio Search Partners, Inc. ("Alivio," "we," "our," or "us").
                By accessing or using the Services, you represent that you have authority to bind the entity you act for and agree to these Terms.
                If you do not agree, do not use the Services.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>2. Services and Customer Data</h2>
              <p style={paragraphStyle}>
                Alivio provides a software platform for recruiting operations, workflow automation, and analytics. As between the parties,
                customers retain ownership of Customer Data submitted to the Services. You grant us rights necessary to host, process, transmit,
                and display Customer Data solely to provide and improve the Services and as required by law.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>3. Accounts, Security, and Acceptable Use</h2>
              <p style={paragraphStyle}>
                You are responsible for account credentials, user activity under your account, and compliance with all applicable laws,
                including employment, anti-discrimination, privacy, and communications laws. You must not misuse the Services,
                reverse engineer protected components, transmit malware, probe vulnerabilities without authorization, or interfere with platform operations.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>4. AI-Assisted Features</h2>
              <p style={paragraphStyle}>
                Certain features may generate summaries, recommendations, or other outputs using automated tools. Outputs are probabilistic,
                may contain errors, and must be reviewed by qualified personnel before making hiring or business decisions.
                You are solely responsible for final decisions and legal compliance in your recruiting workflows.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>5. Fees, Taxes, and Renewals</h2>
              <p style={paragraphStyle}>
                Paid subscriptions are billed under the applicable order form or self-serve plan. Unless otherwise stated, fees are due in advance,
                non-cancelable for the committed term, and non-refundable except where required by law. You are responsible for taxes,
                excluding taxes based on Alivio's net income.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>6. Confidentiality</h2>
              <p style={paragraphStyle}>
                Each party may receive non-public information from the other. The receiving party will use confidential information only to perform under these Terms
                and protect it with reasonable care. Confidentiality obligations do not apply to information that is public through no fault of the receiving party,
                independently developed, or rightfully obtained from a third party without duty of confidentiality.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>7. Intellectual Property</h2>
              <p style={paragraphStyle}>
                Alivio and its licensors retain all rights, title, and interest in the Services, software, and related materials.
                No rights are granted except as expressly stated in these Terms. You may provide feedback, and Alivio may use it without restriction or payment.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>8. Warranties and Disclaimers</h2>
              <p style={paragraphStyle}>
                Each party warrants it has authority to enter into these Terms. Except as expressly provided, the Services are provided "as is" and "as available."
                To the fullest extent permitted by law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>9. Indemnification</h2>
              <p style={paragraphStyle}>
                You will indemnify and hold harmless Alivio from third-party claims arising from your Customer Data,
                your use of the Services in violation of these Terms, or your violation of applicable law.
                Alivio will indemnify you from third-party claims alleging that the Services infringe valid intellectual property rights,
                subject to customary exclusions and procedures.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>10. Limitation of Liability</h2>
              <p style={paragraphStyle}>
                To the fullest extent permitted by law, neither party is liable for indirect, incidental, special, consequential, exemplary,
                or punitive damages, or lost profits, revenues, goodwill, or data. Except for excluded liabilities,
                each party's aggregate liability under these Terms will not exceed amounts paid or payable by you to Alivio in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>11. Term, Suspension, and Termination</h2>
              <p style={paragraphStyle}>
                These Terms remain in effect while you use the Services. We may suspend access for security risks, non-payment, or material breach.
                Either party may terminate for uncured material breach. Upon termination, your access ends and each party may retain data as required by law,
                contract, or legitimate recordkeeping obligations.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>12. Governing Law and Dispute Resolution</h2>
              <p style={paragraphStyle}>
                These Terms are governed by the laws of the State of Delaware, excluding conflict-of-law rules.
                The parties consent to exclusive venue in the state or federal courts located in Delaware,
                unless a separate signed agreement provides otherwise.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>13. General Terms</h2>
              <p style={paragraphStyle}>
                These Terms, together with any applicable order form or data processing addendum, are the entire agreement regarding the Services.
                If any provision is unenforceable, the remaining provisions remain in effect. You may not assign these Terms without our consent,
                except in connection with a permitted merger or sale of substantially all assets.
              </p>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>14. Contact</h2>
              <p style={paragraphStyle}>
                Alivio Search Partners, Inc.<br />
                Website: aliviosearchpartners.com<br />
                Email: legal@aliviosearchpartners.com
              </p>
            </section>
          </div>

          <p className="text-xs mt-12 pt-6 border-t" style={{ color: '#A0A0A0', borderColor: '#1E1E1E' }}>
            © 2026 Alivio Search Partners. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
