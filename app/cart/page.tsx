'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  maxStock?: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [stockMessages, setStockMessages] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(stored);
    } catch {
      setCartItems([]);
    }
  }, []);

  const updateQuantity = (index: number, newQty: number) => {
    const item = cartItems[index];
    const maxStock = item.maxStock ?? 5;

    if (newQty < 1) return;

    if (newQty > maxStock) {
      setStockMessages((prev) => ({ ...prev, [index]: true }));
      return;
    }

    setStockMessages((prev) => ({ ...prev, [index]: false }));
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = cartItems.length > 0 ? 25000 : 0;
  const grandTotal = subtotal + shippingFee;

  return (
    <main className="cart-main">
      <style>{`
        .cart-main {
          min-height: 100vh;
          background-color: #ffffff;
          color: #121212;
          font-family: 'JetBrains Mono', monospace;
          padding-bottom: 80px;
        }

        /* HEADER */
        .cart-header {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 40px 20px 40px;
          border-bottom: 1px solid #121212;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
        }
        .cart-header h1 {
          font-size: 36px;
          font-weight: 900;
          font-family: Impact, sans-serif;
          text-transform: uppercase;
          margin: 0;
        }
        .cart-back-link {
          font-size: 12px;
          font-weight: bold;
          text-decoration: none;
          color: #121212;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        /* CONTENT WRAPPER */
        .cart-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px;
        }

        /* EMPTY STATE */
        .cart-empty {
          text-align: center;
          padding: 80px 0;
        }
        .cart-empty p {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 20px;
          text-transform: uppercase;
          color: #666;
        }
        .cart-empty a {
          background-color: #0000FF;
          color: #fff;
          padding: 12px 24px;
          text-decoration: none;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        /* GRID LAYOUT */
        .cart-grid {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 60px;
          align-items: start;
        }

        /* ITEM LIST */
        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .cart-item {
          display: flex;
          gap: 20px;
          padding-bottom: 24px;
          border-bottom: 1px solid #eee;
          align-items: center;
        }
        .cart-item img {
          width: 90px;
          height: 110px;
          object-fit: cover;
          background-color: #f0f0f0;
          flex-shrink: 0;
        }
        .cart-item-info {
          flex: 1;
          min-width: 0;
        }
        .cart-item-info h3 {
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0 0 6px 0;
          word-break: break-word;
        }
        .cart-item-size {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        .cart-item-stock-error {
          font-size: 11px;
          color: red;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .cart-item-price {
          font-size: 13px;
          font-weight: bold;
          color: #0000FF;
        }

        /* QTY CONTROL */
        .cart-qty {
          display: flex;
          align-items: center;
          border: 1px solid #ccc;
          flex-shrink: 0;
        }
        .cart-qty button {
          padding: 6px 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
        }
        .cart-qty span {
          padding: 0 10px;
          font-size: 12px;
          font-weight: bold;
        }

        /* REMOVE BUTTON */
        .cart-remove {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 18px;
          padding: 8px;
          flex-shrink: 0;
        }

        /* ORDER SUMMARY */
        .cart-summary {
          background-color: #f9f9f9;
          padding: 30px;
          border: 1px solid #e5e5e5;
        }
        .cart-summary h2 {
          font-size: 18px;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 20px;
          font-family: Impact, sans-serif;
        }
        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 12px;
          color: #555;
        }
        .cart-summary-row span:last-child {
          font-weight: bold;
          color: #121212;
        }
        .cart-summary-shipping {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 20px;
          color: #555;
          border-bottom: 1px solid #ddd;
          padding-bottom: 16px;
        }
        .cart-summary-shipping span:last-child {
          font-weight: bold;
          color: #121212;
        }
        .cart-summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 24px;
        }
        .cart-summary-total span:last-child {
          color: #0000FF;
        }
        .cart-checkout-btn {
          width: 100%;
          background-color: #0000FF;
          color: #ffffff;
          border: none;
          padding: 16px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          letter-spacing: 0.1em;
          font-family: 'JetBrains Mono', monospace;
        }

        /* TABLET — 768px to 1024px */
        @media (max-width: 1024px) {
          .cart-header {
            padding: 30px 24px 16px 24px;
          }
          .cart-header h1 {
            font-size: 26px;
          }
          .cart-content {
            padding: 30px 24px;
          }
          .cart-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }

        /* MOBILE — max 768px */
        @media (max-width: 768px) {
          .cart-header {
            padding: 20px 16px 14px 16px;
            flex-wrap: wrap;
            align-items: flex-start;
          }
          .cart-header h1 {
            font-size: 22px;
          }
          .cart-content {
            padding: 20px 16px;
          }

          /* Stack: items dulu, summary di bawah */
          .cart-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          /* Swap order — summary di bawah items */
          .cart-summary {
            order: 2;
          }
          .cart-items {
            order: 1;
          }

          .cart-item {
            gap: 12px;
            align-items: flex-start;
            padding-bottom: 20px;
          }
          .cart-item img {
            width: 75px;
            height: 90px;
          }

          /* Row bawah item: qty + hapus */
          .cart-item-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 10px;
          }

          .cart-remove {
            padding: 4px 8px;
          }
        }

        /* VERY SMALL — max 400px */
        @media (max-width: 400px) {
          .cart-header h1 {
            font-size: 18px;
          }
          .cart-item img {
            width: 65px;
            height: 80px;
          }
          .cart-summary {
            padding: 20px 16px;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="cart-header">
        <h1>SHOPPING CART ({cartItems.length})</h1>
        <Link href="/" className="cart-back-link">
          ← LANJUT BELANJA
        </Link>
      </div>

      {/* CONTENT */}
      <div className="cart-content">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p>Keranjang belanja kamu masih kosong.</p>
            <Link href="/">Mulai Belanja ↗</Link>
          </div>
        ) : (
          <div className="cart-grid">

            {/* DAFTAR ITEM */}
            <div className="cart-items">
              {cartItems.map((item, idx) => {
                const maxStock = item.maxStock ?? 5;
                const showError = stockMessages[idx];

                return (
                  <div key={`${item.id}-${item.size}-${idx}`} className="cart-item">
                    <img src={item.image} alt={item.name} />

                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <div className="cart-item-size">
                        UKURAN: <strong style={{ color: '#121212' }}>{item.size}</strong> (Sisa Stok: {maxStock})
                      </div>

                      {showError && (
                        <div className="cart-item-stock-error">MAAF STOCK HABIS</div>
                      )}

                      <div className="cart-item-price">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </div>

                      {/* Di mobile, qty + hapus masuk sini */}
                      <div className="cart-item-actions">
                        <div className="cart-qty">
                          <button type="button" onClick={() => updateQuantity(idx, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(idx, item.quantity + 1)}>+</button>
                        </div>
                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() => removeItem(idx)}
                          title="Hapus"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RINGKASAN BELANJA */}
            <div className="cart-summary">
              <h2>ORDER SUMMARY</h2>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>

              <div className="cart-summary-shipping">
                <span>Estimasi Pengiriman</span>
                <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
              </div>

              <div className="cart-summary-total">
                <span>TOTAL</span>
                <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>

              <button
                type="button"
                className="cart-checkout-btn"
                onClick={() => router.push('/checkout')}
              >
                PROCEED TO CHECKOUT ↗
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
