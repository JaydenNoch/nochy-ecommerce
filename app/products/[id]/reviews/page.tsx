'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';

interface Review {
  id: string;
  user_email: string;
  rating: number;
  comment: string;
  image_url?: string;
  created_at: string;
}

export default function ProductReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = use(params);
  const supabase = createClient();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Ambil nama produk
      const { data: prod } = await supabase.from('products').select('name').eq('id', productId).single();
      if (prod) setProductName(prod.name);

      // Ambil semua ulasan untuk produk ini
      const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
      setReviews(revs || []);
      setLoading(false);
    }

    if (productId) fetchData();
  }, [productId, supabase]);

  // Filter Ulasan Berdasarkan Rating Bintang
  const filteredReviews = reviews.filter((r) => filterRating === 'ALL' || r.rating === filterRating);

  // Hitung Rata-Rata Rating
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#121212', fontFamily: "'Courier New', Courier, monospace", paddingBottom: '80px' }}>
      
      {/* BREADCRUMB HEADER */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '30px 40px 0 40px' }}>
        <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>HOME</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <Link href={`/products/${productId}`} style={{ color: '#888', textDecoration: 'none' }}>PRODUCT</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
          <span style={{ color: '#121212', fontWeight: 'bold' }}>REVIEWS</span>
        </div>

        {/* TITLE */}
        <h1 style={{ fontSize: '42px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 8px 0', lineHeight: '1.1' }}>
          REVIEWS: <span style={{ color: '#0000FF' }}>{productName || 'PRODUCT'}</span>
        </h1>
        <p style={{ fontSize: '11px', color: '#777', margin: '0 0 30px 0' }}>
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} found for this item
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e5e5', marginBottom: '40px' }} />

      {/* MAIN CONTAINER DENGAN SIDEBAR */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '60px' }}>
        
        {/* KULGRIBA (SIDEBAR FILTER & STATS) */}
        <aside>
          {/* STATS OVERVIEW */}
          <div style={{ marginBottom: '32px', borderBottom: '1px solid #e5e5e5', paddingBottom: '24px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', letterSpacing: '0.08em', marginBottom: '8px' }}>RATING OVERVIEW</div>
            <div style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'Impact, sans-serif', color: '#0000FF', lineHeight: '1' }}>
              {avgRating} <span style={{ fontSize: '18px', color: '#121212', fontFamily: "'Courier New', Courier, monospace" }}>/ 5.0</span>
            </div>
            <div style={{ fontSize: '14px', color: '#0000FF', marginTop: '6px', letterSpacing: '2px' }}>
              {'★'.repeat(Math.round(Number(avgRating))) + '☆'.repeat(5 - Math.round(Number(avgRating)))}
            </div>
          </div>

          {/* RATING FILTER BUTTONS */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', letterSpacing: '0.08em', marginBottom: '16px' }}>FILTER RATING</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setFilterRating('ALL')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filterRating === 'ALL' ? '#0000FF' : 'transparent',
                  color: filterRating === 'ALL' ? '#ffffff' : '#121212',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                ALL REVIEWS ({reviews.length})
              </button>

              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const isSelected = filterRating === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilterRating(star)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#0000FF' : 'transparent',
                      color: isSelected ? '#ffffff' : '#121212',
                      transition: 'all 0.15s ease',
                      fontFamily: 'inherit',
                    }}
                  >
                    ★ {star} STARS ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* BACK TO PRODUCT LINK */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e5e5' }}>
            <Link
              href={`/products/${productId}`}
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#121212',
                textDecoration: 'none',
                display: 'inline-block',
                border: '1px solid #121212',
                padding: '10px 16px',
                width: '100%',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            >
              ← BACK TO ITEM
            </Link>
          </div>
        </aside>

        {/* NIMEKIRI (REVIEW LIST) */}
        <section>
          {loading ? (
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#777' }}>LOADING REVIEWS...</p>
          ) : filteredReviews.length === 0 ? (
            <div style={{ border: '1px solid #e5e5e5', padding: '60px 40px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', margin: 0 }}>
                No customer reviews match this rating filter yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {filteredReviews.map((rev) => (
                <div key={rev.id} style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '24px' }}>
                  
                  {/* USER & RATING HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'lowercase' }}>
                      {rev.user_email}
                    </div>
                    <div style={{ fontSize: '13px', color: '#0000FF', letterSpacing: '2px' }}>
                      {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                    </div>
                  </div>

                  {/* COMMENT */}
                  <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                    {rev.comment}
                  </p>

                  {/* ATTACHED IMAGE */}
                  {rev.image_url && (
                    <div style={{ marginBottom: '12px' }}>
                      <img
                        src={rev.image_url}
                        alt="Customer photo"
                        style={{ width: '140px', height: '140px', objectFit: 'cover', border: '1px solid #121212' }}
                      />
                    </div>
                  )}

                  {/* DATE */}
                  <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>
                    {new Date(rev.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>

    </main>
  );
}