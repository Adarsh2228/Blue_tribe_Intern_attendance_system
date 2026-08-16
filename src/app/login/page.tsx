'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, Building2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const [empCode, setEmpCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empCode, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      router.push('/employee/dashboard')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '24px',
      position: 'relative',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Theme toggle */}
      <div style={{ position: 'fixed', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            <Building2 size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Employee Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Sign in to track your attendance
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10,
                color: '#ef4444',
                fontSize: 13,
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <div>
              <label className="label" htmlFor="empCode">Employee Code</label>
              <input
                id="empCode"
                className="input"
                type="text"
                placeholder="e.g. EMP001"
                value={empCode}
                onChange={e => setEmpCode(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    padding: 4,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="employee-login-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 4, padding: '13px 20px', fontSize: 15 }}
            >
              {loading ? <span className="spinner" /> : <LogIn size={18} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--bg-border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--bg-border)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            New employee?{' '}
            <Link
              href="/register"
              style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Admin link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Admin?{' '}
          <Link
            href="/admin/login"
            style={{ color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none' }}
          >
            Admin Login →
          </Link>
        </p>
      </div>
    </div>
  )
}
