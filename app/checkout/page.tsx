'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';

declare global {
  interface Window {
    snap: any;
  }
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

export default function CheckoutPage() {
  const supabase = createClient();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);

  const [userEmail, setUserEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]');
      if (stored.length === 0) {
        router.push('/cart');
        return;
      }
      setCartItems(stored);
    } catch {
      router.push('/cart');
      return;
    }

    async function loadUserProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setUserEmail(session.user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile && profile.address) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setAddress(profile.address || '');
        setCity(profile.city || '');
        setPostalCode(profile.postal_code || '');
        setHasSavedProfile(true);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
      setLoading(false);
    }

    loadUserProfile();
  }, [router, supabase]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 25000;
  const grandTotal = subtotal + shippingFee;

  const handleSaveAndCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      email: session.user.email,
      full_name: fullName,
      phone,
      address,
      city,
      postal_code: postalCode,
    });

    if (error) {
      alert('Gagal menyimpan alamat: ' + error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setHasSavedProfile(true);
    setIsEditing(false);
  };

  const handlePayment = async () => {
    setPaying(true);

    try {
      const orderId = `NOCHY-${Date.now()}`;

      const itemDetails = [
        ...cartItems.map((item) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: `${item.name} (${item.size})`.slice(0, 50),
          size: item.size,
        })),
        {
          id: 'SHIPPING-FEE',
          price: shippingFee,
          quantity: 1,
          name: 'Pengiriman Kurir',
          size: '-',
        },
      ];

      const res = await fetch('/api/tokenizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          grossAmount: grandTotal,
          customerDetails: { fullName, email: userEmail, phone, address, city, postalCode },
          itemDetails,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        alert('Gagal memproses transaksi: ' + (data.error || 'Token tidak ada'));
        setPaying(false);
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: async function () {
          const { error: orderError } = await supabase.from('orders').insert({
            order_id: orderId,
            customer_name: fullName,
            email: userEmail,
            phone,
            address,
            city,
            postal_code: postalCode,
            gross_amount: grandTotal,
            status: 'dikemas',
          });

          if (orderError) console.error('Gagal menyimpan order:', orderError.message);

          for (const item of cartItems) {
            await supabase.from('order_items').insert({
              order_id: orderId,
              product_id: item.id,
              product_title: `${item.name} (${item.size})`,
              quantity: item.quantity,
              price: item.price,
            });

            const { data: prodData } = await supabase
              .from('products')
              .select('stock_sizes, sales_count')
              .eq('id', item.id)
              .single();

            if (prodData) {
              const currentSales = prodData.sales_count ?? 0;
              const stockSizes = prodData.stock_sizes || {};
              const currentSizeStock = stockSizes[item.size] ?? 10;
              stockSizes[item.size] = Math.max(0, currentSizeStock - item.quantity);

              await supabase
                .from('products')
                .update({ sales_count: currentSales + item.quantity, stock_sizes: stockSizes })
                .eq('id', item.id);
            }
          }

          alert('Pembayaran Berhasil! Pesanan sedang dikemas.');
          localStorage.removeItem('cart');
          window.dispatchEvent(new Event('cartUpdated'));
          router.push('/');
        },
        onPending: function () {
          alert('Menunggu Pembayaran...');
          setPaying(false);
        },
        onError: function () {
          alert('Pembayaran Gagal!');
          setPaying(false);
        },
        onClose: function () {
          setPaying(false);
        },
      });
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses pembayaran.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="co-loading">
        MEMUAT HALAMAN CHECKOUT...
      </div>
    );
  }

  const isPayDisabled = !hasSavedProfile || isEditing || paying;

  return (
    <main className="co-main">
      <style>{`
        /* ── BASE ── */
        .co-loading {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
        }
        .co-main {
          min-height: 100vh;
          background-color: #ffffff;
          color: #121212;
          font-family: 'Courier New', Courier, monospace;
          padding-bottom: 80px;
        }

        /* ── HEADER ── */
        .co-header {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 40px 20px 40px;
          border-bottom: 1px solid #121212;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }
        .co-header h1 {
          font-size: 36px;
          font-weight: 900;
          font-family: Impact, sans-serif;
          text-transform: uppercase;
          margin: 0;
        }
        .co-back-link {
          font-size: 12px;
          font-weight: bold;
          text-decoration: none;
          color: #121212;
          white-space: nowrap;
        }

        /* ── CONTENT ── */
        .co-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px;
        }

        /* ── GRID ── */
        .co-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 60px;
          align-items: start;
        }

        /* ── SECTION TITLE ── */
        .co-section-title {
          font-size: 18px;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 20px;
          font-family: Impact, sans-serif;
        }

        /* ── SAVED ADDRESS CARD ── */
        .co-address-card {
          border: 2px solid #121212;
          padding: 24px;
          background-color: #f9f9f9;
          margin-bottom: 30px;
        }
        .co-address-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 12px;
        }
        .co-address-badge {
          font-size: 11px;
          font-weight: bold;
          background-color: #121212;
          color: #fff;
          padding: 4px 8px;
          text-transform: uppercase;
        }
        .co-edit-btn {
          background: none;
          border: none;
          color: #0000FF;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          text-decoration: underline;
          white-space: nowrap;
          font-family: inherit;
        }
        .co-address-name {
          font-size: 13px;
          font-weight: bold;
          margin: 0 0 6px 0;
          text-transform: uppercase;
        }
        .co-address-detail {
          font-size: 12px;
          color: #555;
          margin: 0 0 4px 0;
        }

        /* ── FORM ── */
        .co-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid #e5e5e5;
          padding: 30px;
          background-color: #fcfcfc;
        }
        .co-form label {
          display: block;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .co-form input,
        .co-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #121212;
          font-size: 12px;
          background-color: #fff;
          font-family: inherit;
          box-sizing: border-box;
        }
        .co-form textarea {
          resize: vertical;
        }
        .co-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .co-save-btn {
          margin-top: 10px;
          background-color: #121212;
          color: #fff;
          border: none;
          padding: 14px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          font-family: inherit;
        }
        .co-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── ORDER SUMMARY ── */
        .co-summary {
          background-color: #f9f9f9;
          padding: 30px;
          border: 1px solid #e5e5e5;
        }
        .co-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
          max-height: 250px;
          overflow-y: auto;
        }
        .co-item-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          gap: 8px;
        }
        .co-item-row-name {
          font-weight: bold;
          text-transform: uppercase;
        }
        .co-item-row-sub {
          color: #666;
          font-size: 11px;
        }
        .co-item-row-price {
          font-weight: bold;
          white-space: nowrap;
        }
        .co-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 12px;
          color: #555;
        }
        .co-summary-row span:last-child {
          font-weight: bold;
          color: #121212;
        }
        .co-summary-shipping {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 20px;
          color: #555;
          border-bottom: 1px solid #ddd;
          padding-bottom: 16px;
        }
        .co-summary-shipping span:last-child {
          font-weight: bold;
          color: #121212;
        }
        .co-summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 24px;
        }
        .co-summary-total span:last-child {
          color: #0000FF;
        }
        .co-pay-btn {
          width: 100%;
          border: none;
          padding: 16px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: inherit;
        }
        .co-pay-btn:not(:disabled) {
          background-color: #0000FF;
          color: #fff;
          cursor: pointer;
        }
        .co-pay-btn:disabled {
          background-color: #ccc;
          color: #fff;
          cursor: not-allowed;
        }
        .co-pay-hint {
          font-size: 10px;
          color: #d9534f;
          text-align: center;
          margin-top: 8px;
        }

        /* ── TABLET ≤1024px ── */
        @media (max-width: 1024px) {
          .co-header {
            padding: 30px 24px 16px 24px;
          }
          .co-header h1 {
            font-size: 28px;
          }
          .co-content {
            padding: 30px 24px;
          }
          .co-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }

        /* ── MOBILE ≤768px ── */
        @media (max-width: 768px) {
          .co-header {
            padding: 20px 16px 14px 16px;
          }
          .co-header h1 {
            font-size: 22px;
          }
          .co-content {
            padding: 20px 16px;
          }

          /* Stack: form dulu, summary di bawah */
          .co-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .co-form {
            padding: 20px 16px;
          }

          /* Kota & kode pos tetap 2 kolom, tapi lebih compact */
          .co-form-row {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .co-summary {
            padding: 20px 16px;
          }

          .co-address-card {
            padding: 16px;
          }
        }

        /* ── VERY SMALL ≤400px ── */
        @media (max-width: 400px) {
          .co-header h1 {
            font-size: 18px;
          }

          /* Kota & kode pos stack vertikal */
          .co-form-row {
            grid-template-columns: 1fr;
          }

          .co-section-title {
            font-size: 15px;
          }
        }
      `}</style>

      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* HEADER */}
      <div className="co-header">
        <h1>CHECKOUT PENGIRIMAN</h1>
        <Link href="/cart" className="co-back-link">
          ← KEMBALI KE KERANJANG
        </Link>
      </div>

      {/* CONTENT */}
      <div className="co-content">
        <div className="co-grid">

          {/* KOLOM KIRI: ALAMAT */}
          <div>
            <h2 className="co-section-title">1. ALAMAT PENERIMA</h2>

            {hasSavedProfile && !isEditing ? (
              <div className="co-address-card">
                <div className="co-address-card-header">
                  <span className="co-address-badge">Alamat Utama Tersimpan</span>
                  <button type="button" className="co-edit-btn" onClick={() => setIsEditing(true)}>
                    Ubah Alamat ↗
                  </button>
                </div>
                <p className="co-address-name">{fullName}</p>
                <p className="co-address-detail">Telp: {phone}</p>
                <p className="co-address-detail">{address}</p>
                <p className="co-address-detail" style={{ margin: 0 }}>{city} — {postalCode}</p>
              </div>
            ) : (
              <form className="co-form" onSubmit={handleSaveAndCheckout}>
                <div>
                  <label>Nama Lengkap Penerima</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Zaidan Ahmad"
                  />
                </div>

                <div>
                  <label>Nomor Handphone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div>
                  <label>Alamat Lengkap (Jalan, No. Rumah, RT/RW)</label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Contoh: Jl. Malioboro No. 123"
                  />
                </div>

                <div className="co-form-row">
                  <div>
                    <label>Kota / Kabupaten</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Contoh: Yogyakarta"
                    />
                  </div>
                  <div>
                    <label>Kode Pos</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Contoh: 55222"
                    />
                  </div>
                </div>

                <button type="submit" className="co-save-btn" disabled={saving}>
                  {saving ? 'MENYIMPAN...' : 'SIMPAN ALAMAT INI'}
                </button>
              </form>
            )}
          </div>

          {/* KOLOM KANAN: RINGKASAN PESANAN */}
          <div className="co-summary">
            <h2 className="co-section-title">RINGKASAN PESANAN ({cartItems.length})</h2>

            <div className="co-items-list">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="co-item-row">
                  <div>
                    <div className="co-item-row-name">{item.name}</div>
                    <div className="co-item-row-sub">Ukuran: {item.size} × {item.quantity}</div>
                  </div>
                  <span className="co-item-row-price">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="co-summary-row">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>

            <div className="co-summary-shipping">
              <span>Pengiriman (Kurir)</span>
              <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
            </div>

            <div className="co-summary-total">
              <span>TOTAL</span>
              <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>

            <button
              type="button"
              className="co-pay-btn"
              disabled={isPayDisabled}
              onClick={handlePayment}
            >
              {paying ? 'MEMPROSES PEMBAYARAN...' : 'BAYAR SEKARANG ↗'}
            </button>

            {(!hasSavedProfile || isEditing) && (
              <p className="co-pay-hint">
                Harap simpan alamat terlebih dahulu sebelum melanjutkan pembayaran.
              </p>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
