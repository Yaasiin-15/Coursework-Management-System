import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export function authenticateRequest(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      console.log('No token provided in request')
      return null
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      console.log('Invalid or expired token')
      return null
    }
    
    return decoded
  } catch (error) {
    console.error('Error in authentication:', error)
    return null
  }
}