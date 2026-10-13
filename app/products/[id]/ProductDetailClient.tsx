'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../utils/supabase/client'

interface StockItem {
  id?: string
  size: string
  variant_color?: string
  stock: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  discount_price?: number | null
  image_url: string
  hover_image_url?: string
  image_3?: string
  image_4?: string
}

// ── Komponen Zoom Image ──
function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 }) // persen
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x, y })
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: zoomed ? 'crosshair' : 'default',
        position: 'relative',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transformOrigin: `${pos.x}% ${pos.y}%`,
          transform: zoomed ? 'scale(2)' : 'scale(1)',
          transition: zoomed ? 'transform 0.1s ease-out' : 'transform 0.35s ease-out',
          willChange: 'transform',
        }}
      />
    </div>
  )
}

export default function ProductDetailClient({
  product,
  stocks = [],
  otherProducts = [],
  averageRating = 0,
  totalReviews = 0,
}: {
  product: Product
  stocks: StockItem[]
  otherProducts: Product[]
  averageRating?: number
  totalReviews?: number
}) {
  const supabase = createClient()

  // State untuk stock & modal login
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // Gambar utama
  const [mainImage, setMainImage] = useState<string>(
    product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  )

  // Otomatis pilih ukuran pertama yang tersedia ketika data stocks masuk
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      setSelectedStock(stocks[0])
    }
  }, [stocks])

  // Ambil thumbnail dari database
  const thumbnails = [
    product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    product.hover_image_url || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
    product.image_3 || product.image_url || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    product.image_4 || product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  ]

  const currentPrice = product.discount_price ? product.discount_price : product.price
  const originalPrice = product.discount_price ? product.price : null

  // ── Fungsi Tambah ke Keranjang dengan Validasi Login ──
  const handleAddToCart = async () => {
    try {
      const existingCart: any[] = JSON.parse(localStorage.getItem('cart') || '[]')
      const sizeName = selectedStock?.size || 'M'
      const currentMaxStock = Number(selectedStock?.stock ?? 1)

      const itemIndex = existingCart.findIndex(
        (item: any) => item.id === product.id && item.size === sizeName
      )

      if (itemIndex > -1) {
        // Cek kalau quantity di cart sudah mencapai maxStock, jangan ditambah lagi
        if (existingCart[itemIndex].quantity >= currentMaxStock) {
          alert('MAAF STOCK HABIS');
          return;
        }
        existingCart[itemIndex].quantity += 1;
        existingCart[itemIndex].maxStock = currentMaxStock;
      } else {
        if (currentMaxStock <= 0) {
          alert('MAAF STOCK HABIS');
          return;
        }
        existingCart.push({
          id: product.id,
          name: product.name,
          price: Number(currentPrice),
          image: mainImage || product.image_url,
          size: sizeName,
          quantity: 1,
          maxStock: currentMaxStock
        })
      }

      localStorage.setItem('cart', JSON.stringify(existingCart))
      window.dispatchEvent(new Event('cartUpdated'))
      
      // Langsung arahkan ke halaman cart agar user bisa langsung lihat hasilnya
      window.location.href = '/cart';
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#121212', fontFamily: "'Courier New', Courier, monospace", position: 'relative' }}>

      {/* ── CUSTOM MODAL POP-UP LOGIN ── */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid #121212',
            padding: '40px',
            width: '420px',
            maxWidth: '90%',
            boxShadow: '8px 8px 0px #121212',
            textAlign: 'center',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', marginBottom: '12px' }}>
              AUTORISASI DIPERLUKAN
            </h3>
            <p style={{ fontSize: '12px', color: '#555', marginBottom: '30px', lineHeight: '1.6' }}>
              Silakan login atau register terlebih dahulu untuk menambahkan produk ke keranjang belanja Anda.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  color: '#121212',
                  border: '1px solid #121212',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/login' }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#0000FF',
                  color: '#ffffff',
                  border: '1px solid #0000FF',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Login ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BREADCRUMB ── */}
      <div className="pd-breadcrumb">
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '11px' }}>HOME</Link>
        <span style={{ color: '#ccc', margin: '0 8px' }}>/</span>
        <span style={{ color: '#121212', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{product.name}</span>
      </div>

      {/* ── MAIN DETAIL SECTION ── */}
      <div className="pd-main">

        {/* KOLOM KIRI: thumbnails + gambar utama */}
        <div className="pd-gallery">
          <div className="pd-thumbs">
            {thumbnails.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMainImage(img)}
                className={`pd-thumb-btn ${mainImage === img ? 'active' : ''}`}
              >
                <img src={img} alt={`View ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          <div className="pd-main-img">
            <ZoomImage src={mainImage} alt={product.name} />
          </div>
        </div>

        {/* KOLOM KANAN: info produk */}
        <div className="pd-info">
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-price-row">
            <span className="pd-price">Rp {Number(currentPrice).toLocaleString('id-ID')}</span>
            {originalPrice ? (
              <span className="pd-price-old">Rp {Number(originalPrice).toLocaleString('id-ID')}</span>
            ) : (
              <span className="pd-price-old">Rp {(Number(product.price) * 1.2).toLocaleString('id-ID')}</span>
            )}
          </div>

          {/* RATING BINTANG YANG BISA DIKLIK MENUJU HALAMAN REVIEWS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                <Link
                    href={`/products/${product.id}/reviews`}
                    style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    }}
                >
                    {/* Tampilkan Bintang Sesuai Rata-rata Rating */}
                    <span style={{ color: '#f59e0b', fontSize: '14px', letterSpacing: '2px' }}>
                    {totalReviews > 0 ? '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating)) : '☆☆☆☆☆'}
                    </span>
                    
                    {/* Tampilkan Nilai Rata-rata dan Jumlah Ulasan */}
                    <span style={{ fontSize: '11px', color: '#0000FF', fontWeight: 'bold', textDecoration: 'underline' }}>
                    {totalReviews > 0 ? `(${averageRating} / ${totalReviews} ulasan)` : '(Belum ada ulasan)'}
                    </span>
                </Link>
            </div>

          <div style={{ borderTop: '1px solid #e5e5e5', marginBottom: '20px' }} />

          <p className="pd-desc">
            {product.description || "Effortlessly cool and endlessly versatile, NOCHY's signature apparel is your go-to layer for every season. Made with premium cotton, it's the perfect blend of comfort and classic style."}
          </p>

          {stocks && stocks.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.08em' }}>
                SELECT SIZE:
                {selectedStock && (
                  <span style={{ color: '#0000FF', marginLeft: '8px' }}>
                    {selectedStock.size} — {selectedStock.stock} LEFT
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {stocks.map((item) => {
                  const isSelected = selectedStock?.size === item.size
                  const stockNum = Number(item.stock) || 0
                  const outOfStock = stockNum === 0

                  return (
                    <button
                      key={item.id || item.size}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedStock(item)}
                      style={{
                        padding: '10px 20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        backgroundColor: isSelected ? '#121212' : '#ffffff',
                        color: isSelected ? '#ffffff' : outOfStock ? '#ccc' : '#121212',
                        border: `1px solid ${isSelected ? '#121212' : outOfStock ? '#e5e5e5' : '#121212'}`,
                        opacity: outOfStock ? 0.5 : 1,
                        transition: 'all 0.15s ease',
                        minWidth: '64px',
                      }}
                    >
                      {item.size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className="pd-order-btn"
          >
            ADD TO CART ↗
          </button>

          <div className="pd-perks">
            <div className="pd-perk">
              <span>🚚</span> Cheep delivery 
            </div>
            <div className="pd-perk">
              <span>↩</span> 14-day easy returns
            </div>
          </div>

        </div>
      </div>

      {/* ── MORE PRODUCTS ── */}
      <div className="pd-more">
        <h2 className="pd-more-title">MORE PRODUCTS</h2>
        <div className="pd-more-grid">
          {otherProducts && otherProducts.length > 0 ? (
            otherProducts.slice(0, 4).map((item: any) => {
              const itemPrice = item.discount_price ? item.discount_price : item.price
              const itemOldPrice = item.discount_price ? item.price : null

              return (
                <Link key={item.id} href={`/products/${item.id}`} style={{ textDecoration: 'none', color: '#121212', display: 'block' }}>
                  {/* Hover swap image — sama seperti New Arrival */}
                  <div className="product-img-wrapper" style={{ height: '360px' }}>
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'}
                      alt={item.name}
                      className="product-img-primary"
                    />
                    <img
                      src={item.hover_image_url || item.image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'}
                      alt={`${item.name} hover`}
                      className="product-img-secondary"
                    />
                    <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#ffffff', padding: '4px 8px', fontSize: '12px', zIndex: 10 }}>↗</div>
                  </div>
                  <div style={{ padding: '12px 0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0000FF' }}>Rp {Number(itemPrice).toLocaleString('id-ID')}</span>
                      {itemOldPrice && (
                        <span style={{ fontSize: '11px', color: '#999', textDecoration: 'line-through' }}>Rp {Number(itemOldPrice).toLocaleString('id-ID')}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <p style={{ fontSize: '12px', color: '#888' }}>Tidak ada produk lain.</p>
          )}
        </div>
      </div>

    </div>
  )
}