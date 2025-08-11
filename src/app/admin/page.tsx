'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface AdminUser {
    _id: string
    name: string
    email: string
    role: string
    createdAt: string
}

interface Stats {
    totalUsers: number
    totalTeachers: number
    totalStudents: number
    totalAssignments: number
    totalSubmissions: number
}

export default function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== 'admin') {
            router.push('/dashboard')
            return
        }

        setUser(parsedUser)
        fetchAdminData(token)
    }, [router])

    const fetchAdminData = async (token: string) => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                fetch('/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch('/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
            ])

            if (usersRes.ok) {
                const usersData = await usersRes.json()
                setUsers(usersData.users)
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json()
                setStats(statsData.stats)
            }
        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return

        const token = localStorage.getItem('token')
        try {
            const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            })

            if (response.ok) {
                setUsers(users.filter(u => u._id !== selectedUser._id))
                setShowDeleteModal(false)
                setSelectedUser(null)
            }
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            })

            if (response.ok) {
                setUsers(users.map(u =>
                    u._id === userId ? { ...u, role: newRole } : u
                ))
            }
        } catch (error) {
            console.error('Error updating user role:', error)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-2 text-gray-600">
                            Manage users and view system statistics.
                        </p>
                    </div>

                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold">👥</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold">👨‍🏫</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Teachers</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalTeachers}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold">👨‍🎓</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Students</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalStudents}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold">📚</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Assignments</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalAssignments}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold">📝</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Submissions</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalSubmissions}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Manage user accounts and roles.
                            </p>
                        </div>

                        {loading ? (
                            <div className="p-6 text-center">Loading...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((adminUser) => (
                                            <tr key={adminUser._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{adminUser.name}</div>
                                                        <div className="text-sm text-gray-500">{adminUser.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={adminUser.role}
                                                        onChange={(e) => handleRoleChange(adminUser._id, e.target.value)}
                                                        className="text-sm border-gray-300 rounded-md"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="teacher">Teacher</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(adminUser.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(adminUser)
                                                            setShowDeleteModal(true)
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete {selectedUser.name}? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setSelectedUser(null)
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}