'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
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
  description: string
  course: string
  deadline: string
  maxMarks: number
  createdBy: {
    _id: string
    name: string
    email: string
  }
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
    name: string
    email: string
  }
}

export default function AssignmentDetail() {
  const [user, setUser] = useState<User | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [userSubmission, setUserSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchAssignmentDetails(token)
  }, [router, params.id])

  const fetchAssignmentDetails = async (token: string) => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        fetch(`/api/assignments/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/assignments/${params.id}/submissions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ])

      if (assignmentRes.ok) {
        const assignmentData = await assignmentRes.json()
        setAssignment(assignmentData.assignment)
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        setSubmissions(submissionsData.submissions)
        setUserSubmission(submissionsData.userSubmission)
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    const token = localStorage.getItem('token')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`/api/assignments/${params.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        fetchAssignmentDetails(token!)
        setSelectedFile(null)
      }
    } catch (error) {
      console.error('Error submitting file:', error)
    } finally {
      setUploading(false)
    }
  }

  if (loading || !user || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  const isOverdue = new Date(assignment.deadline) < new Date()
  const canSubmit = user.role === 'student' && !isOverdue && !userSubmission

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                  <p className="text-sm text-gray-600 mt-1">{assignment.course}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {isOverdue ? 'Overdue' : 'Active'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Due: {new Date(assignment.deadline).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Maximum Marks</h3>
                  <p className="text-2xl font-bold text-gray-900">{assignment.maxMarks}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Submissions</h3>
                  <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Teacher</h3>
                  <p className="text-lg font-medium text-gray-900">{assignment.createdBy.name}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                </div>
              </div>

              {user.role === 'student' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Submission</h3>

                  {userSubmission ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">Submitted: {userSubmission.fileName}</p>
                          <p className="text-sm text-blue-700">
                            {new Date(userSubmission.submittedAt).toLocaleString()}
                          </p>
                          {userSubmission.marks !== undefined && (
                            <p className="text-sm text-blue-700">
                              Grade: {userSubmission.marks}/{assignment.maxMarks}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${userSubmission.status === 'graded'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {userSubmission.status}
                        </span>
                      </div>
                      {userSubmission.feedback && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm font-medium text-gray-900">Feedback:</p>
                          <p className="text-sm text-gray-700 mt-1">{userSubmission.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : canSubmit ? (
                    <form onSubmit={handleFileSubmission} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload your submission
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!selectedFile || uploading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Submit Assignment'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {isOverdue ? 'Submission deadline has passed' : 'You have already submitted this assignment'}
                    </div>
                  )}
                </div>
              )}

              {user.role === 'teacher' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Student Submissions</h3>

                  {submissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No submissions yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions.map((submission) => (
                        <div key={submission._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{submission.studentId.name}</p>
                              <p className="text-sm text-gray-600">{submission.fileName}</p>
                              <p className="text-sm text-gray-500">
                                Submitted: {new Date(submission.submittedAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                {submission.marks !== undefined ? (
                                  <span className="text-lg font-bold text-green-600">
                                    {submission.marks}/{assignment.maxMarks}
                                  </span>
                                ) : (
                                  <span className="text-sm text-yellow-600">Pending Grade</span>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <a
                                  href={submission.fileUrl}
                                  download
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Download
                                </a>
                                <Link
                                  href={`/assignments/${assignment._id}/grade/${submission._id}`}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  {submission.marks !== undefined ? 'Edit Grade' : 'Grade'}
                                </Link>
                              </div>
                            </div>
                          </div>
                          {submission.feedback && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm font-medium">Feedback:</p>
                              <p className="text-sm text-gray-700">{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}