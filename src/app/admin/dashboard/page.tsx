'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, CheckCircle2, XCircle, Clock, TrendingUp, Download,
  Search, Filter, LogOut, Building2, BarChart3, RefreshCw,
  Calendar, ChevronDown,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { KpiCard } from '@/components/ui/KpiCard'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stats {
  totalEmployees: number
  todayPresent: number
  todayHalfDay: number
  todayAbsent: number
  dailyTrend: { date: string; present: number; absent: number; halfDay: number }[]
  cityBreakdown: { city: string; count: number }[]
  tlBreakdown: { tl: string; count: number }[]
  agencyBreakdown: { agency: string; count: number }[]
}

interface Employee {
  id: string
  empCode: string
  salesOfficer: string
  tl: string
  city: string
  agencyName: string
  dateOfJoining: string
  attendance: { status: string }[]
}

// ─── Chart colors ─────────────────────────────────────────────────────────────
const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6']

// ─── Sidebar ──────────────────────────────────────────────────────────────────
type ActiveTab = 'overview' | 'employees' | 'charts' | 'export'

function Sidebar({ active, setActive, onLogout }: { active: ActiveTab; setActive: (t: ActiveTab) => void; onLogout: () => void }) {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={18} /> },
    { id: 'employees', label: 'Employees', icon: <Users size={18} /> },
    { id: 'charts', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'export', label: 'Export', icon: <Download size={18} /> },
  ]

  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--bg-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Blue Tribe Intern Attendance Portal</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => setActive(item.id)}
            className={`sidebar-nav-item ${active === item.id ? 'active' : ''}`}
            style={{ width: '100%', border: 'none', textAlign: 'left' }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--bg-border)' }}>
        <button id="admin-logout-btn" onClick={onLogout} className="sidebar-nav-item" style={{ width: '100%', border: 'none', color: '#ef4444' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  )
}

