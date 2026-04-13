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
          <div className="trusted-logos-strip">
            {companies.map(name => (
              <span key={name} className="trusted-logo-text">{name}</span>
            ))}
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}
