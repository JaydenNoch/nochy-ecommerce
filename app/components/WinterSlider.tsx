'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number | null;
  image_url: string;
  hover_image_url?: string;
  category?: string;
}

export default function WinterSlider() {
  const supabase = createClient();
  const [winterProducts, setWinterProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ambil produk dari Supabase yang kategorinya mengandung 'WINTER'
  useEffect(() => {
    const fetchWinter = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('product_type', 'winter');

      if (data && data.length > 0) {
        setWinterProducts(data);
      }
    };
    fetchWinter();
  }, []);

  // Fallback data bawaan jika produk winter di database masih kosong
  const fallbackSlides = [
    {
      id: '1',
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
      product: {
        name: "STYLISH GRAY JACKET",
        price: "Rp 1.500.000",
        oldPrice: "Rp 2.000.000",
        thumb: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80"
      }
    },
    {
      id: '2',
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
      product: {
        name: "HEAVYWEIGHT KNITWEAR",
        price: "Rp 1.200.000",
        oldPrice: "Rp 1.600.000",
        thumb: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=200&q=80"
      }
    }
  ];

  // Map produk Supabase menjadi format slide
  const slides = winterProducts.length > 0 
    ? winterProducts.map((p) => ({
        id: p.id,
        image: p.image_url || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
        product: {
          name: p.name,
          price: `Rp ${Number(p.discount_price || p.price).toLocaleString('id-ID')}`,
          oldPrice: p.discount_price ? `Rp ${Number(p.price).toLocaleString('id-ID')}` : '',
          thumb: p.image_url || p.hover_image_url
        }
      }))
    : fallbackSlides;

  // Autoplay ganti slide otomatis setiap 4 detik
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <div className="winter-slider-container" style={{ height: '550px', position: 'relative', overflow: 'hidden' }}>
      
      {/* 1. Indikator Progress Bar di Atas */}
      <div style={{ position: 'absolute', top: '20px', left: '24px', right: '24px', display: 'flex', gap: '8px', zIndex: 10 }}>
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            className={`winter-bar ${idx === currentIndex ? 'active' : idx < currentIndex ? 'filled' : ''}`}
            style={{ flex: 1, height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px', overflow: 'hidden' }}
          >
            <div className="winter-bar-fill" />
          </div>
        ))}
      </div>

      {/* 2. Tombol Navigasi Panah Kiri & Kanan */}
      <button 
        type="button"
        onClick={handlePrev}
        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '20px', width: '36px', height: '36px', backgroundColor: 'rgba(255, 255, 255, 0.85)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20, fontWeight: 'bold' }}
      >
        ‹
      </button>
      <button 
        type="button"
        onClick={handleNext}
        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '20px', width: '36px', height: '36px', backgroundColor: 'rgba(255, 255, 255, 0.85)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20, fontWeight: 'bold' }}
      >
        ›
      </button>

      {/* 3. Gambar Banner — klik ke produk jika ada id */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {activeSlide.id && activeSlide.id.length > 5 ? (
          <Link href={`/products/${activeSlide.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
            <img
              src={activeSlide.image}
              alt="Winter Wear Collection"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.4s ease-in-out', cursor: 'pointer' }}
            />
          </Link>
        ) : (
          <img
            src={activeSlide.image}
            alt="Winter Wear Collection"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.4s ease-in-out' }}
          />
        )}
      </div>

      {/* 4. Card Produk Melayang — klik ke detail produk */}
      {activeSlide.product && (
        <div style={{ position: 'absolute', bottom: '24px', right: '24px', left: '24px', background: '#ffffff', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 10, animation: 'fadeInUp 0.3s ease-out', display: 'flex', alignItems: 'center' }}>
          {/* Area klik ke produk */}
          {activeSlide.id && activeSlide.id.length > 5 ? (
            <Link
              href={`/products/${activeSlide.id}`}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', textDecoration: 'none', color: '#121212' }}
            >
              <img
                src={activeSlide.product.thumb}
                alt={activeSlide.product.name}
                style={{ width: '56px', height: '56px', objectFit: 'cover', backgroundColor: '#eee', flexShrink: 0 }}
              />
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {activeSlide.product.name}
                </h4>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                  <span style={{ fontWeight: 'bold', color: '#121212' }}>{activeSlide.product.price}</span>
                  {activeSlide.product.oldPrice && (
                    <span style={{ color: '#888', textDecoration: 'line-through' }}>{activeSlide.product.oldPrice}</span>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
              <img
                src={activeSlide.product.thumb}
                alt={activeSlide.product.name}
                style={{ width: '56px', height: '56px', objectFit: 'cover', backgroundColor: '#eee', flexShrink: 0 }}
              />
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                  {activeSlide.product.name}
                </h4>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                  <span style={{ fontWeight: 'bold', color: '#121212' }}>{activeSlide.product.price}</span>
                  {activeSlide.product.oldPrice && (
                    <span style={{ color: '#888', textDecoration: 'line-through' }}>{activeSlide.product.oldPrice}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tombol next slide */}
          <button
            type="button"
            onClick={handleNext}
            style={{ width: '52px', height: '88px', backgroundColor: '#f5f5f5', border: 'none', borderLeft: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0, fontSize: '18px' }}
          >
            ›
          </button>
        </div>
      )}

    </div>
  );
}