import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { AttendanceStatus } from '@prisma/client'

interface AttendanceWithEmployee {
  id: string
  empCode: string
  date: Date
  status: AttendanceStatus
  checkInTime: Date | null
  checkOutTime: Date | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') ?? 'day'
    const dateParam = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
    const monthParam = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))
    const yearParam = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

    let startDate: Date
    let endDate: Date
    let filename: string

    if (type === 'day') {
      startDate = new Date(dateParam)
      endDate = new Date(dateParam)
      filename = `attendance_day_${dateParam}.xlsx`
    } else if (type === 'week') {
      endDate = new Date(dateParam)
      startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 6)
      filename = `attendance_week_${dateParam}.xlsx`
    } else {
      startDate = new Date(yearParam, monthParam - 1, 1)
      endDate = new Date(yearParam, monthParam, 0)
      filename = `attendance_month_${yearParam}_${String(monthParam).padStart(2, '0')}.xlsx`
    }

    // Fetch ALL employees
    const employees = await prisma.employee.findMany({
      orderBy: { empCode: 'asc' },
    })

    // Fetch logs for the date range
    const nextDayAfterEnd = new Date(endDate)
    nextDayAfterEnd.setDate(nextDayAfterEnd.getDate() + 1)
    
    const logs = await prisma.attendanceLog.findMany({
      where: { date: { gte: startDate, lt: nextDayAfterEnd } },
    })

    // Create a map for quick log lookup: "empCode_YYYY-MM-DD" -> log
    const logMap = new Map<string, typeof logs[0]>()
    for (const log of logs) {
      const dateKey = log.date.toISOString().split('T')[0]
      logMap.set(`${log.empCode}_${dateKey}`, log)
    }

    // Generate flat records
    const exportRecords = []
    
    // Loop through each date in the range
    const curDate = new Date(startDate)
    while (curDate <= endDate) {
      const dateStr = curDate.toISOString().split('T')[0]
      const currentLoopDate = new Date(curDate) // clone for the record
      
      for (const emp of employees) {
        const log = logMap.get(`${emp.empCode}_${dateStr}`)
        exportRecords.push({
          date: currentLoopDate,
          empCode: emp.empCode,
          salesOfficer: emp.salesOfficer,
          tl: emp.tl,
          city: emp.city,
          agencyName: emp.agencyName,
          dateOfJoining: emp.dateOfJoining,
          status: log?.status || 'ABSENT',
          checkInTime: log?.checkInTime || null,
          checkOutTime: log?.checkOutTime || null,
        })
      }
      curDate.setDate(curDate.getDate() + 1)
    }

    // Since we are changing the export logic to a single unified format, we will use a new generator function
    const { generateUnifiedReport } = await import('@/lib/export')
    const buffer = generateUnifiedReport(exportRecords as any)

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(buffer)

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(uint8Array.length),
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
