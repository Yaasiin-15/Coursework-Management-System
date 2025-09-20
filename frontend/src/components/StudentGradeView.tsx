'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertTriangle, BookOpen, Filter, Search, Award, RefreshCw } from 'lucide-react'
import GradeCard from './GradeCard'
import { useGrades, getGradeStats, StudentGrade } from '@/hooks/useGrades'
import GradeErrorHandler, { GradeFallback, GradeLoading } from './GradeErrorHandler'
import { GradeViewErrorBoundary } from './GradeErrorBoundary'

interface StudentGradeViewProps {
  classId?: string
}

export default function StudentGradeView({ classId }: StudentGradeViewProps) {
  const [filteredGrades, setFilteredGrades] = useState<StudentGrade[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'grade' | 'title'>('date')

  // Use custom hook for grade data fetching with enhanced features
  const { 
    grades, 
    loading, 
    error, 
    refetch, 
    clearError, 
    isRefetching, 
    lastUpdated 
  } = useGrades({
    classId,
    autoRefresh: true,
    refreshInterval: 30000, // Refresh every 30 seconds
    retryAttempts: 3,
    retryDelay: 1000,
    enableCache: true
  })

  useEffect(() => {
    filterAndSortGrades()
  }, [grades, searchTerm, selectedCourse, sortBy])

  const filterAndSortGrades = () => {
    let filtered = [...grades]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(grade =>
        grade.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.course.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(grade => grade.course === selectedCourse)
    }

    // Sort grades
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'grade':
          return (b.marks || 0) - (a.marks || 0)
        case 'title':
          return a.assignmentTitle.localeCompare(b.assignmentTitle)
        case 'date':
        default:
          return new Date(b.gradedAt || b.submittedAt).getTime() - new Date(a.gradedAt || a.submittedAt).getTime()
      }
    })

    setFilteredGrades(filtered)
  }

  const getUniqueClasses = () => {
    const courses = Array.from(new Set(grades.map(grade => grade.course)))
    return courses.sort()
  }

  const calculateGPA = () => {
    if (grades.length === 0) return 0
    const totalPoints = grades.reduce((sum, grade) => {
      if (grade.marks !== undefined && grade.assignmentMaxMarks > 0) {
        return sum + (grade.marks / grade.assignmentMaxMarks) * 4.0
      }
      return sum
    }, 0)
    return (totalPoints / grades.length).toFixed(2)
  }

  if (loading) {
    return <GradeLoading showProgress={true} />
  }

  if (error) {
    return (
      <GradeErrorHandler
        error={error}
        onRetry={refetch}
        onClearError={clearError}
        isLoading={isRefetching}
        lastUpdated={lastUpdated}
      />
    )
  }

  const stats = getGradeStats(grades)

  return (
    <GradeViewErrorBoundary>
      <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Grades</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">View your assignment grades and feedback</p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 sm:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalGrades}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Grades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.percentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{calculateGPA()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">GPA</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search assignments or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Courses</option>
            {getUniqueClasses().map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'grade' | 'title')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="grade">Sort by Grade</option>
            <option value="title">Sort by Title</option>
          </select>

          <button
            onClick={refetch}
            disabled={isRefetching}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Grades List */}
      {filteredGrades.length === 0 ? (
        <GradeFallback 
          message={
            searchTerm || selectedCourse !== 'all' 
              ? 'No grades match your current filters'
              : 'No grades found'
          }
          suggestion={
            searchTerm || selectedCourse !== 'all' 
              ? 'Try adjusting your search or filters to see more results.'
              : 'You don\'t have any graded assignments yet. Grades will appear here once your teacher grades your submissions.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredGrades.map((grade) => (
            <GradeCard
              key={grade.submissionId}
              submissionId={grade.submissionId}
              assignmentTitle={grade.assignmentTitle}
              assignmentDescription={grade.assignmentDescription}
              assignmentMaxMarks={grade.assignmentMaxMarks}
              course={grade.course}
              className={grade.className}
              marks={grade.marks}
              feedback={grade.feedback}
              status={grade.status}
              submittedAt={grade.submittedAt}
              gradedAt={grade.gradedAt}
              gradedByName={grade.gradedByName}
              deadline={grade.deadline}
            />
          ))}
        </div>
      )}
      </div>
    </GradeViewErrorBoundary>
  )
}