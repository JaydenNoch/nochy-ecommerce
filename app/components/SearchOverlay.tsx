'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  gender?: string;
  category?: string;
}

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Buka overlay
  const open = () => {
    setIsOpen(true);
    setQuery('');
    setResults([]);
  };

  // Tutup overlay
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }, []);

  // Fokus input saat overlay terbuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Tutup saat tekan Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [close]);

  // Search ke Supabase dengan debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_url, gender, category')
        .ilike('name', `%${query}%`)
        .limit(6);

      setResults(data || []);
      setLoading(false);
    }, 300); // debounce 300ms

    return () => clearTimeout(timer);
  }, [query]);

  // Submit: navigasi ke /shop dengan query
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    close();
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      {/* Tombol search icon */}
      <button
        type="button"
        onClick={open}
        aria-label="Open search"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '2px',
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2.5" strokeLinecap="square">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* OVERLAY — hanya muncul saat isOpen */}
      {isOpen && (
        <>
          {/* Backdrop gelap */}
          <div
            onClick={close}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 10000,
              animation: 'fadeInOverlay 0.2s ease',
            }}
          />

          {/* Search panel */}
          <div className="search-panel" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            zIndex: 10001,
            padding: '20px 40px 24px 40px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            animation: 'slideDownSearch 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          }}>

            {/* Input row */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '2px solid #121212', paddingBottom: '12px' }}>
                {/* Icon search */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="square" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                {/* Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    fontFamily: 'inherit',
                    color: '#121212',
                    backgroundColor: 'transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}
                />

                {/* Clear button — SVG X */}
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                    aria-label="Clear search"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#aaa', transition: 'color 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#121212')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                      <line x1="1" y1="1" x2="13" y2="13" />
                      <line x1="13" y1="1" x2="1" y2="13" />
                    </svg>
                  </button>
                )}

                {/* Close overlay — SVG X lebih besar */}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close search"
                  style={{ background: 'none', border: '1px solid #e5e5e5', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', color: '#888', transition: 'all 0.15s ease', marginLeft: '4px' }}
                  onMouseEnter={e => { (e.currentTarget.style.color = '#121212'); (e.currentTarget.style.borderColor = '#121212'); }}
                  onMouseLeave={e => { (e.currentTarget.style.color = '#888'); (e.currentTarget.style.borderColor = '#e5e5e5'); }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <line x1="2" y1="2" x2="14" y2="14" />
                    <line x1="14" y1="2" x2="2" y2="14" />
                  </svg>
                </button>

              </div>
            </form>

            {/* Loading */}
            {loading && (
              <div style={{ padding: '20px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Searching...
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <div style={{ paddingTop: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                  {results.length} results for &ldquo;{query}&rdquo;
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={close}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '10px 12px',
                        textDecoration: 'none',
                        color: '#121212',
                        borderRadius: '2px',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Thumbnail */}
                      <div style={{ width: '48px', height: '56px', backgroundColor: '#e5e5e5', overflow: 'hidden', flexShrink: 0 }}>
                        <img
                          src={product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=60'}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          {product.gender && <span style={{ textTransform: 'capitalize' }}>{product.gender}</span>}
                          {product.gender && product.category && <span style={{ margin: '0 6px', color: '#ccc' }}>·</span>}
                          {product.category && <span style={{ textTransform: 'capitalize' }}>{product.category}</span>}
                        </div>
                      </div>

                      {/* Harga */}
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0000FF', flexShrink: 0 }}>
                        Rp {Number(product.price).toLocaleString('id-ID')}
                      </div>

                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M2 6H10M7 3L10 6L7 9" stroke="#ccc" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!loading && query.length >= 2 && results.length === 0 && (
              <div style={{ padding: '24px 0', fontSize: '13px', color: '#888' }}>
                No products found for &ldquo;<strong>{query}</strong>&rdquo;
              </div>
            )}

            {/* Hint saat belum ngetik */}
            {!query && (
              <div style={{ paddingTop: '16px', fontSize: '11px', color: '#aaa' }}>
                Type at least 2 characters to search
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
