'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State untuk pengaturan
  const [marqueeText, setMarqueeText] = useState('BLACK FRIDAY SALE 50% OFF');
  
  // State Hero Section
  const [heroBadge, setHeroBadge] = useState('YEAR-END SALE');
  const [heroTitle, setHeroTitle] = useState('NOCHY SIGNATURES 25% OFF');
  const [heroSubtitle, setHeroSubtitle] = useState('Redefine your look with 25% off for all NOCHY Signatures outfit');
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80');

  // State Winter/Seasonal Banner
  const [winterTitle, setWinterTitle] = useState('WINTER WEAR');
  const [winterDesc, setWinterDesc] = useState("Explore the newest additions to our Men's Collection to discover clothing, shoes, bags and accessories featuring signature styles and detailing.");

  // Ambil data pengaturan dari Supabase saat halaman dimuat
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('settings').select('*').single();
      
      if (error) {
        console.log('Belum ada record settings, menggunakan default.');
      } else if (data) {
        setMarqueeText(data.marquee_text || marqueeText);
        setHeroBadge(data.hero_badge || heroBadge);
        setHeroTitle(data.hero_title || heroTitle);
        setHeroSubtitle(data.hero_subtitle || heroSubtitle);
        setHeroImage(data.hero_image || heroImage);
        setWinterTitle(data.winter_title || winterTitle);
        setWinterDesc(data.winter_desc || winterDesc);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  // Simpan Pengaturan ke Supabase
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: 1, // Asumsi kita pakai baris id = 1 untuk pengaturan global
      marquee_text: marqueeText,
      hero_badge: heroBadge,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_image: heroImage,
      winter_title: winterTitle,
      winter_desc: winterDesc,
      updated_at: new Date()
    };

    // Gunakan upsert supaya jika baris id=1 belum ada, maka di-insert, kalau sudah ada di-update
    const { error } = await supabase.from('settings').upsert(payload);

    if (error) {
      alert('Gagal menyimpan pengaturan: ' + error.message);
    } else {
      alert('Pengaturan Banner & Navbar berhasil disimpan, bro!');
    }
    setSaving(false);
  };

  if (loading) {
    return <p style={{ fontSize: '13px', fontWeight: 'bold' }}>Memuat pengaturan...</p>;
  }

  return (
    <div>
      {/* HEADER PAGE */}
      <div style={{ marginBottom: '32px', borderBottom: '2px solid #121212', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: 0 }}>
          PENGATURAN BANNER & NAVBAR
        </h1>
        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
          Ubah teks running marquee, konten hero utama website, dan banner koleksi musiman secara dinamis.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}>
        
        {/* SECTION 1: MARQUEE TEXT */}
        <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '24px', boxShadow: '4px 4px 0px #121212' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: '0 0 16px 0', color: '#0000FF' }}>
            1. Top Announcement Bar (Marquee)
          </h3>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Teks Running Marquee</label>
            <input 
              type="text" 
              value={marqueeText} 
              onChange={(e) => setMarqueeText(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }}
            />
            <span style={{ fontSize: '10px', color: '#666', marginTop: '4px', display: 'block' }}>Teks ini berjalan otomatis di bagian paling atas website.</span>
          </div>
        </div>

        {/* SECTION 2: HERO SECTION */}
        <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '24px', boxShadow: '4px 4px 0px #121212' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: '0 0 16px 0', color: '#0000FF' }}>
            2. Hero Section (Banner Utama)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Hero Badge (Label Kecil Di Atas Judul)</label>
              <input 
                type="text" 
                value={heroBadge} 
                onChange={(e) => setHeroBadge(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Hero Title (Judul Utama)</label>
              <input 
                type="text" 
                value={heroTitle} 
                onChange={(e) => setHeroTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Hero Subtitle (Deskripsi Singkat)</label>
              <textarea 
                value={heroSubtitle} 
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>URL Gambar Latar Belakang Hero (Background Image URL)</label>
              <input 
                type="url" 
                value={heroImage} 
                onChange={(e) => setHeroImage(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: WINTER / SEASONAL BANNER */}
        <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '24px', boxShadow: '4px 4px 0px #121212' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: '0 0 16px 0', color: '#0000FF' }}>
            3. Banner Koleksi Musiman (Winter Wear / Summer / Spring)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Judul Koleksi Musiman</label>
              <input 
                type="text" 
                value={winterTitle} 
                onChange={(e) => setWinterTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Deskripsi Koleksi</label>
              <textarea 
                value={winterDesc} 
                onChange={(e) => setWinterDesc(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px', border: '1px solid #121212', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div>
          <button 
            type="submit" 
            disabled={saving}
            style={{ backgroundColor: '#0000FF', color: '#ffffff', border: 'none', padding: '16px 32px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '4px 4px 0px #121212' }}
          >
            {saving ? 'Menyimpan Perubahan...' : 'Simpan Semua Pengaturan ↗'}
          </button>
        </div>

      </form>
    </div>
  );
}