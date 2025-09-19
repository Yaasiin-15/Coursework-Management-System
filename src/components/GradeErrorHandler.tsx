'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Wifi, Lock, FileText, Clock, User } from 'lucide-react'

interface GradeErrorHandlerProps {
  error: string | null
  onRetry: () => void
  onClearError: () => void
  isLoading?: boolean
  lastUpdated?: Date | null
}

interface ErrorInfo {
  icon: React.ReactNode
  title: string
  message: string
  suggestion: string
  actionText: string
  severity: 'info' | 'warning' | 'error'
}

export default function GradeErrorHandler({
  error,
  onRetry,
  onClearError,
  isLoading = false,
  lastUpdated
}: GradeErrorHandlerProps) {
  if (!error) return null

  const getErrorInfo = (errorMessage: string): ErrorInfo => {
    const lowerError = errorMessage.toLowerCase()
    
    // Network/Connection errors
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
      return {
        icon: <Wifi className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        suggestion: 'Try refreshing the page or check your network connection.',
        actionText: 'Retry Connection',
        severity: 'warning'
      }
    }
    
    // Authentication errors
    if (lowerError.includes('login') || lowerError.includes('auth') || lowerError.includes('token')) {
      return {
        icon: <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        title: 'Authentication Required',
        message: 'Please log in to view your grades.',
        suggestion: 'You may need to log in again to access your grade information.',
        actionText: 'Go to Login',
        severity: 'info'
      }
    }
    
    // Permission/Access errors
    if (lowerError.includes('permission') || lowerError.includes('access') || lowerError.includes('unauthorized')) {
      return {
        icon: <User className="w-5 h-5 text-red-600 dark:text-red-400" />,
        title: 'Access Denied',
        message: 'You don\'t have permission to view these grades.',
        suggestion: 'Contact your teacher or administrator if you believe this is an error.',
        actionText: 'Contact Support',
        severity: 'error'
      }
    }
    
    // No grades available
    if (lowerError.includes('no grades') || lowerError.includes('not found')) {
      return {
        icon: <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
        title: 'No Grades Available',
        message: 'No grades have been posted yet.',
        suggestion: 'Grades will appear here once your teacher has graded your submissions.',
        actionText: 'Refresh',
        severity: 'info'
      }
    }
    
    // Server errors
    if (lowerError.includes('server') || lowerError.includes('500') || lowerError.includes('internal')) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />,
        title: 'Server Error',
        message: 'The server encountered an error while processing your request.',
        suggestion: 'This is a temporary issue. Please try again in a few moments.',
        actionText: 'Try Again',
        severity: 'error'
      }
    }
    
    // Timeout errors
    if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
      return {
        icon: <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
        title: 'Request Timeout',
        message: 'The request took too long to complete.',
        suggestion: 'The server might be busy. Please try again.',
        actionText: 'Retry',
        severity: 'warning'
      }
    }
    
    // Default error
    return {
      icon: <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      title: 'Error Loading Grades',
      message: errorMessage,
      suggestion: 'Please try refreshing the page or contact support if the problem persists.',
      actionText: 'Try Again',
      severity: 'error'
    }
  }

  const errorInfo = getErrorInfo(error)
  
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const handleAction = () => {
    if (errorInfo.title === 'Authentication Required') {
      window.location.href = '/login'
    } else if (errorInfo.title === 'Access Denied') {
      // You could implement a contact support modal or redirect
      window.open('mailto:support@example.com?subject=Grade Access Issue', '_blank')
    } else {
      onRetry()
    }
  }

  return (
    <div className={`border rounded-lg p-6 ${getSeverityStyles(errorInfo.severity)}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {errorInfo.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${
            errorInfo.severity === 'info' ? 'text-blue-800 dark:text-blue-200' :
            errorInfo.severity === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
            'text-red-800 dark:text-red-200'
          }`}>
            {errorInfo.title}
          </h3>
          
          <p className={`mt-1 text-sm ${
            errorInfo.severity === 'info' ? 'text-blue-700 dark:text-blue-300' :
            errorInfo.severity === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
            'text-red-700 dark:text-red-300'
          }`}>
            {errorInfo.message}
          </p>
          
          <p className={`mt-2 text-sm ${
            errorInfo.severity === 'info' ? 'text-blue-600 dark:text-blue-400' :
            errorInfo.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {errorInfo.suggestion}
          </p>
          
          {lastUpdated && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAction}
          disabled={isLoading}
          className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors ${
            errorInfo.severity === 'info' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400' :
            errorInfo.severity === 'warning'
              ? 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-yellow-400' :
              'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {errorInfo.actionText}
            </>
          )}
        </button>
        
        <button
          onClick={onClearError}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

// Fallback component for when grades are unavailable
export function GradeFallback({ 
  message = "No grades are currently available",
  suggestion = "Grades will appear here once they are posted by your teacher."
}: {
  message?: string
  suggestion?: string
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {message}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
        {suggestion}
      </p>
    </div>
  )
}

// Loading component with better UX
export function GradeLoading({ 
  message = "Loading your grades...",
  showProgress = false 
}: {
  message?: string
  showProgress?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
        {showProgress && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This may take a few moments...
          </p>
        )}
      </div>
    </div>
  )
}
