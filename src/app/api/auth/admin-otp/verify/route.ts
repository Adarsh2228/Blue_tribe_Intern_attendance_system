import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, isAdminEmail } from '@/lib/auth'

// POST /api/auth/admin-otp/verify
// Verifies the OTP and issues an admin session cookie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Find latest valid OTP for this email
    const otpRecord = await prisma.adminOTP.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: 'OTP expired or not found. Please request a new one.' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash)

    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect OTP' }, { status: 401 })
    }

    // Mark OTP as used (single-use)
    await prisma.adminOTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    // Issue admin JWT session
    const token = signToken({ type: 'admin', email }, '8h')

    const response = NextResponse.json({ success: true })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('OTP verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
