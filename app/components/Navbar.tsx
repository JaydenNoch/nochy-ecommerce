'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import SearchOverlay from './SearchOverlay';
import { createClient } from '../utils/supabase/client';

const subCategories = {
  man: ['Formal', 'Casual', 'Outerwear', 'Traditional', 'Sport', 'Denim', 'Streetwear', 'Accessories'],
  woman: ['Formal', 'Casual', 'Outerwear', 'Traditional', 'Sport', 'Denim', 'Streetwear', 'Accessories'],
};

type Gender = 'man' | 'woman';

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catDropdown, setCatDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [activeGender, setActiveGender] = useState<Gender>('man');
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileGender, setMobileGender] = useState<Gender>('man');
  const [marqueeText, setMarqueeText] = useState('BLACK FRIDAY SALE 50% OFF');
  const [cartCount, setCartCount] = useState(0);

  // State Auth User
  const [user, setUser] = useState<any>(null);

  const [totalHeight, setTotalHeight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Cek sesi user yang login
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkUser();

    // Listen status auth realtime
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Handle Logout / Ganti Akun
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserDropdown(false);
    setMobileOpen(false);
    router.push('/login');
    router.refresh();
  };

  // Ambil teks marquee dari Supabase
  useEffect(() => {
    const fetchMarquee = async () => {
      const { data } = await supabase.from('settings').select('marquee_text').eq('id', 1).single();
      if (data?.marquee_text) {
        setMarqueeText(data.marquee_text);
      }
    };
    fetchMarquee();
  }, [supabase]);

  // Hitung jumlah item di keranjang (localStorage)
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((acc: number, item: { quantity: number }) => acc + (item.quantity || 1), 0);
        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      if (wrapperRef.current) setTotalHeight(wrapperRef.current.offsetHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Tutup semua saat navigasi
  useEffect(() => {
    setMobileOpen(false);
    setCatDropdown(false);
    setUserDropdown(false);
    setMobileCatOpen(false);
  }, [pathname]);

  // Lock scroll saat mobile menu buka
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCatDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <div
        ref={wrapperRef}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 9999,
          transform: 'translateZ(0)',
          willChange: 'transform',
          isolation: 'isolate',
        }}
      >
        {/* ANNOUNCEMENT BAR */}
        <div style={{ backgroundColor: '#0000FF', color: '#ffffff', padding: '8px 0', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', overflow: 'hidden', width: '100%' }}>
          <div className="animate-marquee-track">
            <span style={{ paddingRight: '48px', whiteSpace: 'nowrap' }}>
              {marqueeText} &nbsp;&nbsp;+&nbsp;&nbsp; {marqueeText} &nbsp;&nbsp;+&nbsp;&nbsp; {marqueeText} &nbsp;&nbsp;+&nbsp;&nbsp; {marqueeText} &nbsp;&nbsp;+&nbsp;&nbsp;
            </span>
            <span style={{ paddingRight: '48px', whiteSpace: 'nowrap' }}>
              {marqueeText} &nbsp;&nbsp;+&nbsp;&nbsp; {marqueeText} &nbsp;&nbsp;+&nbsp;&nbsp; {marqueeText} &nbsp;&nbsp;+&nbsp;&nbsp; {marqueeText} &nbsp;&nbsp;+&nbsp;&nbsp;
            </span>
          </div>
        </div>

        {/* HEADER */}
        <header style={{ borderBottom: '1px solid #e5e5e5', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
          {/* Logo */}
          <Link href="/" style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.05em', color: '#121212', textDecoration: 'none', fontFamily: 'Impact, sans-serif' }}>
            NOCHY.
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '28px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', alignItems: 'center', position: 'relative' }}>
            <Link
              href="/#new-arrival"
              onClick={(e) => {
                const el = document.getElementById('new-arrival');
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{ color: '#121212', textDecoration: 'none' }}
            >
              NEW ARRIVAL
            </Link>
            
            {/* CATEGORIES dropdown trigger */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setCatDropdown(!catDropdown)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                  color: catDropdown ? '#0000FF' : '#121212',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontFamily: 'inherit',
                }}
              >
                CATEGORIES
                <svg width="10" height="10" viewBox="0 0 10 6" fill="none" style={{ transition: 'transform 0.2s', transform: catDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                </svg>
              </button>

              {/* DROPDOWN PANEL CATEGORIES */}
              {catDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 16px)', left: '50%', transform: 'translateX(-50%)',
                  backgroundColor: '#ffffff', border: '1px solid #e5e5e5',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                  minWidth: '320px', zIndex: 100,
                  padding: '0',
                }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
                    {(['man', 'woman'] as Gender[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setActiveGender(g)}
                        style={{
                          flex: 1, padding: '12px', border: 'none', cursor: 'pointer',
                          fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em',
                          backgroundColor: activeGender === g ? '#121212' : '#ffffff',
                          color: activeGender === g ? '#ffffff' : '#121212',
                          transition: 'all 0.15s ease',
                          fontFamily: 'inherit',
                        }}
                      >
                        {g === 'man' ? 'MAN' : 'WOMAN'}
                      </button>
                    ))}
                  </div>

                  <div style={{ padding: '8px 0' }}>
                    {subCategories[activeGender].map((cat) => (
                      <Link
                        key={cat}
                        href={`/shop?category=${activeGender}&sub=${cat.toLowerCase()}`}
                        onClick={() => setCatDropdown(false)}
                        style={{
                          display: 'block', padding: '10px 20px',
                          fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                          color: '#121212', textDecoration: 'none', letterSpacing: '0.05em',
                          transition: 'background-color 0.15s ease, color 0.15s ease',
                        }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = '#f5f5f5'; (e.target as HTMLElement).style.color = '#0000FF'; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = ''; (e.target as HTMLElement).style.color = '#121212'; }}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/#footer"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{ color: '#121212', textDecoration: 'none' }}
            >
              ABOUT US
            </Link>
            
            <span style={{ color: '#ccc' }}>|</span>

            {/* SEARCH */}
            <SearchOverlay />

            {/* CART ICON */}
            <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#121212', textDecoration: 'none', position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartCount > 0 && (
                <span style={{ backgroundColor: '#0000FF', color: '#fff', fontSize: '10px', fontWeight: 'bold', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ── USER PROFILE / LOGOUT ICON DESKTOP ── */}
            <div ref={userMenuRef} style={{ position: 'relative', display: 'inline-block' }}>
              {user ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserDropdown(!userDropdown);
                  }}
                  title="Akun Saya"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', color: userDropdown ? '#0000FF' : '#121212'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              ) : (
                <Link
                  href="/login"
                  title="Login / Masuk"
                  style={{ display: 'flex', alignItems: 'center', color: '#121212', textDecoration: 'none' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
              )}

              {/* USER DROPDOWN POPUP DESKTOP */}
              {userDropdown && user && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute', top: 'calc(100% + 16px)', right: 0,
                    backgroundColor: '#ffffff', border: '2px solid #121212',
                    boxShadow: '4px 4px 0px #121212',
                    minWidth: '220px', zIndex: 99999,
                    padding: '16px',
                  }}
                >
                  <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', display: 'block' }}>LOGGED IN AS</span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#121212', wordBreak: 'break-all' }}>{user.email}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdown(false);
                      window.location.href = '/pesanan-saya';
                    }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
                      padding: '8px 0', fontSize: '11px', fontWeight: 'bold',
                      color: '#121212', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    📦 Pesanan Saya
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdown(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%', marginTop: '8px', backgroundColor: '#ef4444', color: '#ffffff',
                      border: 'none', padding: '8px', fontSize: '11px', fontWeight: 'bold',
                      textTransform: 'uppercase', cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit'
                    }}
                  >
                    Logout / Ganti Akun ↗
                  </button>
                </div>
              )}
            </div>

          </nav>

          {/* ── MOBILE: SEARCH + CART + USER + HAMBURGER ── */}
          <div className="mobile-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SearchOverlay />

            <Link href="/cart" style={{ color: '#121212', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#0000FF', color: '#fff', fontSize: '9px', fontWeight: 'bold', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER ICON MOBILE */}
            <div style={{ position: 'relative' }}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setUserDropdown(!userDropdown)}
                  title="Akun Saya"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: userDropdown ? '#0000FF' : '#121212' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              ) : (
                <Link href="/login" style={{ color: '#121212', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
              )}

              {/* USER DROPDOWN MOBILE */}
              {userDropdown && user && (
                <div style={{
                  position: 'fixed',
                  top: `${totalHeight}px`,
                  right: '16px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #121212',
                  boxShadow: '4px 4px 0px #121212',
                  minWidth: '220px',
                  zIndex: 10000,
                  padding: '16px',
                }}>
                  <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', display: 'block' }}>LOGGED IN AS</span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#121212', wordBreak: 'break-all' }}>{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserDropdown(false);
                      window.location.href = '/pesanan-saya';
                    }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
                      padding: '8px 0', fontSize: '11px', fontWeight: 'bold',
                      color: '#121212', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    📦 Pesanan Saya
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ width: '100%', marginTop: '8px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '8px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Logout / Ganti Akun ↗
                  </button>
                </div>
              )}
            </div>

            <span style={{ color: '#e5e5e5', fontSize: '18px', lineHeight: 1 }}>|</span>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="hamburger-btn"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px' }}
            >
              <span style={{ width: '24px', height: '2px', backgroundColor: '#121212', display: 'block', transition: 'transform 0.25s ease', transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ width: '24px', height: '2px', backgroundColor: '#121212', display: 'block', transition: 'opacity 0.25s ease', opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ width: '24px', height: '2px', backgroundColor: '#121212', display: 'block', transition: 'transform 0.25s ease', transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </header>

        {/* ── MOBILE DROPDOWN MENU ── */}
        {mobileOpen && (
          <div style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #0000FF', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
            <Link
              href="/#new-arrival"
              onClick={(e) => {
                setMobileOpen(false);
                const el = document.getElementById('new-arrival');
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{ display: 'block', padding: '16px 24px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', color: '#121212', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}
            >
              NEW ARRIVAL
            </Link>

            {/* CATEGORIES accordion mobile */}
            <div>
              <button
                type="button"
                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                style={{ width: '100%', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', fontFamily: 'inherit' }}
              >
                CATEGORIES
                <svg width="10" height="10" viewBox="0 0 10 6" fill="none" style={{ transition: 'transform 0.2s', transform: mobileCatOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M1 1L5 5L9 1" stroke="#121212" strokeWidth="1.5" strokeLinecap="square"/>
                </svg>
              </button>

              {mobileCatOpen && (
                <div style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
                    {(['man', 'woman'] as Gender[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setMobileGender(g)}
                        style={{
                          flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                          fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
                          backgroundColor: mobileGender === g ? '#121212' : '#fafafa',
                          color: mobileGender === g ? '#ffffff' : '#121212',
                          fontFamily: 'inherit',
                        }}
                      >
                        {g === 'man' ? 'MAN' : 'WOMAN'}
                      </button>
                    ))}
                  </div>
                  {subCategories[mobileGender].map((cat) => (
                    <Link
                      key={cat}
                      href={`/shop?category=${mobileGender}&sub=${cat.toLowerCase()}`}
                      onClick={() => setMobileOpen(false)}
                      style={{ display: 'block', padding: '12px 32px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#444', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/#footer"
              onClick={(e) => {
                setMobileOpen(false);
                if (pathname === '/') {
                  e.preventDefault();
                  document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{ display: 'block', padding: '16px 24px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', color: '#121212', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}
            >
              ABOUT US
            </Link>

            {user ? (
              <>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '16px 24px', textAlign: 'left', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  LOGOUT ({user.email}) ↗
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 24px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', color: '#0000FF', textDecoration: 'none' }}>
                🔑 LOGIN / MASUK
              </Link>
            )}
          </div>
        )}
      </div>

      {/* SPACER */}
      <div style={{ height: totalHeight > 0 ? `${totalHeight}px` : '90px', flexShrink: 0 }} />
    </>
  );
}