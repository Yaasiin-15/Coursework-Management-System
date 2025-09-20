'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthCheckProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin'
}

export default function AuthCheck({ children, requiredRole }: AuthCheckProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (!token || !userStr) {
        router.push('/login')
        return
      }

      try {
        const user = JSON.parse(userStr)
        
        if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
          router.push('/dashboard')
          return
        }
        
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}