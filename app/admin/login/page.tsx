'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'jay' && password === '222') {
      // Simpan status login sederhana di localStorage / cookie
      document.cookie = "nochy_admin_logged_in=true; path=/;";
      router.push('/admin');
    } else {
      setError('Username atau Password salah, bro!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff1e6', fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ backgroundColor: '#ffffff', border: '2px solid #121212', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '6px 6px 0px #121212' }}>
        
        <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
          ADMIN LOGIN
        </h1>
        <p style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginBottom: '28px' }}>
          NOCHY E-COMMERCE CONTROL PANEL
        </p>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', fontSize: '11px', fontWeight: 'bold', marginBottom: '20px', border: '1px solid #dc2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username..."
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #121212', fontSize: '12px', outline: 'none', backgroundColor: '#fafafa' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password..."
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #121212', fontSize: '12px', outline: 'none', backgroundColor: '#fafafa' }}
            />
          </div>

          <button 
            type="submit"
            style={{ backgroundColor: '#0000FF', color: '#ffffff', border: 'none', padding: '14px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', marginTop: '10px' }}
          >
            Login to Admin ↗
          </button>
        </form>

      </div>
    </div>
  );
}