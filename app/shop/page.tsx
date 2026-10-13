import { createClient } from '@/app/utils/supabase/server'
import Link from 'next/link'
import AnimateOnScroll from '@/app/components/AnimateOnScroll'

interface ShopPageProps {
  searchParams: Promise<{ category?: string; sub?: string }>
}

const categoryLabels: Record<string, string> = {
  formal: 'Formal', casual: 'Casual', outerwear: 'Outerwear',
  traditional: 'Traditional', sport: 'Sport', denim: 'Denim',
  streetwear: 'Streetwear', accessories: 'Accessories',
}

const subCategories = ['formal','casual','outerwear','traditional','sport','denim','streetwear','accessories']

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, sub } = await searchParams

  // Default: man, semua kategori
  const gender = category === 'woman' ? 'woman' : 'man'
  const activeSub = sub && subCategories.includes(sub) ? sub : null

  const supabase = await createClient()

  // Build query berdasarkan filter
  let query = supabase.from('products').select('*').eq('gender', gender)
  if (activeSub) {
    query = query.eq('category', activeSub)
  }

  const { data: products, error } = await query.order('created_at', { ascending: false })

  if (error) console.error('Gagal fetch produk:', error.message)

  const genderLabel = gender === 'man' ? 'MAN' : 'WOMAN'
  const subLabel = activeSub ? categoryLabels[activeSub] : 'All'

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#121212', fontFamily: "'Courier New', Courier, monospace" }}>

      {/* HERO KECIL / BREADCRUMB HEADER */}
      <div style={{ borderBottom: '1px solid #e5e5e5', padding: '40px 40px 32px 40px', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>
            <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>HOME</Link>
            <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
            <span style={{ color: '#888' }}>CATEGORIES</span>
            <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
            <span style={{ color: '#121212', fontWeight: 'bold' }}>{genderLabel}</span>
            {activeSub && (
              <>
                <span style={{ margin: '0 8px', color: '#ccc' }}>/</span>
                <span style={{ color: '#0000FF', fontWeight: 'bold' }}>{subLabel.toUpperCase()}</span>
              </>
            )}
          </div>

          {/* Judul */}
          <h1 style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: '0 0 8px 0', lineHeight: '1' }}>
            {activeSub ? subLabel : 'All'} <span style={{ color: '#0000FF' }}>{genderLabel}</span>
          </h1>
          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
            {products?.length ?? 0} products found
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 40px 80px 40px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '48px', alignItems: 'start' }}>

        {/* ── SIDEBAR FILTER ── */}
        <aside className="shop-sidebar">
          {/* Gender toggle */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              GENDER
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(['man', 'woman'] as const).map((g) => (
                <Link
                  key={g}
                  href={`/shop?category=${g}${activeSub ? `&sub=${activeSub}` : ''}`}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    backgroundColor: gender === g ? '#121212' : 'transparent',
                    color: gender === g ? '#ffffff' : '#121212',
                    letterSpacing: '0.05em',
                  }}
                >
                  {g === 'man' ? 'Man' : 'Woman'}
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e5e5e5', marginBottom: '32px' }} />

          {/* Category filter */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              CATEGORY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* All */}
              <Link
                href={`/shop?category=${gender}`}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  backgroundColor: !activeSub ? '#121212' : 'transparent',
                  color: !activeSub ? '#ffffff' : '#121212',
                  letterSpacing: '0.05em',
                }}
              >
                All
              </Link>
              {subCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${gender}&sub=${cat}`}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    backgroundColor: activeSub === cat ? '#0000FF' : 'transparent',
                    color: activeSub === cat ? '#ffffff' : '#121212',
                    letterSpacing: '0.05em',
                  }}
                >
                  {categoryLabels[cat]}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* ── PRODUCT GRID ── */}
        <div>
          {products && products.length > 0 ? (
            <div className="shop-grid">
              {products.map((product) => (
                <AnimateOnScroll key={product.id} animation="bottom" threshold={0.05}>
                  <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: '#121212', display: 'block' }}>
                    <div className="product-img-wrapper">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                        alt={product.name}
                        className="product-img-primary"
                      />
                      <img
                        src={product.hover_image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'}
                        alt={`${product.name} hover`}
                        className="product-img-secondary"
                      />
                      <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#ffffff', padding: '4px 8px', fontSize: '12px', zIndex: 10 }}>↗</div>
                      {product.category && (
                        <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#0000FF', color: '#fff', padding: '3px 8px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', zIndex: 10 }}>
                          {product.category}
                        </div>
                      )}
                    </div>
                    <div style={{ paddingTop: '4px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{product.name}</h3>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Rp {Number(product.price).toLocaleString('id-ID')}</span>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>No products found</p>
              <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>Try a different category or gender</p>
              <Link href="/shop" style={{ display: 'inline-block', marginTop: '24px', backgroundColor: '#0000FF', color: '#fff', padding: '12px 28px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', textTransform: 'uppercase' }}>
                View All Products
              </Link>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
