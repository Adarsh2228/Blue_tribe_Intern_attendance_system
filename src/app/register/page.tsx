'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, Building2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    empCode: '',
    salesOfficer: '',
    tl: '',
    city: '',
    dateOfJoining: '',
    agencyName: '',
    password: '',
    confirmPassword: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/employee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empCode: form.empCode,
          salesOfficer: form.salesOfficer,
          tl: form.tl,
          city: form.city,
          dateOfJoining: form.dateOfJoining,
          agencyName: form.agencyName,
          password: form.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
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

  const fields: { name: keyof typeof form; label: string; placeholder: string; type?: string }[] = [
    { name: 'empCode', label: 'Employee Code *', placeholder: 'e.g. EMP001' },
    { name: 'salesOfficer', label: 'Sales Officer Name *', placeholder: 'Your full name' },
    { name: 'tl', label: 'Team Leader (TL) *', placeholder: 'TL name' },
    { name: 'city', label: 'City *', placeholder: 'Your city' },
    { name: 'agencyName', label: 'Agency Name *', placeholder: 'Agency name' },
    { name: 'dateOfJoining', label: 'Date of Joining *', placeholder: '', type: 'date' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '24px',
    }}>
      {/* BG blobs */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'fixed', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            <Building2 size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Employee Registration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Create your account to get started
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

            {fields.map(f => (
              <div key={f.name}>
                <label className="label" htmlFor={f.name}>{f.label}</label>
                <input
                  id={f.name}
                  name={f.name}
                  className="input"
                  type={f.type ?? 'text'}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className="input"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              id="register-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 8, padding: '13px 20px', fontSize: 15 }}
            >
              {loading ? <span className="spinner" /> : <UserPlus size={18} />}
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
