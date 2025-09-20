'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, LogOut, Menu } from 'lucide-react'
import NotificationPanel from './NotificationPanel'
import ThemeToggle from './ThemeToggle'
import { useSidebar } from '@/contexts/SidebarContext'
import { useTranslations } from '@/hooks/useTranslations'

interface User {
    id: string
    name: string
    email: string
    role: string
}

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const { isCollapsed, setIsCollapsed } = useSidebar()
    const router = useRouter()
    const { t } = useTranslations()

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    if (!user) return null

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 h-16 transition-colors">
            <div className="h-full px-4 sm:px-6">
                <div className="flex justify-between items-center h-full">
                    {/* Mobile menu button and Search Bar */}
                    <div className="flex items-center flex-1 space-x-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        
                        {/* Search Bar */}
                        <div className="flex-1 max-w-lg">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Notifications */}
                        <NotificationPanel />

                        {/* User Info */}
                        <div className="hidden sm:flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Mobile User Avatar */}
                        <div className="sm:hidden w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}