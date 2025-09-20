'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Assignment {
  _id: string
  title: string
  course: string
  maxMarks: number
}

interface Submission {
  _id: string
  fileName: string
  fileUrl: string
  marks?: number
  feedback?: string
  submittedAt: string
  status: string
  studentId: {
    _id: string
    name: string
    email: string
  }
}

export default function GradeSubmission() {
  const [user, setUser] = useState<User | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [marks, setMarks] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()

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
    fetchSubmissionDetails(token)
  }, [router, params.id, params.submissionId])

  const fetchSubmissionDetails = async (token: string) => {
    try {
      const [assignmentRes, submissionRes] = await Promise.all([
        fetch(`/api/assignments/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/submissions/${params.submissionId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ])

      if (assignmentRes.ok) {
        const assignmentData = await assignmentRes.json()
        setAssignment(assignmentData.assignment)
      }

      if (submissionRes.ok) {
        const submissionData = await submissionRes.json()
        setSubmission(submissionData.submission)
        setMarks(submissionData.submission.marks?.toString() || '')
        setFeedback(submissionData.submission.feedback || '')
      }
    } catch (error) {
      console.error('Error fetching submission details:', error)
      setError('Failed to load submission details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/submissions/${params.submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          marks: marks ? parseInt(marks) : undefined,
          feedback,
        }),
      })

      if (response.ok) {
        router.push(`/assignments/${params.id}`)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to save grade')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user || !assignment || !submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Grade Submission</h1>
              <p className="text-sm text-gray-600 mt-1">
                {assignment.title} - {assignment.course}
              </p>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Student</h3>
                  <p className="text-lg font-medium text-gray-900">{submission.studentId.name}</p>
                  <p className="text-sm text-gray-600">{submission.studentId.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Submission</h3>
                  <p className="text-lg font-medium text-gray-900">{submission.fileName}</p>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Submitted File</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{submission.fileName}</p>
                      <p className="text-sm text-gray-500">Click to download and review</p>
                    </div>
                    <a
                      href={submission.fileUrl}
                      download
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="marks" className="block text-sm font-medium text-gray-700">
                    Marks (out of {assignment.maxMarks})
                  </label>
                  <input
                    type="number"
                    name="marks"
                    id="marks"
                    min="0"
                    max={assignment.maxMarks}
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                    placeholder={`Enter marks (0-${assignment.maxMarks})`}
                  />
                </div>

                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                    Feedback
                  </label>
                  <textarea
                    name="feedback"
                    id="feedback"
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                    placeholder="Provide detailed feedback for the student..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}