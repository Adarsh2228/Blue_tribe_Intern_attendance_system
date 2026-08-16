import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employees — Admin: get all employees with today's attendance status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const city = searchParams.get('city') ?? ''
    const tl = searchParams.get('tl') ?? ''
    const agency = searchParams.get('agency') ?? ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { empCode: { contains: search, mode: 'insensitive' } },
        { salesOfficer: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (city) where.city = { equals: city, mode: 'insensitive' }
    if (tl) where.tl = { equals: tl, mode: 'insensitive' }
    if (agency) where.agencyName = { equals: agency, mode: 'insensitive' }

    const now = new Date()
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const todayIST = new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), istDate.getDate()))
    const tomorrowIST = new Date(todayIST)
    tomorrowIST.setDate(tomorrowIST.getDate() + 1)

    const employees = await prisma.employee.findMany({
      where,
      select: {
        id: true,
        empCode: true,
        salesOfficer: true,
        tl: true,
        city: true,
        dateOfJoining: true,
        agencyName: true,
        createdAt: true,
        attendance: {
          where: {
            date: {
              gte: todayIST,
              lt: tomorrowIST,
            },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ employees })
  } catch (error) {
    console.error('Employees fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}
