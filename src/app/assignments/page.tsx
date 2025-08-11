'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import GradingInterface from '@/components/GradingInterface'
import BulkOperations from '@/components/BulkOperations'
import { 
  Plus, 
  Calendar, 
  Users, 
  FileText, 
  Download, 
  Eye, 
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Assignment {
  _id: string
  title: string
  description: string
  course: string
  deadline: string
  maxMarks: number
  createdBy: string
  submissionCount?: number
  gradedCount?: number
  createdAt: string
}

export default function AssignmentsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all')
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

  const handleBulkAction = async (action: string, assignmentIds: string[]) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/assignments/bulk-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, assignmentIds })
      })

      if (response.ok) {
        if (action === 'download') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'bulk-submissions.zip'
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          const data = await response.json()
          alert(data.message)
          if (action === 'delete') {
            fetchAssignments(localStorage.getItem('token')!)
            setSelectedAssignments([])
          }
        }
      }
    } catch (error) {
      console.error('Error in bulk operation:', error)
      alert('Error performing bulk operation')
    }
  }

  const getAssignmentStatus = (assignment: Assignment) => {
    const now = new Date()
    const deadline = new Date(assignment.deadline)
    
    if (deadline < now) {
      return { status: 'overdue', color: 'text-red-600 dark:text-red-400', icon: AlertTriangle }
    } else if (assignment.gradedCount === assignment.submissionCount && (assignment.submissionCount ?? 0) > 0) {
      return { status: 'completed', color: 'text-green-600 dark:text-green-400', icon: CheckCircle }
    } else {
      return { status: 'upcoming', color: 'text-blue-600 dark:text-blue-400', icon: Clock }
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true
    const { status } = getAssignmentStatus(assignment)
    return status === filter
  })

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date()
    const due = new Date(deadline)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Assignments
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {user.role === 'teacher' 
                ? 'Manage your assignments and track student progress' 
                : 'View and submit your assignments'
              }
            </p>
          </div>
          
          {user.role === 'teacher' && (
            <button
              onClick={() => router.push('/assignments/create')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'upcoming', 'overdue', 'completed'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Bulk Operations for Teachers */}
        {user.role === 'teacher' && assignments.length > 0 && (
          <BulkOperations
            assignments={assignments}
            selectedAssignments={selectedAssignments}
            onSelectionChange={setSelectedAssignments}
            onBulkAction={handleBulkAction}
          />
        )}

        {/* Assignments List */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'No assignments found.' : `No ${filter} assignments found.`}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAssignments.map((assignment) => {
                const { status, color, icon: StatusIcon } = getAssignmentStatus(assignment)
                const daysUntil = getDaysUntilDeadline(assignment.deadline)
                
                return (
                  <li key={assignment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="px-4 sm:px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                                {assignment.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {daysUntil < 0 
                                      ? `Overdue by ${Math.abs(daysUntil)} day(s)`
                                      : daysUntil === 0
                                      ? 'Due today'
                                      : `Due in ${daysUntil} day(s)`
                                    }
                                  </span>
                                </span>
                                <span>{assignment.course}</span>
                                <span>{assignment.maxMarks} marks</span>
                                {user.role === 'teacher' && (
                                  <span className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>{assignment.submissionCount ?? 0} submissions</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <StatusIcon className={`w-4 h-4 ${color}`} />
                            <span className={`text-sm font-medium ${color} capitalize`}>
                              {status}
                            </span>
                          </div>

                          {user.role === 'teacher' ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedAssignmentForGrading(assignment._id)}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="Grade submissions"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/assignments/${assignment._id}/edit`)}
                                className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                title="Edit assignment"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this assignment?')) {
                                    handleBulkAction('delete', [assignment._id])
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Delete assignment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => router.push(`/assignments/${assignment._id}`)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              View Details
                            </button>
                          )}
                        </div>
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