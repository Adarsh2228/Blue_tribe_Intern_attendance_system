'use client'

import React from 'react'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const colorMap = {
  primary: { bg: 'rgba(99,102,241,0.12)', text: '#6366f1', icon: 'rgba(99,102,241,0.15)' },
  success: { bg: 'rgba(16,185,129,0.12)', text: '#10b981', icon: 'rgba(16,185,129,0.15)' },
  warning: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', icon: 'rgba(245,158,11,0.15)' },
  danger:  { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', icon: 'rgba(239,68,68,0.15)' },
}

export function KpiCard({ title, value, subtitle, icon, trend, color = 'primary' }: KpiCardProps) {
  const c = colorMap[color]
  return (
    <div className="kpi-card animate-fade-up" style={{ animationDelay: '0.05s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
            {title}
          </p>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</p>
          )}
        </div>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: c.icon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: c.text,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      {trend && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          borderRadius: 999,
          background: trend.value >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: trend.value >= 0 ? '#10b981' : '#ef4444',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  )
}
