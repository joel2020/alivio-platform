export default function TermsPage() {
  return (
    <section style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
      <div className="mkt-container" style={{ maxWidth: '760px' }}>
        <div style={{ textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 32px' }}>
          <h1 style={{ fontSize: '40px', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>Terms of Service</h1>
          <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted)', fontSize: '14px' }}>Last updated: January 2025</p>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '16px' }}>
            These terms will be updated soon. For questions, contact admin@aliviosearchpartners.com
          </p>
        </div>
      </div>
    </section>
  );
}
