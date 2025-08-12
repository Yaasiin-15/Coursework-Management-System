'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FileText, 
  Plus, 
  Settings, 
  Users, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null)
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) return null

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['student', 'teacher', 'admin']
    },
    {
      name: 'Assignments',
      href: '/assignments',
      icon: FileText,
      roles: ['student', 'teacher', 'admin']
    },
    {
      name: 'Create Assignment',
      href: '/assignments/create',
      icon: Plus,
      roles: ['teacher', 'admin']
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['teacher', 'admin']
    },
    {
      name: 'Classes',
      href: '/classes',
      icon: Users,
      roles: ['teacher', 'admin']
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: BookOpen,
      roles: ['student', 'teacher', 'admin']
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Settings,
      roles: ['admin']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['student', 'teacher', 'admin']
    },
    {
      name: 'Test Features',
      href: '/test-features',
      icon: Settings,
      roles: ['student', 'teacher', 'admin']
    }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  )

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">CMS</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <ul className="space-y-2 px-3">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}