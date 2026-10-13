'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  gender?: string;
  category?: string;
  product_type?: string;
  sales_count: number;
  created_at: string;
  image_url?: string;
}

// Komponen Pie Chart Interaktif per Produk (Full Bersih & Aman TypeScript)
function ProductPieChart({ products, genderType }: { products: Product[]; genderType: 'MAN' | 'WOMAN' }) {
  const [hoveredSlice, setHoveredSlice] = useState<{ id: string; name: string; sales: number; percent: number } | null>(null);

  const genderProducts = products
    .filter((p) => (p.gender || '').toUpperCase() === genderType && (p.sales_count || 0) > 0)
    .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));

  const grandTotal = genderProducts.reduce((acc, curr) => acc + (curr.sales_count || 0), 0);

  if (grandTotal === 0 || genderProducts.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '11px', color: '#777', fontWeight: 'bold' }}>
        BELUM ADA DATA PENJUALAN UNTUK {genderType}
      </div>
    );
  }

  const colors = ['#0000FF', '#FF0055', '#00CC66', '#FFBB00', '#9900FF', '#00E5FF', '#FF6600', '#6600FF'];

  let cumulativeAngle = 0;
  const slices = genderProducts.map((item, idx) => {
    const sales = item.sales_count || 0;
    const angle = (sales / grandTotal) * 360;
    const percent = Math.round((sales / grandTotal) * 100);

    const x1 = 100 + 80 * Math.cos((Math.PI * (cumulativeAngle - 90)) / 180);
    const y1 = 100 + 80 * Math.sin((Math.PI * (cumulativeAngle - 90)) / 180);

    cumulativeAngle += angle;

    const x2 = 100 + 80 * Math.cos((Math.PI * (cumulativeAngle - 90)) / 180);
    const y2 = 100 + 80 * Math.sin((Math.PI * (cumulativeAngle - 90)) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      id: item.id,
      name: item.name,
      sales,
      percent,
      color: colors[idx % colors.length],
      pathData,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', position: 'relative' }}>
      
      {/* Tooltip Nama Produk Saat Hover */}
      <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {hoveredSlice ? (
          <div style={{ backgroundColor: '#121212', color: '#fff', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #121212', boxShadow: '2px 2px 0px #0000FF', textTransform: 'uppercase', whiteSpace: 'nowrap', zIndex: 10 }}>
            {hoveredSlice.name}: {hoveredSlice.sales} Pcs ({hoveredSlice.percent}%)
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
          </div>
        )}
      </div>

      {/* Visual SVG Pie Chart */}
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ filter: 'drop-shadow(4px 4px 0px #121212)' }}>
        {slices.map((slice) => (
          <path
            key={slice.id}
            d={slice.pathData}
            fill={slice.color}
            stroke="#121212"
            strokeWidth="2"
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              transformOrigin: '100px 100px',
            }}
            onMouseEnter={() => setHoveredSlice(slice)}
            onMouseLeave={() => setHoveredSlice(null)}
          />
        ))}
        <circle cx="100" cy="100" r="30" fill="#ffffff" stroke="#121212" strokeWidth="2" />
        <text x="100" y="104" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '10px', fontWeight: '900', fontFamily: 'Impact, sans-serif', fill: '#121212' }}>
          {genderType}
        </text>
      </svg>

      {/* Legend Daftar Produk */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
        {slices.map((slice) => {
          const isSelected = hoveredSlice?.id === slice.id;
          return (
            <div
              key={slice.id}
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '4px',
                backgroundColor: isSelected ? '#f0f0ff' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: slice.color, border: '1px solid #121212', display: 'inline-block' }} />
                <span style={{ textTransform: 'uppercase' }}>{slice.name}</span>
              </div>
              <span style={{ color: '#0000FF' }}>{slice.sales} Pcs ({slice.percent}%)</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default function AdminDashboard() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [mainCategory, setMainCategory] = useState<'ALL' | 'MAN' | 'WOMAN'>('ALL');
  const [subCategory, setSubCategory] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const subCategoriesList = [
    'ALL',
    'FORMAL',
    'CASUAL',
    'OUTERWEAR',
    'TRADITIONAL',
    'SPORT',
    'DENIM',
    'STREETWEAR',
    'ACCESSORIES'
  ];

  const fetchOrders = async () => {
    const hiddenAdminOrders = JSON.parse(localStorage.getItem('admin_hidden_orders') || '[]');
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    const visibleOrders = (data || []).filter((ord) => !hiddenAdminOrders.includes(ord.order_id));
    setOrders(visibleOrders);
  };

  const handleDeleteOrderAdmin = (orderId: string) => {
    if (!confirm('Sembunyikan pesanan ini dari tabel admin? (Ulasan pelanggan tetap aman)')) return;

    const hiddenAdminOrders = JSON.parse(localStorage.getItem('admin_hidden_orders') || '[]');
    const updatedHidden = [...hiddenAdminOrders, orderId];
    localStorage.setItem('admin_hidden_orders', JSON.stringify(updatedHidden));

    setOrders(orders.filter((ord) => ord.order_id !== orderId));
    alert('Pesanan berhasil disembunyikan dari dashboard admin!');
  };

  useEffect(() => {
    fetchData();
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('order_id', orderId);
    if (error) {
      alert('Gagal update status: ' + error.message);
    } else {
      fetchOrders();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    const { data: prodData, error: prodError } = await supabase.from('products').select('*');
    const { data: orderItemsData } = await supabase.from('order_items').select('product_id, quantity');

    if (prodError) {
      console.error('Gagal memuat data:', prodError.message);
    } else {
      const salesMap: { [key: string]: number } = {};
      if (orderItemsData) {
        orderItemsData.forEach((item) => {
          salesMap[item.product_id] = (salesMap[item.product_id] || 0) + item.quantity;
        });
      }

      const updatedProducts = (prodData || []).map((prod) => ({
        ...prod,
        sales_count: salesMap[prod.id] || prod.sales_count || 0
      }));

      setProducts(updatedProducts);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((item) => {
    if (mainCategory !== 'ALL') {
      const itemGender = (item.gender || '').toUpperCase();
      if (itemGender !== mainCategory) return false;
    }

    if (subCategory !== 'ALL') {
      const itemCat = (item.category || '').toUpperCase();
      if (itemCat !== subCategory) return false;
    }

    if (startDate && item.created_at && item.created_at < startDate) return false;
    if (endDate && item.created_at && item.created_at > endDate + 'T23:59:59') return false;

    return true;
  }).sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));

  const totalSalesCount = filteredProducts.reduce((acc, curr) => acc + (curr.sales_count || 0), 0);

  return (
    <div>
      {/* HEADER PAGE */}
      <div style={{ marginBottom: '32px', borderBottom: '2px solid #121212', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
          ADMIN CONTROL & ANALYTICS DASHBOARD
        </h1>
        <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>
          Pantau performa penjualan produk berdasarkan kategori, sub-kategori, dan rentang tanggal secara real-time.
        </p>
      </div>

      {/* STATS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '24px', boxShadow: '4px 4px 0px #121212' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '6px' }}>TOTAL PRODUK TERFILTER</div>
          <div style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'Impact, sans-serif', color: '#0000FF' }}>
            {filteredProducts.length} Item
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '24px', boxShadow: '4px 4px 0px #121212' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '6px' }}>TOTAL PENJUALAN TERJUAL</div>
          <div style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'Impact, sans-serif', color: '#121212' }}>
            {totalSalesCount} Pcs
          </div>
        </div>
      </div>

      {/* FILTER PANEL LENGKAP */}
      <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '24px', marginBottom: '32px', boxShadow: '4px 4px 0px #121212' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
          🔍 Filter Grafik & Penjualan Terbanyak
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Kategori Utama (Gender)</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['ALL', 'MAN', 'WOMAN'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMainCategory(cat)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: '1px solid #121212',
                    backgroundColor: mainCategory === cat ? '#121212' : '#ffffff',
                    color: mainCategory === cat ? '#ffffff' : '#121212'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Sub-Kategori</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #121212', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff' }}
            >
              {subCategoriesList.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '7px', border: '1px solid #121212', fontSize: '11px', backgroundColor: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: '7px', border: '1px solid #121212', fontSize: '11px', backgroundColor: '#fff' }}
            />
          </div>
        </div>
      </div>

      {/* GRAFIK / RANKING PRODUK TERLARIS */}
      <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '28px', boxShadow: '4px 4px 0px #121212' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #121212', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: 0 }}>
            🏆 Grafik & Ranking Penjualan Terbanyak ({mainCategory} / {subCategory})
          </h3>
          <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#0000FF', color: '#fff', padding: '4px 10px' }}>
            Auto-Sorted by Sales
          </span>
        </div>

        {loading ? (
          <p style={{ fontSize: '12px', fontWeight: 'bold' }}>Memuat grafik data...</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', padding: '30px' }}>Tidak ada produk yang cocok dengan filter tersebut.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredProducts.map((item, index) => {
              const maxSales = filteredProducts[0].sales_count || 1;
              const percentage = Math.round(((item.sales_count || 0) / maxSales) * 100);

              return (
                <div key={item.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>
                    <span>#{index + 1}. {item.name} <span style={{ fontSize: '10px', color: '#666', fontWeight: 'normal' }}>({item.gender || 'general'} — {item.category || 'general'} — {item.product_type || 'general'})</span></span>
                    <span style={{ color: '#0000FF' }}>{item.sales_count || 0} Terjual</span>
                  </div>
                  <div style={{ width: '100%', height: '14px', backgroundColor: '#f0f0f0', border: '1px solid #121212', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#0000FF', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION PIE CHART INTERAKTIF PER PRODUK (MAN & WOMAN) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginTop: '32px' }}>
        
        <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '24px', boxShadow: '4px 4px 0px #121212' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #121212', paddingBottom: '8px' }}>
            📊 MAN PRODUCT PROPORTION
          </h3>
          <ProductPieChart products={products} genderType="MAN" />
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '24px', boxShadow: '4px 4px 0px #121212' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #121212', paddingBottom: '8px' }}>
            📊 WOMAN PRODUCT PROPORTION
          </h3>
          <ProductPieChart products={products} genderType="WOMAN" />
        </div>

      </div>

      {/* KELOLA STATUS PESANAN */}
      <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '28px', marginTop: '32px', boxShadow: '4px 4px 0px #121212' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', marginBottom: '20px' }}>
          📦 Daftar Pesanan Masuk & Status Pengiriman
        </h3>

        {orders.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#666' }}>Belum ada pesanan masuk.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#121212', color: '#fff', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Order ID</th>
                  <th style={{ padding: '10px' }}>Pemesan</th>
                  <th style={{ padding: '10px' }}>Total</th>
                  <th style={{ padding: '10px' }}>Status Saat Ini</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Ubah Status</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const statusLower = ord.status.toLowerCase();
                  const isDone = statusLower === 'selesai' || statusLower === 'dibatalkan';

                  return (
                    <tr key={ord.order_id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{ord.order_id}</td>
                      <td style={{ padding: '10px' }}>{ord.customer_name} ({ord.phone})</td>
                      <td style={{ padding: '10px' }}>Rp {Number(ord.gross_amount).toLocaleString('id-ID')}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ padding: '4px 8px', backgroundColor: '#eee', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', border: '1px solid #121212' }}>
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.order_id, e.target.value)}
                          style={{ padding: '6px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff', border: '1px solid #121212', textTransform: 'uppercase' }}
                        >
                          <option value="dikemas">DIKEMAS</option>
                          <option value="dikirim">DIKIRIM</option>
                          <option value="selesai">SELESAI</option>
                          <option value="dibatalkan">DIBATALKAN</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {isDone ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteOrderAdmin(ord.order_id)}
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#B91C1C',
                              border: '1px solid #EF4444',
                              padding: '6px 12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                              fontFamily: 'inherit'
                            }}
                            title="Sembunyikan Pesanan dari Admin"
                          >
                            🗑️ HAPUS
                          </button>
                        ) : (
                          <span style={{ color: '#999', fontSize: '11px', fontStyle: 'italic' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK LINKS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px' }}>
        <Link href="/admin/products" style={{ textDecoration: 'none', color: '#121212', display: 'block' }}>
          <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', boxShadow: '3px 3px 0px #121212' }}>
            📦 Kelola CRUD Produk →
          </div>
        </Link>
        <Link href="/admin/settings" style={{ textDecoration: 'none', color: '#121212', display: 'block' }}>
          <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', boxShadow: '3px 3px 0px #121212' }}>
            ⚙️ Pengaturan Banner & Navbar →
          </div>
        </Link>
      </div>

    </div>
  );
}