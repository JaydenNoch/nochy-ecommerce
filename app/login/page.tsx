'use client'

import { useState } from 'react'
import { createClient } from '../utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()

  const [isRegister, setIsRegister] = useState(false) // false = Login, true = Register
  const [isForgotPassword, setIsForgotPassword] = useState(false) // true = Mode Lupa Password
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (isForgotPassword) {
      // Proses Kirim Email Reset Password
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`, // atau arahkan ke halaman ganti password jika ada
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccessMsg('Instruksi pemulihan password telah dikirim ke email Anda.')
      }
    } else if (isRegister) {
      // Proses Register
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccessMsg('Registrasi berhasil! Silakan cek email Anda untuk konfirmasi atau langsung masuk.')
        setIsRegister(false)
      }
    } else {
      // Proses Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg('Email atau password salah.')
      } else {
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#121212', fontFamily: "'Courier New', Courier, monospace", display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      <div style={{
        width: '420px',
        maxWidth: '100%',
        border: '2px solid #121212',
        padding: '40px',
        boxShadow: '8px 8px 0px #121212',
        backgroundColor: '#ffffff'
      }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: '11px', color: '#888', textDecoration: 'none', display: 'inline-block', marginBottom: '12px' }}>
            ← KEMBALI KE BERANDA
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Impact, sans-serif', textTransform: 'uppercase', margin: 0 }}>
            {isForgotPassword ? 'LUPA PASSWORD' : isRegister ? 'DAFTAR AKUN' : 'MASUK AKUN'}
          </h1>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '6px', textTransform: 'uppercase' }}>
            {isForgotPassword ? 'Masukkan email untuk reset password' : isRegister ? 'Buat akun baru untuk mulai belanja' : 'Akses keranjang dan riwayat pesanan Anda'}
          </p>
        </div>

        {/* Error / Success Notification */}
        {errorMsg && (
          <div style={{ backgroundColor: '#ffdddd', border: '1px solid #ff0000', color: '#ff0000', padding: '10px', fontSize: '11px', marginBottom: '16px', fontWeight: 'bold' }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ backgroundColor: '#ddffdd', border: '1px solid #00aa00', color: '#00aa00', padding: '10px', fontSize: '11px', marginBottom: '16px', fontWeight: 'bold' }}>
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #121212',
                fontSize: '12px',
                outline: 'none',
                backgroundColor: '#f9f9f9',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {!isForgotPassword && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: '#0000FF', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Lupa Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #121212',
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: '#f9f9f9',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#0000FF',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginTop: '10px',
              letterSpacing: '0.1em'
            }}
          >
            {loading ? 'MEMPROSES...' : isForgotPassword ? 'KIRIM LINK RESET ↗' : isRegister ? 'DAFTAR SEKARANG ↗' : 'MASUK ↗'}
          </button>
        </form>

        {/* Toggle Switch */}
        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isForgotPassword ? (
            <button
              type="button"
              onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }}
              style={{ background: 'none', border: 'none', color: '#0000FF', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline', padding: 0 }}
            >
              ← Kembali ke halaman Masuk
            </button>
          ) : (
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
              {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0000FF',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '11px',
                  textDecoration: 'underline',
                  padding: 0,
                  marginLeft: '4px'
                }}
              >
                {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
              </button>
            </p>
          )}
        </div>

      </div>
    </main>
  )
}