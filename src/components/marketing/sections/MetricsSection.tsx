import { useEffect, useRef, useState } from 'react';
import AnimateInView from '../AnimateInView';

const metrics = [
  { label: 'Candidates sourced in beta', num: 10000, suffix: '+' },
  { label: 'Average match accuracy on scored candidates', num: 94, suffix: '%' },
  { label: 'Faster than traditional agency timelines', num: 5, suffix: 'x' },
];

function CountUpNumber({ target, suffix, shouldAnimate }: { target: number; suffix: string; shouldAnimate: boolean }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasAnimated.current) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setCount(target);
      hasAnimated.current = true;
      return;
    }

    hasAnimated.current = true;
    const duration = 2000;
    const startTime = performance.now();
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    let frameId = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOutQuart(progress) * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      setCount(target);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [shouldAnimate, target]);

  return <span>{count}{suffix}</span>;
}

export default function MetricsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const triggerAnimation = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;
      setShouldAnimate(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      triggerAnimation();
      observer.disconnect();
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ padding: '60px 0', background: '#F4F4F5' }}>
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
                  <CountUpNumber target={m.num} suffix={m.suffix} shouldAnimate={shouldAnimate} />
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
