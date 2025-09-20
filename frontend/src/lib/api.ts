// Utility functions for making authenticated API calls to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token')
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }

    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.message || 'Request failed' }
    }
  } catch (error) {
    console.error('API call error:', error)
    return { success: false, error: 'Network error' }
  }
}

export async function get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { method: 'GET' })
}

export async function post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function del<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined,
  })
}