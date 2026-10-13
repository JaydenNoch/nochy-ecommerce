'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface HeroProps {
  badge: string;
  title: string;
  subtitle: string;
  image: string;
}

export default function HeroParallax({ badge, title, subtitle, image }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      heroEl.style.backgroundPositionY = `calc(50% + ${scrollY * 0.4}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero-fixed-bg"
      style={{ backgroundImage: `url("${image}")` }}
    >
      {/* Overlay gelap */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(30, 41, 59, 0.4)' }} />

      <div style={{ position: 'absolute', bottom: '60px', left: '40px', color: '#ffffff', zIndex: 10, maxWidth: '600px' }}>
        <span style={{
          display: 'inline-block', padding: '4px 10px',
          backgroundColor: '#ffffff', color: '#000000',
          fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: '16px'
        }}>
          {badge}
        </span>

        <h1 style={{
          fontSize: '64px', fontWeight: '900', textTransform: 'uppercase',
          lineHeight: '0.95', margin: '0 0 16px 0',
          fontFamily: 'Impact, sans-serif', letterSpacing: '0.02em'
        }}>
          {title}
        </h1>

        <p style={{ fontSize: '12px', color: '#e2e8f0', marginBottom: '24px', lineHeight: '1.5' }}>
          {subtitle}
        </p>

        <Link href="/shop?category=man" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#0000FF', color: '#ffffff',
          padding: '12px 28px', fontSize: '12px', fontWeight: 'bold',
          textDecoration: 'none', textTransform: 'uppercase'
        }}>
          Explore ↗
        </Link>
      </div>
    </section>
  );
}