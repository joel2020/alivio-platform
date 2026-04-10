import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div
      style={{ minHeight: '100vh', background: '#FAFAFA' }}
      className="flex flex-col items-center justify-center px-6"
    >
      <div className="text-center max-w-md">
        <p
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#2563EB',
            marginBottom: '16px',
          }}
        >
          404 Error
        </p>

        <h1
          style={{
            fontSize: '40px',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: '#09090B',
            marginBottom: '16px',
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: 1.7,
            color: '#71717A',
            marginBottom: '40px',
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '44px',
            padding: '0 24px',
            background: '#2563EB',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 600,
            borderRadius: '10px',
            textDecoration: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#1D4ED8';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#2563EB';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
          }}
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
