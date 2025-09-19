'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, BookOpen, Wifi } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export default class GradeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GradeErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to analytics or monitoring service
    this.logError(error, errorInfo)
  }

  logError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo })
    console.error('Grade Error Logged:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  handleRefresh = () => {
    window.location.reload()
  }

  getErrorType = (error: Error): 'network' | 'auth' | 'permission' | 'data' | 'unknown' => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network'
    }
    if (message.includes('auth') || message.includes('token') || message.includes('login')) {
      return 'auth'
    }
    if (message.includes('permission') || message.includes('access') || message.includes('unauthorized')) {
      return 'permission'
    }
    if (message.includes('data') || message.includes('parse') || message.includes('json')) {
      return 'data'
    }
    return 'unknown'
  }

  getErrorContent = (error: Error, retryCount: number) => {
    const errorType = this.getErrorType(error)
    
    switch (errorType) {
      case 'network':
        return {
          icon: <Wifi className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />,
          title: 'Connection Error',
          message: 'Unable to connect to the grade server. Please check your internet connection.',
          suggestion: 'Try refreshing the page or check your network connection.',
          primaryAction: 'Retry Connection',
          secondaryAction: 'Refresh Page',
          severity: 'warning' as const
        }
      
      case 'auth':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
          title: 'Authentication Required',
          message: 'Please log in to view your grades.',
          suggestion: 'You may need to log in again to access your grade information.',
          primaryAction: 'Go to Login',
          secondaryAction: 'Go Home',
          severity: 'info' as const
        }
      
      case 'permission':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />,
          title: 'Access Denied',
          message: 'You don\'t have permission to view these grades.',
          suggestion: 'Contact your teacher or administrator if you believe this is an error.',
          primaryAction: 'Contact Support',
          secondaryAction: 'Go Home',
          severity: 'error' as const
        }
      
      case 'data':
        return {
          icon: <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />,
          title: 'Data Error',
          message: 'There was a problem processing the grade data.',
          suggestion: 'This might be a temporary issue. Please try again.',
          primaryAction: 'Try Again',
          secondaryAction: 'Refresh Page',
          severity: 'warning' as const
        }
      
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />,
          title: 'Unexpected Error',
          message: 'Something went wrong while loading your grades.',
          suggestion: 'Please try refreshing the page or contact support if the problem persists.',
          primaryAction: 'Try Again',
          secondaryAction: 'Go Home',
          severity: 'error' as const
        }
    }
  }

  handlePrimaryAction = () => {
    const { error } = this.state
    if (!error) return

    const errorType = this.getErrorType(error)
    
    switch (errorType) {
      case 'auth':
        window.location.href = '/login'
        break
      case 'permission':
        window.open('mailto:support@example.com?subject=Grade Access Issue', '_blank')
        break
      case 'network':
      case 'data':
      default:
        this.handleRetry()
        break
    }
  }

  handleSecondaryAction = () => {
    const { error } = this.state
    if (!error) return

    const errorType = this.getErrorType(error)
    
    switch (errorType) {
      case 'auth':
      case 'permission':
        this.handleGoHome()
        break
      case 'network':
      case 'data':
      default:
        this.handleRefresh()
        break
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, retryCount } = this.state
      if (!error) return null

      const errorContent = this.getErrorContent(error, retryCount)
      const maxRetries = 3
      const shouldShowRetry = retryCount < maxRetries

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              {errorContent.icon}
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {errorContent.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {errorContent.message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {errorContent.suggestion}
              </p>
              
              {retryCount > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Retry attempt {retryCount} of {maxRetries}
                </p>
              )}
            </div>
            
            {this.props.showDetails && process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Development)
                </summary>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex flex-col gap-3">
              {shouldShowRetry && (
                <button
                  onClick={this.handlePrimaryAction}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    errorContent.severity === 'info' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    errorContent.severity === 'warning'
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                      'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {errorContent.primaryAction}
                </button>
              )}
              
              <button
                onClick={this.handleSecondaryAction}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                {errorContent.secondaryAction}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping grade components
export function withGradeErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    showDetails?: boolean
    onError?: (error: Error, errorInfo: ErrorInfo) => void
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <GradeErrorBoundary
        showDetails={options?.showDetails}
        onError={options?.onError}
      >
        <Component {...props} />
      </GradeErrorBoundary>
    )
  }
}

// Specific error boundary for grade viewing with custom styling
export function GradeViewErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <GradeErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log to analytics or monitoring service
        console.error('Grade View Error:', { error, errorInfo })
      }}
    >
      {children}
    </GradeErrorBoundary>
  )
}
