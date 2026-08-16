import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

// POST /api/auth/employee/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empCode, password } = body

    if (!empCode || !password) {
      return NextResponse.json({ error: 'Employee code and password are required' }, { status: 400 })
    }

    const employee = await prisma.employee.findUnique({ where: { empCode } })

    if (!employee) {
      return NextResponse.json({ error: 'Invalid employee code or password' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, employee.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid employee code or password' }, { status: 401 })
    }

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
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
