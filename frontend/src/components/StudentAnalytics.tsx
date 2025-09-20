'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { get } from '@/lib/api'

interface AnalyticsData {
  totalStudents: number
  totalClasses: number
  unassignedStudents: number
  classDistribution: Array<{
    className: string
    studentCount: number
    teacherName: string
  }>
  recentRegistrations: Array<{
    name: string
    email: string
    registeredAt: string
    className?: string
  }>
}

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const result = await get('/api/analytics/students')
      if (result.success) {
        setAnalytics(result.data)
      } else {
        setError(result.error || 'Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (!analytics) return null

  const maxStudents = Math.max(...analytics.classDistribution.map(c => c.studentCount))

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unassigned</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.unassignedStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg per Class</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalClasses > 0 ? (analytics.totalStudents / analytics.totalClasses).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Distribution Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Student Distribution by Class</h3>
        <div className="space-y-3">
          {analytics.classDistribution.map((classData, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
              <div className="sm:w-32 text-sm font-medium text-gray-700 truncate">
                {classData.className}
              </div>
              <div className="flex-1 sm:mx-4">
                <div className="bg-gray-200 rounded-full h-3 sm:h-4">
                  <div
                    className="bg-blue-500 h-3 sm:h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${maxStudents > 0 ? (classData.studentCount / maxStudents) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between sm:block">
                <div className="text-sm text-gray-600">
                  {classData.studentCount} students
                </div>
                <div className="text-sm text-gray-500 truncate sm:ml-2">
                  {classData.teacherName}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Student Registrations</h3>
        {analytics.recentRegistrations.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No recent registrations</p>
        ) : (
          <div className="space-y-3">
            {analytics.recentRegistrations.map((student, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded space-y-2 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">{student.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{student.email}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-500">
                    {new Date(student.registeredAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-blue-600">
                    {student.className || 'Unassigned'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}