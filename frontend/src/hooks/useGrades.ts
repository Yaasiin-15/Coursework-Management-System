import { useState, useEffect, useCallback, useRef } from 'react'

export interface StudentGrade {
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
}

export interface AssignmentGradeDetails {
  submissionId: string
  assignmentTitle: string
  assignmentDescription: string
  assignmentMaxMarks: number
  course: string
  className: string
  deadline: string
  fileName: string
  submittedAt: string
  status: 'submitted' | 'graded' | 'late'
  marks?: number
  feedback?: string
  gradedAt?: string
  gradedByName?: string
  gradedByEmail?: string
}

interface UseGradesOptions {
  classId?: string
  assignmentId?: string
  autoRefresh?: boolean
  refreshInterval?: number
  retryAttempts?: number
  retryDelay?: number
  enableCache?: boolean
}

interface UseGradesReturn {
  grades: StudentGrade[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  clearError: () => void
  isRefetching: boolean
  lastUpdated: Date | null
}

interface UseAssignmentGradeOptions {
  assignmentId: string
  autoRefresh?: boolean
  refreshInterval?: number
  retryAttempts?: number
  retryDelay?: number
  enableCache?: boolean
}

interface UseAssignmentGradeReturn {
  grade: AssignmentGradeDetails | null
  loading: boolean
  error: string | null
  isGraded: boolean
  refetch: () => Promise<void>
  clearError: () => void
  isRefetching: boolean
  lastUpdated: Date | null
}

// Enhanced cache with TTL and size limits
class GradeCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize = 100
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  size() {
    return this.cache.size
  }
}

const gradeCache = new GradeCache()
const assignmentGradeCache = new GradeCache()

const getCacheKey = (classId?: string, assignmentId?: string) => {
  return `grades_${classId || 'all'}_${assignmentId || 'all'}`
}

const getAssignmentCacheKey = (assignmentId: string) => {
  return `assignment_grade_${assignmentId}`
}

// Retry utility function
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (attempts <= 1) throw error
    
    await new Promise(resolve => setTimeout(resolve, delay))
    return retryWithBackoff(fn, attempts - 1, delay * 2)
  }
}

export function useGrades(options: UseGradesOptions = {}): UseGradesReturn {
  const { 
    classId, 
    assignmentId, 
    autoRefresh = false, 
    refreshInterval = 30000,
    retryAttempts = 3,
    retryDelay = 1000,
    enableCache = true
  } = options
  
  const [grades, setGrades] = useState<StudentGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchGrades = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true)
      } else {
        setIsRefetching(true)
      }
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view your grades')
        return
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()

      const params = new URLSearchParams()
      if (classId) {
        params.append('classId', classId)
      }
      if (assignmentId) {
        params.append('assignmentId', assignmentId)
      }

      const fetchData = async () => {
        const response = await fetch(`/api/students/grades?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: abortControllerRef.current?.signal
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch grades')
        }

        const data = await response.json()
        if (data.success) {
          setGrades(data.grades)
          setLastUpdated(new Date())
          
          // Cache the results if enabled
          if (enableCache) {
            const cacheKey = getCacheKey(classId, assignmentId)
            gradeCache.set(cacheKey, data.grades)
          }
        } else {
          throw new Error('Invalid response format')
        }
      }

      await retryWithBackoff(fetchData, retryAttempts, retryDelay)
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was cancelled
      }
      
      console.error('Error fetching grades:', error)
      setError(error instanceof Error ? error.message : 'Failed to load grades')
    } finally {
      setLoading(false)
      setIsRefetching(false)
    }
  }, [classId, assignmentId, retryAttempts, retryDelay, enableCache])

  const refetch = useCallback(async () => {
    // Clear cache to force fresh data
    if (enableCache) {
      const cacheKey = getCacheKey(classId, assignmentId)
      gradeCache.delete(cacheKey)
    }
    await fetchGrades(true)
  }, [fetchGrades, classId, assignmentId, enableCache])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    // Check cache first if enabled
    if (enableCache) {
      const cacheKey = getCacheKey(classId, assignmentId)
      const cached = gradeCache.get(cacheKey)
      
      if (cached) {
        setGrades(cached)
        setLastUpdated(new Date())
        setLoading(false)
        return
      }
    }

    fetchGrades()
  }, [fetchGrades, enableCache])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refetch()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refetch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    grades,
    loading,
    error,
    refetch,
    clearError,
    isRefetching,
    lastUpdated
  }
}

export function useAssignmentGrade(options: UseAssignmentGradeOptions): UseAssignmentGradeReturn {
  const { 
    assignmentId, 
    autoRefresh = false, 
    refreshInterval = 30000,
    retryAttempts = 3,
    retryDelay = 1000,
    enableCache = true
  } = options
  
  const [grade, setGrade] = useState<AssignmentGradeDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGraded, setIsGraded] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchAssignmentGrade = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true)
      } else {
        setIsRefetching(true)
      }
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view your grade')
        return
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()

      const fetchData = async () => {
        const response = await fetch(`/api/students/grades/${assignmentId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: abortControllerRef.current?.signal
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch grade details')
        }

        const data = await response.json()
        if (data.success) {
          setGrade(data.grade)
          setIsGraded(data.isGraded)
          setLastUpdated(new Date())
          
          // Cache the results if enabled
          if (enableCache) {
            const cacheKey = getAssignmentCacheKey(assignmentId)
            assignmentGradeCache.set(cacheKey, data.grade)
          }
        } else {
          throw new Error('Invalid response format')
        }
      }

      await retryWithBackoff(fetchData, retryAttempts, retryDelay)
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was cancelled
      }
      
      console.error('Error fetching assignment grade:', error)
      setError(error instanceof Error ? error.message : 'Failed to load grade details')
    } finally {
      setLoading(false)
      setIsRefetching(false)
    }
  }, [assignmentId, retryAttempts, retryDelay, enableCache])

  const refetch = useCallback(async () => {
    // Clear cache to force fresh data
    if (enableCache) {
      const cacheKey = getAssignmentCacheKey(assignmentId)
      assignmentGradeCache.delete(cacheKey)
    }
    await fetchAssignmentGrade(true)
  }, [fetchAssignmentGrade, assignmentId, enableCache])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    // Check cache first if enabled
    if (enableCache) {
      const cacheKey = getAssignmentCacheKey(assignmentId)
      const cached = assignmentGradeCache.get(cacheKey)
      
      if (cached) {
        setGrade(cached)
        setIsGraded(cached.status === 'graded')
        setLastUpdated(new Date())
        setLoading(false)
        return
      }
    }

    fetchAssignmentGrade()
  }, [fetchAssignmentGrade, enableCache])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refetch()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refetch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    grade,
    loading,
    error,
    isGraded,
    refetch,
    clearError,
    isRefetching,
    lastUpdated
  }
}

