'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { User, Lock, Bell, Palette, Save } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface UserData {
    id: string
    name: string
    email: string
    role: string
}

export default function Settings() {
    const [user, setUser] = useState<UserData | null>(null)
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { theme, setTheme } = useTheme()
    const { language, setLanguage, t } = useLanguage()

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        assignmentReminders: true,
        gradeNotifications: true,
        systemUpdates: false
    })

    // Appearance settings - now using context values
    const [appearance, setAppearance] = useState({
        theme: theme,
        language: language
    })

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            setProfileData({
                name: parsedUser.name,
                email: parsedUser.email,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
        }
    }, [])

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const token = localStorage.getItem('token')
            const updateData: any = {
                name: profileData.name,
                email: profileData.email
            }

            // Only include password if user wants to change it
            if (profileData.newPassword) {
                if (profileData.newPassword !== profileData.confirmPassword) {
                    setMessage('New passwords do not match')
                    setLoading(false)
                    return
                }
                updateData.currentPassword = profileData.currentPassword
                updateData.newPassword = profileData.newPassword
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            })

            if (response.ok) {
                const updatedUser = await response.json()
                localStorage.setItem('user', JSON.stringify(updatedUser.user))
                setUser(updatedUser.user)
                setMessage('Profile updated successfully')
                setProfileData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }))
            } else {
                const error = await response.json()
                setMessage(error.message || 'Failed to update profile')
            }
        } catch (error) {
            setMessage('An error occurred while updating profile')
        } finally {
            setLoading(false)
        }
    }

    const handleNotificationUpdate = async () => {
        setLoading(true)
        setMessage('')

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/user/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(notifications)
            })

            if (response.ok) {
                setMessage('Notification preferences updated successfully')
            } else {
                setMessage('Failed to update notification preferences')
            }
        } catch (error) {
            setMessage('An error occurred while updating preferences')
        } finally {
            setLoading(false)
        }
    }

    const handleAppearanceUpdate = async () => {
        setLoading(true)
        setMessage('')

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appearance)
            })

            if (response.ok) {
                // Update contexts directly for immediate effect
                setTheme(appearance.theme as 'light' | 'dark' | 'system')
                setLanguage(appearance.language as 'en' | 'so' | 'es' | 'fr')

                setMessage(t('message.preferencesUpdated'))
            } else {
                setMessage('Failed to update appearance settings')
            }
        } catch (error) {
            setMessage('An error occurred while updating appearance settings')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'appearance', name: 'Appearance', icon: Palette }
    ]

    if (!user) return null

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-300">Manage your account settings and preferences</p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-lg ${message.includes('successfully')
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {message}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    {/* Tabs */}
                    <div className="border-b dark:border-gray-700">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.name}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Profile Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Change Password
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={profileData.currentPassword}
                                                onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={profileData.newPassword}
                                                onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={profileData.confirmPassword}
                                                onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Notification Preferences
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(notifications).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </label>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleNotificationUpdate}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Appearance Settings
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Theme
                                        </label>
                                        <select
                                            value={appearance.theme}
                                            onChange={(e) => setAppearance({ ...appearance, theme: e.target.value as 'light' | 'dark' | 'system' })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="system">System</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Language
                                        </label>
                                        <select
                                            value={appearance.language}
                                            onChange={(e) => setAppearance({ ...appearance, language: e.target.value as 'en' | 'so' | 'es' | 'fr' })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="en">English</option>
                                            <option value="so">Somali (Soomaali)</option>
                                            <option value="es">Spanish (Español)</option>
                                            <option value="fr">French (Français)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAppearanceUpdate}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Security Settings
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Account Role</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                                            {user.role}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                            Add an extra layer of security to your account
                                        </p>
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}