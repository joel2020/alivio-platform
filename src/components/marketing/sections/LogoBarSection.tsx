import AnimateInView from '../AnimateInView';

const companies = ['Midwest Health System', 'Sunrise Senior Living', 'Regional Medical Center', 'Pacific Care Network', 'Horizon Health Partners', 'Crestview Healthcare'];

export default function LogoBarSection() {
  return (
    <section style={{ background: '#F4F4F5', padding: '64px 0' }}>
      <div className="mkt-container">
        <AnimateInView>
          <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
            TRUSTED BY HEALTHCARE HIRING TEAMS
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
