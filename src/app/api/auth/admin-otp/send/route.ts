import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'

// POST /api/auth/admin-otp/send
// Generates a new OTP and sends it to the admin email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 })
    }

    if (!isAdminEmail(email)) {
      // Return generic error to avoid email enumeration
      return NextResponse.json({ error: 'If this email is authorized, you will receive an OTP shortly' }, { status: 200 })
    }

    // Generate a secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const otpHash = await bcrypt.hash(otp, 10)

    // Invalidate all previous OTPs for this email
    await prisma.adminOTP.updateMany({
      where: { email, used: false },
      data: { used: true },
    })

    // Store new OTP (valid for 10 minutes)
    await prisma.adminOTP.create({
      data: {
        email,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    // Send OTP via Resend
    const sent = await sendOTPEmail(email, otp)

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send OTP email. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email address',
    })
  } catch (error) {
    console.error('OTP send error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
