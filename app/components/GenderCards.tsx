'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GenderCardProps {
  gender: 'man' | 'woman';
  label: string;
  image: string;
}

function GenderCard({ gender, label, image }: GenderCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    // Delay navigasi sedikit biar animasi press keliatan
    setTimeout(() => {
      router.push(`/shop?category=${gender}`);
    }, 180);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        width: '100%',
        height: '520px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundColor: '#d1d1d1',
        // Animasi press: sedikit mengecil
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.15s ease',
      }}
    >
      {/* Gambar — zoom saat hover */}
      <img
        src={image}
        alt={label}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transform: isHovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />

      {/* Overlay gelap — lebih gelap saat hover */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: isHovered
          ? 'rgba(0, 0, 0, 0.35)'
          : 'rgba(0, 0, 0, 0.08)',
        transition: 'background-color 0.4s ease',
      }} />

      {/* Label atas kiri */}
      <div style={{
        position: 'absolute',
        top: '32px',
        left: '32px',
        zIndex: 10,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.35s ease',
      }}>
        <h3 style={{
          fontSize: '36px',
          fontWeight: '900',
          textTransform: 'uppercase',
          margin: 0,
          fontFamily: 'Impact, sans-serif',
          lineHeight: '1',
          color: '#ffffff',
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          {label}
        </h3>
        <span style={{
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.8)',
        }}>
          COLLECTION
        </span>
      </div>

      {/* CTA button — muncul saat hover dari bawah */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '32px',
        zIndex: 10,
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#ffffff',
          color: '#121212',
          padding: '10px 20px',
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          SHOP {label}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10M7 3L10 6L7 9" stroke="#121212" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        </div>
      </div>

      {/* Blue accent line bawah — slide masuk saat hover */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '4px',
        backgroundColor: '#0000FF',
        width: isHovered ? '100%' : '0%',
        transition: 'width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }} />
    </div>
  );
}

export default function GenderCards() {
  return (
    <section className="gender-cards-section">
      <GenderCard
        gender="man"
        label="MENS"
        image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80"
      />
      <GenderCard
        gender="woman"
        label="WOMENS"
        image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
      />
    </section>
  );
}