// Utility function to clear all grade caches
export const clearGradeCache = () => {
  gradeCache.clear()
  assignmentGradeCache.clear()
}

// Utility function to get cache statistics
export const getCacheStats = () => {
  return {
    gradeCacheSize: gradeCache.size(),
    assignmentGradeCacheSize: assignmentGradeCache.size()
  }
}

// Utility function to get grade statistics
export const getGradeStats = (grades: StudentGrade[]) => {
  const gradedGrades = grades.filter(g => g.status === 'graded' && g.marks !== undefined)
  
  if (gradedGrades.length === 0) {
    return {
      totalGrades: 0,
      averageGrade: 0,
      highestGrade: 0,
      lowestGrade: 0,
      totalMarks: 0,
      percentage: 0,
      gradeDistribution: {
        A: 0, B: 0, C: 0, D: 0, F: 0
      }
    }
  }

  const totalMarks = gradedGrades.reduce((sum, grade) => sum + (grade.marks || 0), 0)
  const maxMarks = gradedGrades.reduce((sum, grade) => sum + grade.assignmentMaxMarks, 0)
  const averageGrade = totalMarks / gradedGrades.length
  const highestGrade = Math.max(...gradedGrades.map(g => g.marks || 0))
  const lowestGrade = Math.min(...gradedGrades.map(g => g.marks || 0))
  const percentage = (totalMarks / maxMarks) * 100

  // Calculate grade distribution
  const gradeDistribution = gradedGrades.reduce((acc, grade) => {
    const gradePercentage = (grade.marks || 0) / grade.assignmentMaxMarks * 100
    if (gradePercentage >= 90) acc.A++
    else if (gradePercentage >= 80) acc.B++
    else if (gradePercentage >= 70) acc.C++
    else if (gradePercentage >= 60) acc.D++
    else acc.F++
    return acc
  }, { A: 0, B: 0, C: 0, D: 0, F: 0 })

  return {
    totalGrades: gradedGrades.length,
    averageGrade: Math.round(averageGrade * 100) / 100,
    highestGrade,
    lowestGrade,
    totalMarks,
    percentage: Math.round(percentage * 100) / 100,
    gradeDistribution
  }
}

// Utility function to validate grade data
export const validateGradeData = (grade: StudentGrade): boolean => {
  return !!(
    grade.submissionId &&
    grade.assignmentTitle &&
    grade.assignmentMaxMarks > 0 &&
    grade.course &&
    grade.className &&
    grade.status &&
    grade.submittedAt &&
    grade.deadline
  )
}

// Utility function to format grade for display
export const formatGrade = (marks: number, maxMarks: number): string => {
  if (maxMarks === 0) return 'N/A'
  const percentage = (marks / maxMarks) * 100
  return `${marks}/${maxMarks} (${percentage.toFixed(1)}%)`
}
