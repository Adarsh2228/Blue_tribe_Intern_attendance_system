import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function Home() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')?.value
  const employeeToken = cookieStore.get('employee_token')?.value

  if (adminToken) {
    const payload = verifyToken(adminToken)
    if (payload?.type === 'admin') redirect('/admin/dashboard')
  }

  if (employeeToken) {
    const payload = verifyToken(employeeToken)
    if (payload?.type === 'employee') redirect('/employee/dashboard')
  }

  redirect('/login')
}
