import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff1e6', color: '#121212', fontFamily: "'JetBrains Mono', monospace" }}>

      {/* TOP ADMIN HEADER */}
      <header className="admin-header">
        <Link href="/admin" style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.05em', color: '#121212', textDecoration: 'none', fontFamily: 'Impact, sans-serif', whiteSpace: 'nowrap' }}>
          NOCHY. <span style={{ fontSize: '11px', backgroundColor: '#0000FF', color: '#fff', padding: '2px 6px', fontFamily: 'JetBrains Mono, monospace', verticalAlign: 'middle' }}>ADMIN</span>
        </Link>

        {/* Desktop nav */}
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">Dashboard</Link>
          <Link href="/admin/products" className="admin-nav-link">Products (CRUD)</Link>
          <Link href="/admin/settings" className="admin-nav-link">Banners & Navbar</Link>
          <Link href="/" target="_blank" className="admin-nav-cta">View Store ↗</Link>
        </nav>

        {/* Mobile: tombol store */}
        <div className="admin-mobile-actions">
          <Link href="/" target="_blank" style={{ fontSize: '11px', fontWeight: 'bold', color: '#0000FF', border: '1px solid #0000FF', padding: '6px 12px', textDecoration: 'none' }}>
            Store ↗
          </Link>
        </div>
      </header>

      {/* Mobile tab nav */}
      <nav className="admin-mobile-nav">
        <Link href="/admin" className="admin-mobile-nav-link">Dashboard</Link>
        <Link href="/admin/products" className="admin-mobile-nav-link">Products</Link>
        <Link href="/admin/settings" className="admin-mobile-nav-link">Settings</Link>
      </nav>

      {/* CONTENT */}
      <div className="admin-content">
        {children}
      </div>

    </div>
  );
}
