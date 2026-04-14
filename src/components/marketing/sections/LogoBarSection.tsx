import AnimateInView from '../AnimateInView';

export default function LogoBarSection() {
  return (
    <section style={{ background: '#F4F4F5', padding: '48px 0' }}>
      <div className="mkt-container">
        <AnimateInView>
          <p style={{ textAlign: 'center', fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Built for Hospital HR & Clinical Recruiting Teams
          </p>
        </AnimateInView>
      </div>
    </section>
  );
}
