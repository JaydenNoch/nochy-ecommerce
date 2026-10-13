'use client';

import { useEffect, useRef } from 'react';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'left' | 'right' | 'top' | 'bottom';
  style?: React.CSSProperties;
  threshold?: number;
  id?: string;
}

export default function AnimateOnScroll({
  children,
  className = '',
  animation = 'left',
  style,
  threshold = 0.12,
  id,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('anim-visible');
        } else {
          el.classList.remove('anim-visible');
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      id={id}
      className={`anim-on-scroll anim-${animation} ${className}`}
      style={{ ...style, position: 'relative', zIndex: 0 }}
    >
      {children}
    </div>
  );
}
