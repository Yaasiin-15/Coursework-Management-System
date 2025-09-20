'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import StudentGradeView from '@/components/StudentGradeView'
import { GradeViewErrorBoundary } from '@/components/ErrorBoundary'
import AuthCheck from '@/components/AuthCheck'
import { Award, TrendingUp, Calendar, BookOpen } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function GradesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'student') {
      router.push('/dashboard')
      return
    }

    setUser(parsedUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  return (
    <AuthCheck requiredRole="student">
      <DashboardLayout>
        <GradeViewErrorBoundary>
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    My Grades
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    View your assignment grades and performance
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Average Grade
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      --%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Assignments
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      --
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Graded
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      --/--
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade View Component */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              <StudentGradeView />
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
                Need Help?
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p>
                  • Grades are typically available within 1-2 weeks after assignment submission
                </p>
                <p>
                  • If you don't see a grade for an assignment, it may still be under review
                </p>
                <p>
                  • Contact your teacher if you have questions about your grades
                </p>
                <p>
                  • Grades are calculated as a percentage of the maximum marks for each assignment
                </p>
              </div>
            </div>
          </div>
        </GradeViewErrorBoundary>
      </DashboardLayout>
    </AuthCheck>
  )
}
