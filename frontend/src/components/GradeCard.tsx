'use client'

import { CheckCircle, Clock, AlertTriangle, User, Calendar } from 'lucide-react'

interface GradeCardProps {
  submissionId: string
  assignmentTitle: string
  assignmentDescription: string
  assignmentMaxMarks: number
  course: string
  className: string
  marks?: number
  feedback?: string
  status: 'graded' | 'submitted' | 'late'
  submittedAt: string
  gradedAt?: string
  gradedByName?: string
  deadline: string
  onClick?: () => void
}

export default function GradeCard({
  assignmentTitle,
  assignmentDescription,
  assignmentMaxMarks,
  course,
  className,
  marks,
  feedback,
  status,
  submittedAt,
  gradedAt,
  gradedByName,
  deadline,
  onClick
}: GradeCardProps) {
  
  const getStatusIcon = () => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      case 'late':
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'graded':
        return 'Graded'
      case 'late':
        return 'Late Submission'
      default:
        return 'Pending'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'late':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    }
  }

  const getGradeColor = () => {
    if (marks === undefined || assignmentMaxMarks === 0) return 'text-gray-500'
    
    const percentage = (marks / assignmentMaxMarks) * 100
    if (percentage >= 90) return 'text-green-600 dark:text-green-400'
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400'
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = new Date(deadline) < new Date(submittedAt)

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 ${
        onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-600' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {assignmentTitle}
              </h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full flex-shrink-0">
                {course}
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
              {assignmentDescription}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* Grade Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getGradeColor()}`}>
                {marks !== undefined ? marks : '--'}
                <span className="text-lg text-gray-500 dark:text-gray-400">/{assignmentMaxMarks}</span>
              </div>
              {marks !== undefined && assignmentMaxMarks > 0 && (
                <div className={`text-sm font-medium ${getGradeColor()}`}>
                  {((marks / assignmentMaxMarks) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
          
          {/* Grade Letter/Category */}
          {marks !== undefined && assignmentMaxMarks > 0 && (
            <div className="text-right">
              <div className={`text-lg font-bold ${getGradeColor()}`}>
                {(() => {
                  const percentage = (marks / assignmentMaxMarks) * 100
                  if (percentage >= 90) return 'A'
                  if (percentage >= 80) return 'B'
                  if (percentage >= 70) return 'C'
                  if (percentage >= 60) return 'D'
                  return 'F'
                })()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Grade</div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Due: {formatDate(deadline)}</span>
            {isOverdue && (
              <AlertTriangle className="w-3 h-3 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Submitted: {formatDate(submittedAt)}</span>
          </div>
          
          {gradedAt && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Graded: {formatDate(gradedAt)}</span>
            </div>
          )}
          
          {gradedByName && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>By: {gradedByName}</span>
            </div>
          )}
        </div>

        {/* Class Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Class: {className}
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
              <span>Teacher Feedback</span>
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {feedback}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}