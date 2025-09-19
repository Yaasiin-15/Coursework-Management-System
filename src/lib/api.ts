// Utility functions for making authenticated API calls

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export async function apiCall<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token')
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }

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

export async function get<T = any>(url: string): Promise<ApiResponse<T>> {
  return apiCall<T>(url, { method: 'GET' })
}

export async function post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
  return apiCall<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
  return apiCall<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function del<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
  return apiCall<T>(url, {
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined,
  })
}