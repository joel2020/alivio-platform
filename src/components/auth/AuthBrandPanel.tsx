import { AlivioMark } from '../brand/AlivioLogo';

const features = [
  'AI-powered candidate sourcing',
  'Automated outreach generation',
  'Continuous pipeline updates',
];

export default function AuthBrandPanel() {
  return (
    <div
      className="hidden lg:flex flex-col items-center justify-between"
      style={{
        width: '50%',
        minHeight: '100vh',
        backgroundColor: '#09090B',
        padding: '48px 56px',
      }}
    >
      <div />

      <div className="flex flex-col items-center text-center" style={{ maxWidth: '360px' }}>
        <div className="flex items-center gap-2.5 mb-8">
          <AlivioMark size={28} variant="dark" />
          <span
            style={{
              color: '#FAFAFA',
              fontWeight: 700,
              fontSize: '22px',
              letterSpacing: '-0.025em',
            }}
          >
            Alivio
          </span>
        </div>

        <p
          style={{
            color: '#A1A1AA',
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '320px',
          }}
        >
          Your AI recruiting team that never stops working
        </p>

        <div className="flex flex-col gap-3 w-full" style={{ maxWidth: '280px' }}>
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <span
                style={{
                  color: '#10B981',
                  fontSize: '14px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  color: '#71717A',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p
        style={{
          color: '#71717A',
          fontSize: '12px',
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        Trusted by 50+ hiring teams
      </p>
    </div>
  );
}
