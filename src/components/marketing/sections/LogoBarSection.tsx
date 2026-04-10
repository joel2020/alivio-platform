import AnimateInView from '../AnimateInView';

const companies = ['Beacon Labs', 'Meridian', 'Vantage Co', 'Northstar', 'Elevate HQ', 'Foundry'];

export default function LogoBarSection() {
  return (
    <section style={{ background: '#F4F4F5', padding: '64px 0' }}>
      <div className="mkt-container">
        <AnimateInView>
          <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
            Trusted by forward-thinking hiring teams
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {companies.map(name => (
              <div key={name} style={{ opacity: 0.35, filter: 'grayscale(1)' }}>
                <div style={{
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{ width: '24px', height: '24px', background: 'var(--text-secondary)', borderRadius: '6px', opacity: 0.6 }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{name}</span>
                </div>
              </div>
            ))}
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}
