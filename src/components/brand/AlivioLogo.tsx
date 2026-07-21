/**
 * Alivio brand mark and logo lockup, matching the official banner:
 * a split "A" — teal left leg with a horizontal foot, solid right leg
 * (white on dark surfaces, deep navy on light) — beside the ALIVIO
 * wordmark with wide tracking and a teal "SEARCH PARTNERS" subtitle.
 */

export const BRAND_TEAL = '#57C4B8';
export const BRAND_NAVY = '#0B2545';

export function AlivioMark({
  size = 28,
  variant = 'light',
  title = 'Alivio',
}: {
  size?: number;
  /** 'light' = mark sits on a light background; 'dark' = on navy/black. */
  variant?: 'light' | 'dark';
  title?: string;
}) {
  const legColor = variant === 'dark' ? '#FFFFFF' : BRAND_NAVY;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label={title}
    >
      {/* Right leg */}
      <path d="M50 6 L88 92 H68 L36 20 Z" fill={legColor} />
      {/* Teal left leg with horizontal foot */}
      <path d="M50 6 L64 6 L34 74 H62 V92 H12 Z" fill={BRAND_TEAL} />
    </svg>
  );
}

export function AlivioLogo({
  variant = 'light',
  markSize = 30,
  wordSize = 24,
  subtitle = true,
}: {
  variant?: 'light' | 'dark';
  markSize?: number;
  wordSize?: number;
  subtitle?: boolean;
}) {
  const wordColor = variant === 'dark' ? '#FFFFFF' : BRAND_NAVY;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(markSize * 0.38) }}>
      <AlivioMark size={markSize} variant={variant} />
      <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, lineHeight: 1 }}>
        <span
          style={{
            fontSize: wordSize,
            fontWeight: 700,
            color: wordColor,
            letterSpacing: '0.26em',
            lineHeight: 1,
          }}
        >
          ALIVIO
        </span>
        {subtitle ? (
          <span
            style={{
              fontSize: Math.max(8, Math.round(wordSize * 0.36)),
              fontWeight: 600,
              color: BRAND_TEAL,
              letterSpacing: '0.44em',
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            SEARCH PARTNERS
          </span>
        ) : null}
      </span>
    </span>
  );
}
