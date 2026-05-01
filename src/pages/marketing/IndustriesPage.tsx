export default function IndustriesPage() {
  return (
    <section style={{ padding: '92px 0 72px', background: '#fff' }}>
      <div className="mkt-container" style={{ maxWidth: 1040 }}>
        <p className="mkt-label" style={{ color: '#1D55C6' }}>WHO WE HELP</p>
        <h1 style={{ fontSize: 'clamp(36px,4.5vw,54px)', letterSpacing: '-0.04em', margin: '8px 0 16px' }}>Built for Healthcare + AI Companies Scaling Fast</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
          {[
            ['HealthTech Startups', 'Seed to Series C teams hiring core product and engineering talent after a raise.'],
            ['Behavioral Health Platforms', 'Teams building AI documentation, reimbursement, and audit-ready workflow products.'],
            ['AI-Native Software Companies', 'Companies shipping regulated workflows where model quality and compliance both matter.'],
            ['Healthcare Providers', 'Organizations hiring technical operators, clinical operations leaders, and revenue cycle talent.'],
          ].map(([title, copy]) => (
            <div key={title} style={{ border: '1px solid #DCE4F2', borderRadius: 16, padding: 20, background: '#F8FBFF' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>{title}</h2>
              <p style={{ margin: 0, color: '#4B5D7D' }}>{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
