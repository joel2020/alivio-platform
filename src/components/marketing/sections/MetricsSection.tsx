import { useEffect, useRef, useState } from 'react';
import AnimateInView from '../AnimateInView';

const metrics = [
  { label: 'Candidates sourced in beta', num: 847, suffix: '+' },
  { label: 'Average match accuracy on scored candidates', num: 94, suffix: '%' },
  { label: 'Faster than traditional agency timelines', num: 3, suffix: 'x' },
];

function CountUpNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const duration = 1200;
          const startTime = performance.now();
          const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.round(easeOut(progress) * target));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function MetricsSection() {
  return (
    <section style={{ padding: '60px 0', background: '#F4F4F5' }}>
      <div className="mkt-container">
        <AnimateInView>
          <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '64px' }}>
            {metrics.map((m) => (
              <div
                key={m.num}
                className="metric-card-item"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E4E7',
                  borderRadius: '16px',
                  padding: '40px 32px',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{
                  fontSize: '56px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  lineHeight: 1,
                  marginBottom: '12px',
                  letterSpacing: '-0.03em',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  <CountUpNumber target={m.num} suffix={m.suffix} />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{m.label}</p>
              </div>
            ))}
          </div>
        </AnimateInView>

        <AnimateInView delay={200}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <p style={{ fontSize: '18px', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px 0' }}>
              "Previously operated as Alivio Search Partners — placing candidates at high-growth startups since 2019. We built this platform because we lived the problem."
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              — The Alivio Team
            </p>
          </div>
        </AnimateInView>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
