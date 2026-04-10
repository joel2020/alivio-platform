import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  className?: string;
}

export default function AnimateInView({ children, delay = 0, style, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? 'aiv-visible' : 'aiv-hidden'} ${className || ''}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
