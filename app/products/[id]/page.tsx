import { createClient } from '@/app/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductDetailClient from './ProductDetailClient'
import AnimateOnScroll from '@/app/components/AnimateOnScroll'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Ambil data produk beserta stock_sizes dari tabel products
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (productError || !product) {
    notFound()
  }

  // 2. Ambil data ulasan (reviews) untuk produk ini dari database untuk menghitung akumulasi rating
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', id)

  const totalReviews = reviewsData ? reviewsData.length : 0
  const averageRating = totalReviews > 0 && reviewsData
    ? Number((reviewsData.reduce((acc: number, curr) => acc + (curr.rating || 0), 0) / totalReviews).toFixed(1))
    : 0

  // 3. Ubah format stock_sizes JSON dari database ke array agar dibaca oleh ProductDetailClient
  let stocks: any[] = []
  if (product.stock_sizes && typeof product.stock_sizes === 'object') {
    stocks = Object.entries(product.stock_sizes).map(([size, stock]) => ({
      size,
      stock: Number(stock) || 0,
    }))
  } else {
    // Fallback default jika kosong
    stocks = [
      { size: 'M', stock: 10 },
      { size: 'L', stock: 10 },
      { size: 'XL', stock: 5 },
    ]
  }

  // 4. Ambil produk lainnya untuk bagian "MORE PRODUCTS"
  const { data: otherProducts } = await supabase
    .from('products')
    .select('*')
    .neq('id', id)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#121212', fontFamily: "'Courier New', Courier, monospace" }}>

      <ProductDetailClient
        product={product}
        stocks={stocks}
        otherProducts={otherProducts || []}
        averageRating={averageRating}
        totalReviews={totalReviews}
      />

      {/* FOOTER */}
      <AnimateOnScroll animation="bottom" className="footer-main" style={{ backgroundColor: '#f5f5f5', padding: '60px 40px 30px 40px', fontSize: '12px' }}>
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