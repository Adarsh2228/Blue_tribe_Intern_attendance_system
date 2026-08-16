'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, Clock, Calendar, TrendingUp, LogOut,
  Building2, AlertCircle, User, MapPin, Briefcase, CalendarDays, Key
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { KpiCard } from '@/components/ui/KpiCard'

interface AttendanceRecord {
  id: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY'
  checkInTime: string | null
  checkOutTime: string | null
}

interface EmployeeInfo {
  empCode: string
  salesOfficer: string
  tl: string
  city: string
  agencyName: string
  dateOfJoining: string
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [checkedInToday, setCheckedInToday] = useState(false)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInStatus, setCheckInStatus] = useState<'PRESENT' | 'HALF_DAY'>('PRESENT')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' })
  const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance/records')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setRecords(data.records || [])

      // Check if checked in today (IST)
      const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
      const todayRec = data.records?.find((r: AttendanceRecord) =>
        new Date(r.date).toLocaleDateString('en-CA') === todayIST
      )
      if (todayRec) {
        setCheckedInToday(true)
        setTodayRecord(todayRec)
      }

      // Get employee info
      const infoRes = await fetch('/api/employees/me')
      if (infoRes.ok) {
        const infoData = await infoRes.json()
        setEmployee(infoData.employee)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleCheckIn() {
    setCheckingIn(true)
    setMessage(null)
    try {
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: checkInStatus, action: 'checkin' }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Check-in failed' })
        if (res.status === 409) {
          setCheckedInToday(true)
          setTodayRecord(data.record)
        }
        return
      }

      setCheckedInToday(true)
      setTodayRecord(data.record)
      setMessage({ type: 'success', text: `✓ Checked in as ${checkInStatus === 'HALF_DAY' ? 'Half Day' : 'Present'} at ${timeStr}` })
      fetchData()
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setCheckingIn(false)
    }
  }

  async function handleCheckOut() {
    setCheckingIn(true)
    setMessage(null)
    try {
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout' }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Check-out failed' })
        return
      }

      setTodayRecord(data.record)
      setMessage({ type: 'success', text: `✓ Successfully checked out at ${timeStr}` })
      fetchData()
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setCheckingIn(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // Calculate monthly stats
  const totalDays = records.length
  const presentDays = records.filter(r => r.status === 'PRESENT').length
  const halfDays = records.filter(r => r.status === 'HALF_DAY').length
  const absentDays = records.filter(r => r.status === 'ABSENT').length
  const attendancePct = totalDays > 0 ? ((presentDays + halfDays * 0.5) / totalDays * 100).toFixed(1) : '0'

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PRESENT: 'badge badge-present',
      ABSENT: 'badge badge-absent',
      HALF_DAY: 'badge badge-halfday',
    }
    const label: Record<string, string> = { PRESENT: 'Present', ABSENT: 'Absent', HALF_DAY: 'Half Day' }
    return <span className={map[status]}>{label[status]}</span>
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--bg-border)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
          }}>
            <Building2 size={20} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Blue Tribe Intern Attendance Portal
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Employee Portal
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <div style={{ width: '1px', height: '24px', background: 'var(--bg-border)' }}></div>
          <button id="logout-btn" onClick={handleLogout} className="btn-secondary" style={{ fontSize: 13, padding: '7px 14px', border: 'none', background: 'transparent' }}>
            <LogOut size={16} style={{ color: '#ef4444' }} /> <span style={{ color: '#ef4444' }}>Logout</span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

        {/* Top Section: Profile & Check-in */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
          
          {/* Employee Profile Card */}
          <div className="card animate-fade-up" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 150, height: 150,
              background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0) 70%)',
              borderBottomLeftRadius: 150, pointerEvents: 'none'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(99,102,241,0.25)',
                color: 'white', fontSize: 24, fontWeight: 700
              }}>
                {employee?.salesOfficer?.charAt(0) || <User size={32} />}
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 4 }}>
                  {employee?.salesOfficer || 'Employee Name'}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600 }}>
                  {employee?.agencyName || 'Agency Name'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Key size={12} /> Employee Code
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {employee?.empCode || '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Briefcase size={12} /> Team Leader
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {employee?.tl || '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> City
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {employee?.city || '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CalendarDays size={12} /> Date of Joining
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {employee?.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Check-in Card */}
          <div className="card animate-fade-up" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', animationDelay: '0.1s' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{todayStr}</p>
            <p style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', marginBottom: 24, letterSpacing: -0.5 }}>{timeStr}</p>

            {checkedInToday ? (
              <div>
                <CheckCircle2 size={56} style={{ color: '#10b981', margin: '0 auto 16px', display: 'block', filter: 'drop-shadow(0 4px 12px rgba(16,185,129,0.2))' }} />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  You&apos;re checked in!
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface-2)', padding: '8px 16px', borderRadius: 20, marginBottom: 16 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Status:</span>
                  <strong style={{ color: todayRecord?.status === 'HALF_DAY' ? '#f59e0b' : '#10b981', fontSize: 14 }}>
                    {todayRecord?.status === 'HALF_DAY' ? 'Half Day' : 'Present'}
                  </strong>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>at</span>
                  <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                    {todayRecord?.checkInTime ? new Date(todayRecord.checkInTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </strong>
                </div>

                {!todayRecord?.checkOutTime ? (
                  <button
                    id="checkout-btn"
                    onClick={handleCheckOut}
                    className="btn-secondary"
                    disabled={checkingIn}
                    style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 12, fontWeight: 700, border: '1px solid var(--bg-border)' }}
                  >
                    {checkingIn ? <span className="spinner" /> : <LogOut size={20} />}
                    {checkingIn ? 'Checking Out…' : 'Check Out Now'}
                  </button>
                ) : (
                  <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '12px', borderRadius: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Checked out at</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {new Date(todayRecord.checkOutTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px', borderRadius: 20, marginBottom: 20 }}>
                  <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Status: Absent (Not Checked In)</span>
                </div>

                {/* Status toggle */}
                <div style={{ display: 'inline-flex', background: 'var(--bg-surface-2)', borderRadius: 12, padding: 6, gap: 6, marginBottom: 24 }}>
                  {(['PRESENT', 'HALF_DAY'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setCheckInStatus(s)}
                      style={{
                        padding: '10px 24px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        background: checkInStatus === s ? (s === 'PRESENT' ? '#10b981' : '#f59e0b') : 'transparent',
                        color: checkInStatus === s ? 'white' : 'var(--text-secondary)',
                        boxShadow: checkInStatus === s ? (s === 'PRESENT' ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(245,158,11,0.3)') : 'none',
                      }}
                      id={`status-${s.toLowerCase()}`}
                    >
                      {s === 'PRESENT' ? '✓ Present' : '½ Half Day'}
                    </button>
                  ))}
                </div>

                <button
                  id="checkin-btn"
                  onClick={handleCheckIn}
                  className="btn-primary"
                  disabled={checkingIn}
                  style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 12, fontWeight: 700 }}
                >
                  {checkingIn ? <span className="spinner" /> : <Clock size={20} />}
                  {checkingIn ? 'Checking In…' : 'Check In Now'}
                </button>
              </div>
            )}

            {message && (
              <div className="animate-fade-up" style={{
                marginTop: 20,
                padding: '12px 16px',
                background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                borderRadius: 10,
                color: message.type === 'success' ? '#10b981' : '#ef4444',
                fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
              }}>
                {message.type === 'error' && <AlertCircle size={16} />}
                {message.text}
              </div>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, paddingLeft: 4 }}>
          Monthly Overview
        </h3>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          <KpiCard title="Attendance Rate" value={`${attendancePct}%`} subtitle="This month" icon={<TrendingUp size={22} />} color="primary" />
          <KpiCard title="Present Days" value={presentDays} subtitle="Full days" icon={<CheckCircle2 size={22} />} color="success" />
          <KpiCard title="Half Days" value={halfDays} subtitle="Partial days" icon={<Clock size={22} />} color="warning" />
          <KpiCard title="Absent Days" value={absentDays} subtitle="Missed days" icon={<Calendar size={22} />} color="danger" />
        </div>

        {/* Attendance History Table */}
        <div className="card animate-fade-up" style={{ overflow: 'hidden', animationDelay: '0.2s' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Attendance History
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Detailed records for the current month
              </p>
            </div>
            <div style={{ background: 'var(--bg-surface-2)', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {records.length} Records Found
            </div>
          </div>
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Check-in Time</th>
                  <th>Check-out Time</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                      <Calendar size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>No Records Found</p>
                      <p style={{ fontSize: 13 }}>You haven&apos;t marked any attendance this month yet.</p>
                    </td>
                  </tr>
                ) : (
                  records.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(r.date).toLocaleDateString('en-IN', { weekday: 'long' })}</td>
                      <td>{statusBadge(r.status)}</td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 13 }}>
                        {r.checkInTime
                          ? new Date(r.checkInTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 13 }}>
                        {r.checkOutTime
                          ? new Date(r.checkOutTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
