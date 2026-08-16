import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export interface EmployeePayload {
  type: 'employee'
  empCode: string
  salesOfficer: string
}

export interface AdminPayload {
  type: 'admin'
  email: string
}

export type JWTPayload = EmployeePayload | AdminPayload

export function signToken(payload: JWTPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getEmployeeSession(): Promise<EmployeePayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('employee_token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.type !== 'employee') return null
  return payload
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.type !== 'admin') return null
  return payload
}

export function setEmployeeCookie(token: string): void {
  // Used in API routes via response headers
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}
