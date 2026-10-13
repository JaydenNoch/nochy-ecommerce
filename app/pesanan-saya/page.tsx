'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  gross_amount: number;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface ReviewRecord {
  id: string;
  order_id: string;
  product_id: string;
  rating: number;
  comment: string;
  image_url?: string;
}

export default function MyOrdersPage() {
  const supabase = createClient();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, ReviewRecord>>({});
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  // State Modal Review
  const [activeReviewItem, setActiveReviewItem] = useState<{ orderId: string; productId: string; productTitle: string } | null>(null);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadUserOrdersAndReviews() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const email = session.user.email || '';
      setUserEmail(email);

      // Ambil daftar order_id yang disembunyikan oleh user dari localStorage
      const hiddenOrders = JSON.parse(localStorage.getItem('hidden_orders') || '[]');

      // 1. Ambil data pesanan user[cite: 17, 22]
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Gagal memuat pesanan:', error.message);
      } else {
        // Saring pesanan yang sudah disembunyikan agar tidak tampil di layar
        const filteredOrders = (ordersData || []).filter((ord) => !hiddenOrders.includes(ord.order_id));

        const ordersWithItems = await Promise.all(
          filteredOrders.map(async (ord) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', ord.order_id);
            return { ...ord, order_items: items || [] };
          })
        );

        setOrders(ordersWithItems);

        // 2. Ambil semua ulasan yang pernah dibuat oleh user ini[cite: 17, 22]
        const { data: revsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_email', email);

        // Petakan ulasan ke dalam bentuk key: "orderId_productId" agar mudah dicek[cite: 17, 22]
        const map: Record<string, ReviewRecord> = {};
        (revsData || []).forEach((rev) => {
          map[`${rev.order_id}_${rev.product_id}`] = rev;
        });
        setReviewsMap(map);
      }
      setLoading(false);
    }

    loadUserOrdersAndReviews();
  }, [router, supabase]);

  // Fungsi untuk menyembunyikan riwayat pesanan dari layar (database tetap utuh, ulasan aman)
  const handleDeleteOrder = (orderId: string) => {
    if (!confirm('Sembunyikan riwayat pesanan ini dari halaman kamu? (Ulasan produk akan tetap aman)')) return;

    const hiddenOrders = JSON.parse(localStorage.getItem('hidden_orders') || '[]');
    const updatedHidden = [...hiddenOrders, orderId];
    localStorage.setItem('hidden_orders', JSON.stringify(updatedHidden));

    setOrders(orders.filter((ord) => ord.order_id !== orderId));
    alert('Riwayat pesanan berhasil disembunyikan dari halaman kamu!');
  };

  // Saat tombol ulasan diklik[cite: 17, 22]
  const handleOpenReview = (orderId: string, productId: string, productTitle: string) => {
    setActiveReviewItem({ orderId, productId, productTitle });
    
    const key = `${orderId}_${productId}`;
    const existing = reviewsMap[key];

    if (existing) {
      setExistingReviewId(existing.id);
      setRating(existing.rating);
      setComment(existing.comment || '');
      setImageUrl(existing.image_url || '');
    } else {
      setExistingReviewId(null);
      setRating(5);
      setComment('');
      setImageUrl('');
    }
  };

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewItem) return;
    setSubmitting(true);

    const key = `${activeReviewItem.orderId}_${activeReviewItem.productId}`;

    if (existingReviewId) {
      // UPDATE Ulasan[cite: 17, 22]
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating,
          comment,
          image_url: imageUrl || null,
        })
        .eq('id', existingReviewId);

      if (updateError) {
        alert('Gagal mengupdate ulasan: ' + updateError.message);
      } else {
        alert('Ulasan berhasil diperbarui!');
        setReviewsMap({
          ...reviewsMap,
          [key]: { id: existingReviewId, order_id: activeReviewItem.orderId, product_id: activeReviewItem.productId, rating, comment, image_url: imageUrl }
        });
        setActiveReviewItem(null);
      }
    } else {
      // INSERT Ulasan Baru[cite: 17, 22]
      const { data: insertedData, error: insertError } = await supabase.from('reviews').insert({
        order_id: activeReviewItem.orderId,
        product_id: activeReviewItem.productId,
        user_email: userEmail,
        rating,
        comment,
        image_url: imageUrl || null,
      }).select().single();

      if (insertError) {
        alert('Gagal mengirim ulasan: ' + insertError.message);
      } else {
        alert('Ulasan berhasil dikirim! Terima kasih.');
        if (insertedData) {
          setReviewsMap({
            ...reviewsMap,
            [key]: insertedData
          });
        }
        setActiveReviewItem(null);
      }
    }

    setSubmitting(false);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'dikemas':
        return { bg: '#FEF3C7', color: '#D97706', border: '#F59E0B' };
      case 'dikirim':
        return { bg: '#DBEAFE', color: '#1D4ED8', border: '#3B82F6' };
      case 'selesai':
        return { bg: '#D1FAE5', color: '#047857', border: '#10B981' };
      case 'dibatalkan':
        return { bg: '#FEE2E2', color: '#B91C1C', border: '#EF4444' };
      default:
        return { bg: '#F3F4F6', color: '#374151', border: '#9CA3AF' };
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--linen, #fff1e6)', color: '#121212', fontFamily: "'JetBrains Mono', monospace", paddingBottom: '80px' }}>
      
      {/* HEADER */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 20px 40px', borderBottom: '2px solid #121212', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            STATUS & HISTORY ORDER
          </h1>
          <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>Akun Login: {userEmail}</p>
        </div>
        <Link href="/" style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', color: '#0000FF', border: '1px solid #0000FF', padding: '8px 16px', background: '#fff' }}>
          ← KEMBALI KE BERANDA
        </Link>
      </div>

      {/* CONTENT CONTAINER */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
        {loading ? (
          <p style={{ fontSize: '13px', fontWeight: 'bold' }}>MEMUAT DATA PESANAN...</p>
        ) : orders.length === 0 ? (
          <div style={{ border: '2px solid #121212', padding: '50px', textAlign: 'center', backgroundColor: '#ffffff', boxShadow: '4px 4px 0px #121212' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase' }}>Belum ada riwayat pesanan yang tercatat.</p>
            <Link href="/" style={{ display: 'inline-block', backgroundColor: '#0000FF', color: '#fff', padding: '12px 24px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', textTransform: 'uppercase' }}>
              Mulai Belanja Sekarang ↗
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map((order) => {
              const badge = getStatusBadgeStyle(order.status);
              const isCompleted = order.status.toLowerCase() === 'selesai';
              const orderDate = new Date(order.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={order.order_id} style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '24px', boxShadow: '4px 4px 0px #121212' }}>
                  
                  {/* ORDER HEADER INFO */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e5e5', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666' }}>ID TRANSAKSI:</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '2px 0 4px 0' }}>{order.order_id}</h3>
                      <span style={{ fontSize: '11px', color: '#777' }}>Dipesan pada: {orderDate}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* STATUS BADGE */}
                      <div style={{
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        padding: '6px 14px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Status: {order.status}
                      </div>

                      {/* TOMBOL SEMBUNYIKAN PESANAN */}
                      {(isCompleted || order.status.toLowerCase() === 'dibatalkan') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order.order_id)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          color: '#B91C1C',
                          border: '1px solid #EF4444',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          fontFamily: 'inherit'
                        }}
                        title="Sembunyikan Riwayat Pesanan"
                      >
                        🗑️ Hapus
                      </button>)}
                    </div>
                  </div>

                  {/* DETAIL PRODUK YANG DIBELI */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#444' }}>Item Pesanan:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.order_items?.map((item, idx) => {
                        const reviewKey = `${order.order_id}_${item.product_id}`;
                        const hasReviewed = !!reviewsMap[reviewKey];

                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', backgroundColor: '#fcfcfc', padding: '10px 14px', border: '1px solid #eee', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <span>{item.product_title} × <strong>{item.quantity}</strong></span>
                              <div style={{ fontWeight: 'bold', marginTop: '2px' }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</div>
                            </div>

                            {/* Tombol Dinamis Berdasarkan Status Review[cite: 17, 22] */}
                            {isCompleted && (
                              <button
                                type="button"
                                onClick={() => handleOpenReview(order.order_id, item.product_id, item.product_title)}
                                style={{
                                  backgroundColor: hasReviewed ? '#047857' : '#0000FF',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '6px 14px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  textTransform: 'uppercase',
                                  fontFamily: 'inherit'
                                }}
                              >
                                {hasReviewed ? '✏️ Edit Ulasan' : '⭐ Beri Ulasan'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ALAMAT & TOTAL */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', borderTop: '1px solid #e5e5e5', paddingTop: '16px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#444', marginBottom: '4px' }}>Alamat Pengiriman:</div>
                      <p style={{ fontSize: '11px', color: '#555', margin: 0, lineHeight: '1.4' }}>
                        <strong>{order.customer_name}</strong> ({order.phone})<br />
                        {order.address}, {order.city} — {order.postal_code}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', display: 'block' }}>Total Pembayaran</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: '#0000FF' }}>
                        Rp {Number(order.gross_amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL POPUP BERI/EDIT ULASAN */}
      {activeReviewItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '8px 8px 0px #121212' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #121212', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', fontFamily: "'Syne', sans-serif", margin: 0, textTransform: 'uppercase' }}>
                {existingReviewId ? 'Edit Ulasan Produk' : 'Beri Ulasan Produk'}
              </h2>
              <button onClick={() => setActiveReviewItem(null)} style={{ background: 'none', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
              Produk: {activeReviewItem.productTitle}
            </p>

            <form onSubmit={handleSendReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Rating Bintang (1 - 5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px', backgroundColor: '#fff', fontWeight: 'bold', fontFamily: 'inherit' }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang - Sempurna)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Bintang - Bagus)</option>
                  <option value={3}>⭐⭐⭐ (3 Bintang - Cukup)</option>
                  <option value={2}>⭐⭐ (2 Bintang - Kurang)</option>
                  <option value={1}>⭐ (1 Bintang - Buruk)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Komentar Ulasan</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalamanmu dengan bahan dan ukuran produk ini..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>URL Foto Bukti (Opsional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, backgroundColor: '#0000FF', color: '#fff', border: 'none', padding: '12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase', fontFamily: 'inherit' }}
                >
                  {submitting ? 'MENYIMPAN...' : (existingReviewId ? 'SIMPAN PERUBAHAN ↗' : 'KIRIM ULASAN ↗')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewItem(null)}
                  style={{ backgroundColor: '#e5e5e5', border: 'none', padding: '12px 16px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Batal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </main>
  );
}