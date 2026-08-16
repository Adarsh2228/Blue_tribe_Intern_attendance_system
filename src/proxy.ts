import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin route protection
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  // Employee route protection
  if (pathname.startsWith('/employee') && !pathname.startsWith('/employee/login')) {
    const token = request.cookies.get('employee_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const payload = verifyToken(token)
    if (!payload || payload.type !== 'employee') {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('employee_token')
      return response
    }
  }

  // API route protection for admin APIs
  if (pathname.startsWith('/api/admin') ||
      (pathname.startsWith('/api/employees') && pathname !== '/api/employees/me' && request.method !== 'POST') ||
      pathname.startsWith('/api/export')) {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // API route protection for employee APIs
  if (pathname.startsWith('/api/attendance/checkin')) {
    const token = request.cookies.get('employee_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = verifyToken(token)
    if (!payload || payload.type !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/employee/:path*',
    '/api/admin/:path*',
    '/api/employees/:path*',
    '/api/attendance/checkin/:path*',
    '/api/export/:path*',
  ],
}
