import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats — Dashboard KPI stats
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const todayIST = new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), istDate.getDate()))
    const tomorrowIST = new Date(todayIST)
    tomorrowIST.setDate(tomorrowIST.getDate() + 1)

    // Total employees
    const totalEmployees = await prisma.employee.count()

    // Today's attendance
    const todayAttendance = await prisma.attendanceLog.findMany({
      where: {
        date: { gte: todayIST, lt: tomorrowIST },
      },
    })

    const todayPresent = todayAttendance.filter(a => a.status === 'PRESENT').length
    const todayHalfDay = todayAttendance.filter(a => a.status === 'HALF_DAY').length
    const todayAbsent = totalEmployees - todayAttendance.length

    // This month
    const monthStart = new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), 1))
    const monthEnd = new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth() + 1, 1))

    const monthStats = await prisma.attendanceLog.groupBy({
      by: ['status'],
      where: { date: { gte: monthStart, lt: monthEnd } },
      _count: true,
    })

    // Day-wise trend (last 14 days)
    const twoWeeksAgo = new Date(todayIST)
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13)

    const dailyRecords = await prisma.attendanceLog.findMany({
      where: { date: { gte: twoWeeksAgo, lte: tomorrowIST } },
      select: { date: true, status: true },
      orderBy: { date: 'asc' },
    })

    // Group daily records by date
    const dailyMap = new Map<string, { present: number; absent: number; halfDay: number }>()
    for (const r of dailyRecords) {
      const key = r.date.toISOString().split('T')[0]
      if (!dailyMap.has(key)) dailyMap.set(key, { present: 0, absent: 0, halfDay: 0 })
      const d = dailyMap.get(key)!
      if (r.status === 'PRESENT') d.present++
      else if (r.status === 'HALF_DAY') d.halfDay++
      else d.absent++
    }

    const dailyTrend = Array.from(dailyMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }))

    // City-wise breakdown (current month)
    const cityData = await prisma.attendanceLog.findMany({
      where: { date: { gte: monthStart, lt: monthEnd }, status: 'PRESENT' },
      include: { employee: { select: { city: true } } },
    })

    const cityMap = new Map<string, number>()
    for (const r of cityData) {
      const city = r.employee.city
      cityMap.set(city, (cityMap.get(city) ?? 0) + 1)
    }
    const cityBreakdown = Array.from(cityMap.entries()).map(([city, count]) => ({ city, count }))

    // TL-wise breakdown (current month)
    const tlData = await prisma.attendanceLog.findMany({
      where: { date: { gte: monthStart, lt: monthEnd }, status: 'PRESENT' },
      include: { employee: { select: { tl: true } } },
    })

    const tlMap = new Map<string, number>()
    for (const r of tlData) {
      const tl = r.employee.tl
      tlMap.set(tl, (tlMap.get(tl) ?? 0) + 1)
    }
    const tlBreakdown = Array.from(tlMap.entries()).map(([tl, count]) => ({ tl, count }))

    // Agency-wise breakdown (current month)
    const agencyData = await prisma.attendanceLog.findMany({
      where: { date: { gte: monthStart, lt: monthEnd }, status: 'PRESENT' },
      include: { employee: { select: { agencyName: true } } },
    })

    const agencyMap = new Map<string, number>()
    for (const r of agencyData) {
      const agency = r.employee.agencyName
      agencyMap.set(agency, (agencyMap.get(agency) ?? 0) + 1)
    }
    const agencyBreakdown = Array.from(agencyMap.entries()).map(([agency, count]) => ({ agency, count }))

    return NextResponse.json({
      totalEmployees,
      todayPresent,
      todayHalfDay,
      todayAbsent,
      monthStats,
      dailyTrend,
      cityBreakdown,
      tlBreakdown,
      agencyBreakdown,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