// ─── Employee Table ───────────────────────────────────────────────────────────
function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [tlFilter, setTlFilter] = useState('')

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (cityFilter) params.set('city', cityFilter)
      if (tlFilter) params.set('tl', tlFilter)

      const res = await fetch(`/api/employees?${params}`)
      const data = await res.json()
      setEmployees(data.employees || [])
    } finally {
      setLoading(false)
    }
  }, [search, cityFilter, tlFilter])

  useEffect(() => {
    const t = setTimeout(fetchEmployees, 300)
    return () => clearTimeout(t)
  }, [fetchEmployees])

  const cities = [...new Set(employees.map(e => e.city))].sort()
  const tls = [...new Set(employees.map(e => e.tl))].sort()

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="employee-search"
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by name or emp code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            id="city-filter"
            className="input"
            style={{ paddingRight: 32, minWidth: 140, appearance: 'none', cursor: 'pointer' }}
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            id="tl-filter"
            className="input"
            style={{ paddingRight: 32, minWidth: 140, appearance: 'none', cursor: 'pointer' }}
            value={tlFilter}
            onChange={e => setTlFilter(e.target.value)}
          >
            <option value="">All TLs</option>
            {tls.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
        <button onClick={fetchEmployees} className="btn-secondary" id="refresh-employees-btn">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Emp Code</th>
              <th>Sales Officer</th>
              <th>TL</th>
              <th>City</th>
              <th>Agency</th>
              <th>Date of Joining</th>
              <th>Today&apos;s Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                  ))}
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No employees found
                </td>
              </tr>
            ) : employees.map(emp => {
              const todayStatus = emp.attendance?.[0]?.status
              return (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'monospace' }}>{emp.empCode}</td>
                  <td style={{ fontWeight: 500 }}>{emp.salesOfficer}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{emp.tl}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{emp.city}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{emp.agencyName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(emp.dateOfJoining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    {todayStatus ? (
                      <span className={`badge ${todayStatus === 'PRESENT' ? 'badge-present' : todayStatus === 'ABSENT' ? 'badge-absent' : 'badge-halfday'}`}>
                        {todayStatus === 'PRESENT' ? 'Present' : todayStatus === 'HALF_DAY' ? 'Half Day' : 'Absent'}
                      </span>
                    ) : (
                      <span className="badge badge-absent">Absent</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'right' }}>
        {employees.length} employee{employees.length !== 1 ? 's' : ''} found
      </p>
    </div>
  )
}

// ─── Export Panel ─────────────────────────────────────────────────────────────
function ExportPanel() {
  const [dayDate, setDayDate] = useState(new Date().toISOString().split('T')[0])
  const [weekDate, setWeekDate] = useState(new Date().toISOString().split('T')[0])
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1)
  const [exportYear, setExportYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState<string | null>(null)

  async function download(url: string, id: string) {
    setLoading(id)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      const cd = res.headers.get('Content-Disposition') ?? ''
      const match = cd.match(/filename="([^"]+)"/)
      a.download = match?.[1] ?? 'attendance.xlsx'
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      alert('Export failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const years = [2023, 2024, 2025, 2026]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
      {/* Day report */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Day-wise Report</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>All attendance for a single day</p>
          </div>
        </div>
        <label className="label" htmlFor="export-day-date">Select Date</label>
        <input id="export-day-date" className="input" type="date" value={dayDate} onChange={e => setDayDate(e.target.value)} style={{ marginBottom: 16 }} />
        <button
          id="export-day-btn"
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={!!loading}
          onClick={() => download(`/api/export?type=day&date=${dayDate}`, 'day')}
        >
          {loading === 'day' ? <span className="spinner" /> : <Download size={16} />}
          Download Day Report
        </button>
      </div>

      {/* Weekly report */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={22} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Weekly Report</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>7-day summary ending on selected date</p>
          </div>
        </div>
        <label className="label" htmlFor="export-week-date">Week Ending Date</label>
        <input id="export-week-date" className="input" type="date" value={weekDate} onChange={e => setWeekDate(e.target.value)} style={{ marginBottom: 16 }} />
        <button
          id="export-week-btn"
          className="btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          disabled={!!loading}
          onClick={() => download(`/api/export?type=week&date=${weekDate}`, 'week')}
        >
          {loading === 'week' ? <span className="spinner" /> : <Download size={16} />}
          Download Weekly Report
        </button>
      </div>

      {/* Monthly report */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} style={{ color: '#06b6d4' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Report</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Full month attendance matrix</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label className="label" htmlFor="export-month">Month</label>
            <select id="export-month" className="input" value={exportMonth} onChange={e => setExportMonth(Number(e.target.value))} style={{ appearance: 'none' }}>
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="export-year">Year</label>
            <select id="export-year" className="input" value={exportYear} onChange={e => setExportYear(Number(e.target.value))} style={{ appearance: 'none' }}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button
          id="export-month-btn"
          className="btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}
          disabled={!!loading}
          onClick={() => download(`/api/export?type=month&month=${exportMonth}&year=${exportYear}`, 'month')}
        >
          {loading === 'month' ? <span className="spinner" /> : <Download size={16} />}
          Download Monthly Report
        </button>
      </div>
    </div>
  )
}

// ─── Charts Panel ─────────────────────────────────────────────────────────────
function ChartsPanel({ stats }: { stats: Stats | null }) {
  if (!stats) return null

  const trendData = stats.dailyTrend.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    Present: d.present,
    Absent: d.absent,
    'Half Day': d.halfDay,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Daily trend */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
          14-Day Attendance Trend
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 10 }} />
            <Legend />
            <Line type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Half Day" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {/* City-wise Pie */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            City-wise Attendance (This Month)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={stats.cityBreakdown} dataKey="count" nameKey="city" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {stats.cityBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TL-wise Bar */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            Team-wise (TL) Summary
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.tlBreakdown} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis type="category" dataKey="tl" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={80} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 10 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Present Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agency-wise Bar */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            Agency-wise Attendance
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.agencyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="agency" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 10 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Present Days">
                {stats.agencyBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      setStats(data)
    } finally {
      setLoadingStats(false)
    }
  }, [router])

  useEffect(() => { fetchStats() }, [fetchStats])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const todayStr = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar active={activeTab} setActive={setActiveTab} onLogout={handleLogout} />

      {/* Main content */}
      <div style={{ marginLeft: 256, flex: 1, minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--bg-border)',
          padding: '0 28px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'employees' && 'Employee Management'}
              {activeTab === 'charts' && 'Analytics & Charts'}
              {activeTab === 'export' && 'Export Reports'}
            </h1>
            <p suppressHydrationWarning style={{ fontSize: 12, color: 'var(--text-muted)' }}>{todayStr}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button id="refresh-stats-btn" onClick={fetchStats} className="btn-secondary" style={{ padding: '7px 12px', fontSize: 13 }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '28px' }}>
          {/* KPI Cards (always visible) */}
          {(activeTab === 'overview' || activeTab === 'employees') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
              {loadingStats ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="kpi-card">
                    <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '50%' }} />
                  </div>
                ))
              ) : stats && (
                <>
                  <KpiCard title="Total Employees" value={stats.totalEmployees} icon={<Users size={22} />} color="primary" />
                  <KpiCard title="Present Today" value={stats.todayPresent} subtitle="Full day" icon={<CheckCircle2 size={22} />} color="success" />
                  <KpiCard title="Half Day" value={stats.todayHalfDay} icon={<Clock size={22} />} color="warning" />
                  <KpiCard title="Absent Today" value={stats.todayAbsent} icon={<XCircle size={22} />} color="danger" />
                </>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Quick trend preview */}
              {stats && (
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Attendance Trend</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Last 14 days</p>
                    </div>
                    <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setActiveTab('charts')} id="view-all-charts-btn">
                      View All Charts →
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={stats.dailyTrend.map(d => ({
                      date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                      Present: d.present,
                      Absent: d.absent,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 10 }} />
                      <Legend />
                      <Line type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Quick city breakdown */}
              {stats && stats.cityBreakdown.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>City Breakdown (This Month)</h3>
                    {stats.cityBreakdown.slice(0, 6).map(c => (
                      <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.city}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{c.count}</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--bg-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, (c.count / (stats.totalEmployees || 1)) * 100)}%`,
                              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                              borderRadius: 3,
                              transition: 'width 0.8s ease',
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Agency Breakdown</h3>
                    {stats.agencyBreakdown.slice(0, 6).map((a, i) => (
                      <div key={a.agency} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontSize: 13, flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>{a.agency}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{a.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'employees' && <EmployeeTable />}
          {activeTab === 'charts' && <ChartsPanel stats={stats} />}
          {activeTab === 'export' && <ExportPanel />}
        </main>
      </div>
    </div>
  )
}
