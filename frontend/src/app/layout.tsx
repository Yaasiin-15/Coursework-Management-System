import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppProvider'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Coursework Management System',
  description: 'A comprehensive platform for managing coursework and assignments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <NotificationProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </NotificationProvider>
        </AppProvider>
      </body>
    </html>
  )
}