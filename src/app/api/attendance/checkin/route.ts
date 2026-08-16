import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { AttendanceStatus } from '@prisma/client'

// POST /api/attendance/checkin
// Marks an employee as present for today (IST)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('employee_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const status: AttendanceStatus = body.status ?? 'PRESENT'
    const action: 'checkin' | 'checkout' = body.action ?? 'checkin'

    // Get current date in IST
    const now = new Date()
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const todayIST = new Date(Date.UTC(
      istDate.getFullYear(),
      istDate.getMonth(),
      istDate.getDate()
    ))

    // Check if already checked in today
    const existing = await prisma.attendanceLog.findUnique({
      where: {
        empCode_date: {
          empCode: payload.empCode,
          date: todayIST,
        },
      },
    })

    if (existing) {
      if (action === 'checkout') {
        if (existing.checkOutTime) {
          return NextResponse.json({ error: 'Already checked out for today', record: existing }, { status: 409 })
        }
        const updatedRecord = await prisma.attendanceLog.update({
          where: { id: existing.id },
          data: { checkOutTime: now },
        })
        return NextResponse.json({ success: true, record: updatedRecord })
      }
      return NextResponse.json({
        error: 'Already checked in for today',
        record: existing,
      }, { status: 409 })
    }

    if (action === 'checkout') {
      return NextResponse.json({ error: 'Cannot check out without checking in first' }, { status: 400 })
    }

    const record = await prisma.attendanceLog.create({
      data: {
        empCode: payload.empCode,
        date: todayIST,
        status,
        checkInTime: now,
      },
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}
