'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  gender?: string;
  product_type?: string;
  category?: string;
  image_url?: string;
  hover_image_url?: string;
  image_3?: string;
  image_4?: string;
  description?: string;
  stock_sizes?: { [key: string]: number };
  sales_count?: number;
}

const PRODUCT_TYPE_STYLE: Record<string, React.CSSProperties> = {
  new_arrival: { backgroundColor: '#0000FF', color: '#ffffff' },
  winter:      { backgroundColor: '#121212', color: '#ffffff' },
  bestseller:  { backgroundColor: '#16a34a', color: '#ffffff' },
  general:     { backgroundColor: '#e5e5e5', color: '#121212' },
};

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);

  // ── Form state ──
  const [name, setName]                   = useState('');
  const [price, setPrice]                 = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [gender, setGender]               = useState('man');
  const [productType, setProductType]     = useState('general');
  const [category, setCategory]           = useState('casual');
  const [imageUrl, setImageUrl]           = useState('');
  const [hoverImageUrl, setHoverImageUrl] = useState('');
  const [image3, setImage3]               = useState('');
  const [image4, setImage4]               = useState('');
  const [description, setDescription]     = useState('');
  const [stockM, setStockM]               = useState('10');
  const [stockL, setStockL]               = useState('10');
  const [stockXL, setStockXL]             = useState('5');

  // ── Fetch ──
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Gagal mengambil produk:', error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  // ── Reset form ──
  const resetForm = () => {
    setName(''); setPrice(''); setDiscountPrice('');
    setGender('man'); setProductType('general'); setCategory('casual');
    setImageUrl(''); setHoverImageUrl(''); setImage3(''); setImage4('');
    setDescription(''); setStockM('10'); setStockL('10'); setStockXL('5');
  };

  // ── Open modals ──
  const handleOpenCreateModal = () => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingId(p.id);
    setName(p.name || '');
    setPrice(p.price ? String(p.price) : '');
    setDiscountPrice(p.discount_price ? String(p.discount_price) : '');
    setGender(p.gender || 'man');
    setProductType(p.product_type || 'general');
    setCategory(p.category || 'casual');
    setImageUrl(p.image_url || '');
    setHoverImageUrl(p.hover_image_url || '');
    setImage3(p.image_3 || '');
    setImage4(p.image_4 || '');
    setDescription(p.description || '');
    if (p.stock_sizes) {
      setStockM(String(p.stock_sizes.M ?? 0));
      setStockL(String(p.stock_sizes.L ?? 0));
      setStockXL(String(p.stock_sizes.XL ?? 0));
    } else {
      setStockM('10'); setStockL('10'); setStockXL('5');
    }
    setShowModal(true);
  };

  // ── Submit ──
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const stockSizes = {
      M: parseInt(stockM) || 0,
      L: parseInt(stockL) || 0,
      XL: parseInt(stockXL) || 0,
    };
    const payload = {
      name,
      price: parseFloat(price),
      discount_price: discountPrice ? parseFloat(discountPrice) : null,
      gender,
      product_type: productType,
      category,
      image_url:       imageUrl       || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      hover_image_url: hoverImageUrl  || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      image_3:         image3         || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
      image_4:         image4         || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      description,
      stock_sizes: stockSizes,
    };

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId);
      if (error) { alert('Gagal mengupdate: ' + error.message); return; }
      alert('Produk berhasil diupdate!');
    } else {
      const { error } = await supabase.from('products').insert([{ ...payload, sales_count: 0 }]);
      if (error) { alert('Gagal menambah: ' + error.message); return; }
      alert('Produk berhasil ditambahkan!');
    }
    setShowModal(false);
    resetForm();
    fetchProducts();
  };

  // ── Delete ──
  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Yakin mau hapus "${productName}"?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert('Gagal menghapus: ' + error.message);
    else fetchProducts();
  };

  // ── Render ──
  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '2px solid #121212', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: 0 }}>
            MANAJEMEN PRODUK (CRUD)
          </h1>
          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
            Kelola harga, diskon, stok ukuran, edit, dan hapus pakaian dari database Supabase.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          style={{ backgroundColor: '#0000FF', color: '#fff', border: 'none', padding: '12px 24px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '3px 3px 0px #121212' }}
        >
          + Tambah Produk Baru
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p style={{ fontSize: '13px', fontWeight: 'bold' }}>Loading data produk...</p>
      ) : products.length === 0 ? (
        <div style={{ backgroundColor: '#fff', border: '2px solid #121212', padding: '40px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Belum ada produk tersimpan.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '2px solid #121212' }}>
            <thead>
              <tr style={{ backgroundColor: '#121212', color: '#fff', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Foto</th>
                <th style={{ padding: '12px' }}>Nama Produk</th>
                <th style={{ padding: '12px' }}>Gender</th>
                <th style={{ padding: '12px' }}>Jenis</th>
                <th style={{ padding: '12px' }}>Kategori</th>
                <th style={{ padding: '12px' }}>Harga Normal</th>
                <th style={{ padding: '12px' }}>Harga Diskon</th>
                <th style={{ padding: '12px' }}>Stok</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => {
                const pt = item.product_type || 'general';
                const ptStyle = PRODUCT_TYPE_STYLE[pt] ?? PRODUCT_TYPE_STYLE.general;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5', fontSize: '12px' }}>
                    <td style={{ padding: '12px' }}>
                      <img
                        src={item.image_url || ''}
                        alt={item.name}
                        style={{ width: '50px', height: '60px', objectFit: 'cover', border: '1px solid #121212' }}
                      />
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ border: '1px solid #121212', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                        {item.gender || 'man'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', ...ptStyle }}>
                        {pt}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ border: '1px solid #e5e5e5', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {item.category || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      Rp {Number(item.price).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '12px', color: item.discount_price ? '#0000FF' : '#888', fontWeight: 'bold' }}>
                      {item.discount_price ? `Rp ${Number(item.discount_price).toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '11px' }}>
                      {item.stock_sizes
                        ? Object.entries(item.stock_sizes).map(([size, count]) => (
                            <span key={size} style={{ marginRight: '4px', background: '#f0f0f0', padding: '2px 4px', border: '1px solid #ccc' }}>
                              {size}:{count}
                            </span>
                          ))
                        : 'Default'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          style={{ backgroundColor: '#0000FF', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#fff', border: '2px solid #121212', padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '8px 8px 0px #121212' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #121212', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'Impact, sans-serif', margin: 0, textTransform: 'uppercase' }}>
                {editingId ? 'EDIT PRODUK BAJU' : 'TAMBAH PRODUK BAJU'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#121212" strokeWidth="2" strokeLinecap="square">
                  <line x1="3" y1="3" x2="17" y2="17" /><line x1="17" y1="3" x2="3" y2="17" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Nama */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Nama Baju</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Misal: CLASSIC OVERSIZED HOODIE"
                  style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }} />
              </div>

              {/* Harga */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Harga Normal (Rp)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} required placeholder="250000"
                    style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Harga Diskon (Opsional)</label>
                  <input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} placeholder="199000"
                    style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }} />
                </div>
              </div>

              {/* Gender + Jenis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Gender Produk</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px', backgroundColor: '#fff' }}>
                    <option value="man">man</option>
                    <option value="woman">woman</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Jenis Produk (Penempatan)</label>
                  <select value={productType} onChange={e => setProductType(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px', backgroundColor: '#fff' }}>
                    <option value="general">general — produk biasa</option>
                    <option value="new_arrival">new_arrival — New Arrival</option>
                    <option value="winter">winter — Winter Wear</option>
                    <option value="bestseller">bestseller — Best Seller</option>
                  </select>
                </div>
              </div>

              {/* Kategori style */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Kategori Style</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px', backgroundColor: '#fff' }}>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="traditional">Traditional</option>
                  <option value="sport">Sport</option>
                  <option value="denim">Denim</option>
                  <option value="streetwear">Streetwear</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              {/* Foto */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>URL Foto Utama</label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>URL Foto Pas Hover</label>
                <input type="url" value={hoverImageUrl} onChange={e => setHoverImageUrl(e.target.value)} placeholder="https://..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>URL Foto 3</label>
                  <input type="url" value={image3} onChange={e => setImage3(e.target.value)} placeholder="https://..."
                    style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>URL Foto 4</label>
                  <input type="url" value={image4} onChange={e => setImage4(e.target.value)} placeholder="https://..."
                    style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }} />
                </div>
              </div>

              {/* Stok */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Stok Ukuran</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>M:</span>
                    <input type="number" value={stockM} onChange={e => setStockM(e.target.value)}
                      style={{ width: '100%', padding: '6px', border: '1px solid #121212', fontSize: '11px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>L:</span>
                    <input type="number" value={stockL} onChange={e => setStockL(e.target.value)}
                      style={{ width: '100%', padding: '6px', border: '1px solid #121212', fontSize: '11px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>XL:</span>
                    <input type="number" value={stockXL} onChange={e => setStockXL(e.target.value)}
                      style={{ width: '100%', padding: '6px', border: '1px solid #121212', fontSize: '11px' }} />
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Deskripsi Produk</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="Penjelasan singkat mengenai bahan dan potongan baju..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }} />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit"
                  style={{ flex: 1, backgroundColor: '#0000FF', color: '#fff', border: 'none', padding: '12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                  {editingId ? 'Update Produk ↗' : 'Simpan Produk ↗'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ backgroundColor: '#e5e5e5', border: 'none', padding: '12px 20px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
