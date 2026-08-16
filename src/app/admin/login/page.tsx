'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

type Step = 'email' | 'otp'

export default function AdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  async function sendOTP(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/admin-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }

      setSuccess('OTP sent! Check your inbox (and spam folder).')
      setStep('otp')
      setCountdown(60)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP(e: React.FormEvent) {
    e.preventDefault()
    const otpStr = otp.join('')
    if (otpStr.length < 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/admin-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpStr }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid OTP')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    if (!value && index > 0) otpRefs.current[index - 1]?.focus()
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
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
    }}>
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Admin Access
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Secure OTP-based authentication
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {step === 'email' ? (
            <form onSubmit={sendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#ef4444', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div>
                <label className="label" htmlFor="admin-email">Admin Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-email"
                    className="input"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: 44 }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button id="send-otp-btn" type="submit" className="btn-primary" disabled={loading} style={{ padding: '13px 20px', fontSize: 15 }}>
                {loading ? <span className="spinner" /> : <Mail size={18} />}
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {success && (
                <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, color: '#10b981', fontSize: 13 }}>
                  {success}
                </div>
              )}
              {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#ef4444', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, textAlign: 'center' }}>
                  Enter the 6-digit code sent to <strong style={{ color: 'var(--color-primary)' }}>{email}</strong>
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      className="otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      id={`otp-digit-${i}`}
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button id="verify-otp-btn" type="submit" className="btn-primary" disabled={loading} style={{ padding: '13px 20px', fontSize: 15 }}>
                {loading ? <span className="spinner" /> : <Shield size={18} />}
                {loading ? 'Verifying…' : 'Verify & Login'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); setSuccess(''); }}
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: '7px 12px' }}
                >
                  <ArrowLeft size={14} /> Change Email
                </button>
                <button
                  type="button"
                  onClick={(e) => { setOtp(['','','','','','']); sendOTP(e as unknown as React.FormEvent); }}
                  className="btn-secondary"
                  disabled={countdown > 0 || loading}
                  style={{ fontSize: 13, padding: '7px 12px' }}
                >
                  <RefreshCw size={14} />
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link href="/login" style={{ color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none' }}>
            ← Back to Employee Login
          </Link>
        </p>
      </div>
    </div>
  )
}
