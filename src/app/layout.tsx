import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KLaw Attendance — Employee Attendance Management System',
  description:
    'A modern, full-featured attendance management system for tracking employee check-ins, viewing analytics, and exporting reports.',
  keywords: ['attendance', 'employee management', 'HR system', 'check-in'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
