import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

// POST /api/auth/employee/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empCode, salesOfficer, tl, city, dateOfJoining, agencyName, password } = body

    // Validate required fields
    if (!empCode || !salesOfficer || !tl || !city || !dateOfJoining || !agencyName || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if employee already exists
    const existing = await prisma.employee.findUnique({ where: { empCode } })
    if (existing) {
      return NextResponse.json({ error: 'Employee code already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const employee = await prisma.employee.create({
      data: {
        empCode,
        salesOfficer,
        tl,
        city,
        dateOfJoining: new Date(dateOfJoining),
        agencyName,
        passwordHash,
      },
    })

    const token = signToken({ type: 'employee', empCode: employee.empCode, salesOfficer: employee.salesOfficer })

    const response = NextResponse.json({
      success: true,
      employee: {
        empCode: employee.empCode,
        salesOfficer: employee.salesOfficer,
        tl: employee.tl,
        city: employee.city,
      },
    })

    response.cookies.set('employee_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
