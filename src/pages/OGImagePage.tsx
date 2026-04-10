export default function OGImagePage() {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: '#09090B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" width="48" height="48">
          <rect width="40" height="40" rx="10" fill="#2563EB" />
          <path d="M20 8L10 32h5l2.5-6.25h5L25 32h5L20 8zm0 7.5l3.75 10h-7.5L20 15.5z" fill="white" />
        </svg>
        <span
          style={{
            fontSize: '64px',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#FAFAFA',
          }}
        >
          Alivio
        </span>
      </div>

      <p
        style={{
          fontSize: '28px',
          fontWeight: 400,
          lineHeight: 1.4,
          color: '#A1A1AA',
          textAlign: 'center',
          maxWidth: '600px',
          margin: 0,
        }}
      >
        AI Recruiting Platform for Healthcare
      </p>

      <div
        style={{
          marginTop: '40px',
          padding: '10px 24px',
          background: '#1a1a1f',
          border: '1px solid #27272a',
          borderRadius: '9999px',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 500, color: '#71717A' }}>
          aliviosearchpartners.com
        </span>
      </div>
    </div>
  );
}
