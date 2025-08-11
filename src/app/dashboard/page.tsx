'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import GradingInterface from '@/components/GradingInterface'
import { GraduationCap, Clock, CheckCircle } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Assignment {
  _id: string
  title: string
  course: string
  deadline: string
  maxMarks: number
  submissionCount?: number
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchAssignments(token)
  }, [router])

  const fetchAssignments = async (token: string) => {
    try {
      const response = await fetch('/api/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date()
    const due = new Date(deadline)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDeadlineColor = (deadline: string) => {
    const days = getDaysUntilDeadline(deadline)
    if (days < 0) return 'text-red-600 dark:text-red-400'
    if (days <= 3) return 'text-orange-600 dark:text-orange-400'
    return 'text-green-600 dark:text-green-400'
  }

  if (!user) return null

  const upcomingAssignments = assignments.filter(a => new Date(a.deadline) > new Date())
  const overdueAssignments = assignments.filter(a => new Date(a.deadline) <= new Date())

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {user.role === 'teacher' 
              ? 'Manage your assignments and view student submissions.' 
              : 'View your assignments and submit your work.'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {user.role === 'teacher' ? 'Total Assignments' : 'Active Assignments'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {assignments.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {user.role === 'teacher' ? 'Graded' : 'Completed'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {overdueAssignments.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors sm:col-span-2 lg:col-span-1">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Upcoming
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {upcomingAssignments.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Assignments
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {user.role === 'teacher' 
                ? 'Your latest assignments and their status.' 
                : 'Upcoming assignments and deadlines.'
              }
            </p>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No assignments found.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {assignments.slice(0, 5).map((assignment) => {
                const daysUntil = getDaysUntilDeadline(assignment.deadline)
                return (
                  <li key={assignment._id}>
                    <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {assignment.course.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {assignment.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {assignment.course} • {assignment.maxMarks} marks
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-sm">
                          <span className={getDeadlineColor(assignment.deadline)}>
                            {daysUntil < 0 
                              ? `Overdue by ${Math.abs(daysUntil)} day(s)`
                              : daysUntil === 0
                              ? 'Due today'
                              : `Due in ${daysUntil} day(s)`
                            }
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(assignment.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {user.role === 'teacher' && (
                          <button
                            onClick={() => setSelectedAssignmentForGrading(assignment._id)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Grade
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Grading Interface Modal */}
      {selectedAssignmentForGrading && (
        <GradingInterface
          assignmentId={selectedAssignmentForGrading}
          maxMarks={assignments.find(a => a._id === selectedAssignmentForGrading)?.maxMarks || 100}
          onClose={() => setSelectedAssignmentForGrading(null)}
        />
      )}
    </DashboardLayout>
  )
}