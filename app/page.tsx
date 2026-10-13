import { createClient } from './utils/supabase/server'
import Link from 'next/link'
import WinterSlider from './components/WinterSlider';
import AnimateOnScroll from './components/AnimateOnScroll';
import CategoriesSection from './components/CategoriesSection';
import HeroParallax from './components/HeroParallax';
import GenderCards from './components/GenderCards';

export default async function Home() {
  const supabase = await createClient()

  // 1. Ambil data produk khusus New Arrival berdasarkan product_type
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('product_type', 'new_arrival')

  if (error) {
    console.error('Gagal mengambil produk:', error.message)
  }

  // 2. Ambil data produk Best Seller berdasarkan product_type (MANUAL ADMIN)
  const { data: manualBestSellers } = await supabase
    .from('products')
    .select('*')
    .eq('product_type', 'bestseller')

  // AMBIL OTOMATIS BERDASARKAN PENJUALAN TERBANYAK
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, quantity')

  const salesCountMap: Record<string, number> = {}
  ;(orderItems || []).forEach((item) => {
    if (item.product_id) {
      salesCountMap[item.product_id] = (salesCountMap[item.product_id] || 0) + (item.quantity || 1)
    }
  })

  const topAutoProductIds = Object.keys(salesCountMap)
    .sort((a, b) => salesCountMap[b] - salesCountMap[a])
    .slice(0, 8)

  let autoProducts: any[] = []
  if (topAutoProductIds.length > 0) {
    const { data: fetchedAuto } = await supabase
      .from('products')
      .select('*')
      .in('id', topAutoProductIds)

    autoProducts = (fetchedAuto || []).sort(
      (a, b) => (salesCountMap[b.id] || 0) - (salesCountMap[a.id] || 0)
    )
  }

  // GABUNGKAN MANUAL ADMIN + OTOMATIS TERLARIS (TANPA DUPLIKAT)
  const combinedMap = new Map()
  ;(manualBestSellers || []).forEach((prod) => combinedMap.set(prod.id, prod))
  autoProducts.forEach((prod) => {
    if (!combinedMap.has(prod.id)) {
      combinedMap.set(prod.id, prod)
    }
  })

  const bestSellers = Array.from(combinedMap.values())

  // 3. Ambil data settings (judul & deskripsi winter wear + hero) dari Supabase
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  const winterTitle = settings?.winter_title || 'WINTER WEAR'
  const winterDesc = settings?.winter_desc || "Explore the newest additions to our Men's Collection to discover clothing, shoes, bags and accessories featuring signature styles and detailing."

  const heroBadge    = settings?.hero_badge    || 'YEAR-END SALE'
  const heroTitle    = settings?.hero_title    || 'NOCHY SIGNATURES 55% OFF'
  const heroSubtitle = settings?.hero_subtitle || 'Redefine your look with 55% off for all NOCHY Signatures outfit'
  const heroImage    = settings?.hero_image    || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80'

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#121212', fontFamily: "'Courier New', Courier, monospace" }}>

      {/* 1. HERO SECTION — parallax via JS */}
      <HeroParallax
        badge={heroBadge}
        title={heroTitle}
        subtitle={heroSubtitle}
        image={heroImage}
      />

      {/* 2. NEW ARRIVAL SECTION */}
      <AnimateOnScroll id="new-arrival" animation="left" className="section-products" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 40px' }}>
        <div className="section-header-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', borderBottom: '1px solid #121212', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', margin: 0, fontFamily: 'Impact, sans-serif' }}>
            NEW ARRIVAL
          </h2>
        </div>
        <div className="grid-products" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {products && products.length > 0 ? (
            products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none', color: '#121212', display: 'block' }}>
                <div className="product-img-wrapper">
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'} alt={product.name} className="product-img-primary" />
                  <img src={product.hover_image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'} alt={`${product.name} Hover`} className="product-img-secondary" />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#ffffff', padding: '4px 8px', fontSize: '12px', zIndex: 10 }}>↗</div>
                </div>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{product.name}</h3>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Rp {Number(product.price).toLocaleString('id-ID')}</span>
                </div>
              </Link>
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: 'span 3', padding: '40px', color: '#888' }}>Belum ada produk tersedia.</p>
          )}
        </div>
      </AnimateOnScroll>

      {/* 3. WINTER WEAR BANNER (DINAMIS DARI SUPABASE) */}
      <AnimateOnScroll animation="right" className="grid-winter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', backgroundColor: '#f8f8f8', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
        <div className="winter-text" style={{ padding: '80px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>NEW COLLECTION</span>
          <h2 style={{ fontSize: '52px', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1', margin: '0 0 20px 0', fontFamily: 'Impact, sans-serif' }}>
            {winterTitle}
          </h2>
          <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.6', maxWidth: '400px', marginBottom: '32px' }}>
            {winterDesc}
          </p>
        </div>
        <div className="winter-slider-wrapper">
          <WinterSlider />
        </div>
      </AnimateOnScroll>

      {/* 4. BEST SELLER SECTION */}
      <AnimateOnScroll animation="bottom" className="section-products" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 40px' }}>
        <div className="section-header-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', borderBottom: '1px solid #121212', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', margin: 0, fontFamily: 'Impact, sans-serif' }}>
            BEST SELLER
          </h2>
        </div>
        <div className="grid-products" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {bestSellers && bestSellers.length > 0 ? (
            bestSellers.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none', color: '#121212', display: 'block' }}>
                <div className="product-img-wrapper">
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'} alt={product.name} className="product-img-primary" />
                  <img src={product.hover_image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'} alt={`${product.name} Hover`} className="product-img-secondary" />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#ffffff', padding: '4px 8px', fontSize: '12px', zIndex: 10 }}>↗</div>
                </div>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{product.name}</h3>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Rp {Number(product.price).toLocaleString('id-ID')}</span>
                </div>
              </Link>
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: 'span 3', padding: '40px', color: '#888', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>
              Belum ada produk Best Seller saat ini.
            </p>
          )}
        </div>
      </AnimateOnScroll>

      {/* 5. TESTIMONIAL */}
      <AnimateOnScroll animation="left" className="testimonial-section" style={{ padding: '90px 20px 80px 20px', textAlign: 'center', backgroundColor: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
        <div style={{ color: '#0000FF', fontSize: '18px', marginBottom: '20px', letterSpacing: '6px' }}>★★★★★</div>
        <h3 className="testimonial-quote" style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', maxWidth: '750px', margin: '0 auto 16px auto', fontFamily: 'Impact, sans-serif', lineHeight: '1.15', color: '#121212' }}>
          &ldquo;BUY ONE GET ONE&rdquo;
        </h3>
        <p style={{ fontSize: '12px', color: '#555', margin: '0 0 36px 0' }}>Jayden Noch</p>
        <div className="testimonial-watermark" style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '125px', fontWeight: '900', color: '#e8e8e8', zIndex: 0, pointerEvents: 'none', fontFamily: 'Impact, sans-serif', whiteSpace: 'nowrap', userSelect: 'none' }}>
          WHAT OWNER SAY
        </div>
      </AnimateOnScroll>

      {/* 6. MAN / WOMAN CARDS — klik masuk ke shop filter */}
      <AnimateOnScroll animation="right">
        <GenderCards />
      </AnimateOnScroll>

      {/* 7. FEATURES BAR */}
      <AnimateOnScroll animation="top" className="section-features" style={{ borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5', padding: '40px 20px', backgroundColor: '#ffffff' }}>
        <div className="grid-features" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2" strokeLinecap="square">
                <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>CHEEP DELIVERY</div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2" strokeLinecap="square">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>100% SECURE PAYMENT</div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2" strokeLinecap="square">
                <polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>14 DAYS RETURN</div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2" strokeLinecap="square">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>24/7 SUPPORT</div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* 8. FOOTER */}
      <AnimateOnScroll animation="bottom" className="footer-main" id="footer" style={{ backgroundColor: '#f5f5f5', padding: '60px 40px 30px 40px', fontSize: '12px' }}>
        <div className="grid-footer" style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          
          {/* BRAND */}
          <div>
            <div style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'Impact, sans-serif', marginBottom: '8px' }}>NOCHY.</div>
            <div style={{ color: '#777', fontSize: '11px' }}>Fix Your Styles</div>
          </div>

          {/* SHOPS */}
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '16px', color: '#999', fontSize: '10px' }}>SHOPS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 'bold' }}>
              <Link href="/#new-arrival" style={{ textDecoration: 'none', color: '#121212' }}>NEW ARRIVAL</Link>
              <Link href="/shop?category=man" style={{ textDecoration: 'none', color: '#121212' }}>MENS</Link>
              <Link href="/shop?category=woman" style={{ textDecoration: 'none', color: '#121212' }}>WOMENS</Link>
            </div>
          </div>

          {/* ABOUT */}
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '16px', color: '#999', fontSize: '10px' }}>ABOUT</div>
            <div style={{ color: '#555', fontSize: '11px' }}>NOCHY Store - EST 2017</div>
          </div>

          {/* CONNECT (WITH LOGOS) */}
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '16px', color: '#999', fontSize: '10px' }}>CONNECT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontWeight: 'bold', fontSize: '11px' }}>
              
              {/* INSTAGRAM */}
              <a href="https://instagram.com/jayden.noch" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#121212', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>@jayden.noch</span>
              </a>

              {/* LINKEDIN */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#121212', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                <span>Zaidan Ahmad</span>
              </a>

              {/* WHATSAPP */}
              <a href="https://wa.me/6282137513615" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#121212', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>0821-3751-3615</span>
              </a>

            </div>
          </div>

        </div>
        
        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px', textAlign: 'center', color: '#999', fontSize: '11px' }}>
          © 2026 NOCHY. ALL RIGHTS RESERVED.
        </div>
      </AnimateOnScroll>

    </main>
  )
}