// Frontend auth utilities for token management

export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  classId?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: User
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('token', token)
}

export function removeToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function hasRole(requiredRole: string | string[]): boolean {
  const user = getUser()
  if (!user) return false
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role)
  }
  
  return user.role === requiredRole
}