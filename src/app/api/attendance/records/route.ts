import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/attendance/records
// Params: empCode (optional, admin only), month, year
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empCodeParam = searchParams.get('empCode')
    const monthParam = searchParams.get('month')
    const yearParam = searchParams.get('year')

    // Check auth - either employee (own records) or admin (all records)
    const employeeToken = request.cookies.get('employee_token')?.value
    const adminToken = request.cookies.get('admin_token')?.value

    let isAdmin = false
    let requestingEmpCode: string | null = null

    if (adminToken) {
      const payload = verifyToken(adminToken)
      if (payload?.type === 'admin') isAdmin = true
    }

    if (employeeToken && !isAdmin) {
      const payload = verifyToken(employeeToken)
      if (payload?.type === 'employee') {
        requestingEmpCode = payload.empCode
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!isAdmin && !requestingEmpCode) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1
    const year = yearParam ? parseInt(yearParam) : now.getFullYear()

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const where: Record<string, unknown> = {
      date: { gte: startDate, lte: endDate },
    }

    if (!isAdmin && requestingEmpCode) {
      where.empCode = requestingEmpCode
    } else if (isAdmin && empCodeParam) {
      where.empCode = empCodeParam
    }

    const records = await prisma.attendanceLog.findMany({
      where,
      include: {
        employee: {
          select: { salesOfficer: true, tl: true, city: true, agencyName: true },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Records fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
  }
}
