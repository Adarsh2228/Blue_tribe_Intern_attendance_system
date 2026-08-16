import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/employees/me — Get current employee's profile
export async function GET(request: NextRequest) {
  const token = request.cookies.get('employee_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload || payload.type !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const employee = await prisma.employee.findUnique({
    where: { empCode: payload.empCode },
    select: {
      empCode: true,
      salesOfficer: true,
      tl: true,
      city: true,
      agencyName: true,
      dateOfJoining: true,
    },
  })

  if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })

  return NextResponse.json({ employee })
}
