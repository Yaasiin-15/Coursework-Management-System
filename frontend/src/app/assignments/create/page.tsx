'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function CreateAssignment() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    deadline: '',
    maxMarks: '',
    classId: ''
  })
  const [classes, setClasses] = useState<Array<{_id: string, name: string, code: string}>>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'teacher') {
      router.push('/dashboard')
      return
    }

    setUser(parsedUser)
    fetchClasses()
  }, [router])

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Fetching classes for assignment creation...')
      
      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      console.log('Classes API response:', { status: response.status, data })
      
      if (response.ok) {
        setClasses(data.classes || [])
        console.log('Classes loaded:', data.classes?.length || 0)
      } else {
        console.error('Failed to fetch classes:', data.message)
        setError(`Failed to load classes: ${data.message}`)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setError('Failed to load classes. Please refresh the page.')
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Validate form data
    if (!formData.classId) {
      setError('Please select a class for this assignment')
      setLoading(false)
      return
    }

    if (classes.length === 0) {
      setError('You need to create a class first before creating assignments')
      setLoading(false)
      return
    }

    console.log('Submitting assignment with data:', formData)

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('API response:', { status: response.status, data })

      if (response.ok) {
        console.log('Assignment created successfully, redirecting...')
        router.push('/assignments')
      } else {
        console.error('API error:', data)
        setError(data.message || `Failed to create assignment (${response.status})`)
      }
    } catch (error) {
      console.error('Network error:', error)
      setError('Network error occurred. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
            <p className="mt-2 text-gray-600">
              Create a new assignment for your students.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Assignment Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                  placeholder="e.g., Chemistry Lab Report"
                />
              </div>

              <div>
                <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <select
                  name="classId"
                  id="classId"
                  required
                  value={formData.classId}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} ({cls.code})
                    </option>
                  ))}
                </select>
                {loadingClasses && (
                  <p className="mt-1 text-sm text-gray-500">Loading classes...</p>
                )}
                {!loadingClasses && classes.length === 0 && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      No classes found. You need to create a class first before creating assignments.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/classes')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Go to Classes page to create one
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                  Course
                </label>
                <input
                  type="text"
                  name="course"
                  id="course"
                  required
                  value={formData.course}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                  placeholder="e.g., Chemistry 101"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                  placeholder="Provide detailed instructions for the assignment..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    id="deadline"
                    required
                    value={formData.deadline}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                  />
                </div>

                <div>
                  <label htmlFor="maxMarks" className="block text-sm font-medium text-gray-700">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    name="maxMarks"
                    id="maxMarks"
                    min="1"
                    required
                    value={formData.maxMarks}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}