import * as XLSX from 'xlsx'
import { AttendanceStatus } from '@prisma/client'

interface AttendanceRecord {
  empCode: string
  salesOfficer: string
  tl: string
  city: string
  agencyName: string
  date: Date
  status: AttendanceStatus
  checkInTime: Date | null
  checkOutTime: Date | null
  dateOfJoining: Date | null
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

function formatTime(date: Date | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}

function statusLabel(status: AttendanceStatus): string {
  const map: Record<AttendanceStatus, string> = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    HALF_DAY: 'Half Day',
  }
  return map[status]
}

export function generateUnifiedReport(records: AttendanceRecord[]): Buffer {
  const rows = records.map((r) => ({
    'Date': formatDate(r.date),
    'Emp Code': r.empCode,
    'Sales Officer': r.salesOfficer,
    'TL': r.tl,
    'City': r.city,
    'Agency Name': r.agencyName,
    'Date of Joining': r.dateOfJoining ? formatDate(r.dateOfJoining) : '—',
    'Status': statusLabel(r.status),
    'Check-in Time': formatTime(r.checkInTime),
    'Check-out Time': formatTime(r.checkOutTime),
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report')

  // Style header row widths
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 12 }, // Emp Code
    { wch: 20 }, // Sales Officer
    { wch: 20 }, // TL
    { wch: 15 }, // City
    { wch: 20 }, // Agency Name
    { wch: 15 }, // DoJ
    { wch: 12 }, // Status
    { wch: 14 }, // Check-in
    { wch: 14 }, // Check-out
  ]

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}
