'use client'

import { useState, useEffect } from 'react'
import { Download, Save, FileText, User } from 'lucide-react'

interface Submission {
  _id: string
  studentId: {
    _id: string
    name: string
    email: string
  }
  fileName: string
  fileUrl: string
  submittedAt: string
  marks?: number
  feedback?: string
  status: 'submitted' | 'graded' | 'late'
}

interface GradingInterfaceProps {
  assignmentId: string
  maxMarks: number
  onClose: () => void
}

export default function GradingInterface({ assignmentId, maxMarks, onClose }: GradingInterfaceProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [marks, setMarks] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [assignmentId])

  useEffect(() => {
    if (selectedSubmission) {
      setMarks(selectedSubmission.marks || 0)
      setFeedback(selectedSubmission.feedback || '')
    }
  }, [selectedSubmission])

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
        if (data.submissions.length > 0) {
          setSelectedSubmission(data.submissions[0])
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/files/download?path=${encodeURIComponent(fileUrl)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/submissions/${selectedSubmission._id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ marks, feedback })
      })

      if (response.ok) {
        // Update local state
        setSubmissions(prev => prev.map(sub => 
          sub._id === selectedSubmission._id 
            ? { ...sub, marks, feedback, status: 'graded' as const }
            : sub
        ))
        setSelectedSubmission(prev => prev ? { ...prev, marks, feedback, status: 'graded' } : null)
      }
    } catch (error) {
      console.error('Error saving grade:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleBulkDownload = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/assignments/${assignmentId}/bulk-download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `assignment-${assignmentId}-submissions.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading bulk files:', error)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Grading Interface ({submissions.length} submissions)
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Bulk Download</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Submissions List */}
          <div className="w-1/3 border-r dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Submissions</h3>
              {submissions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
              ) : (
                <div className="space-y-2">
                  {submissions.map((submission) => (
                    <div
                      key={submission._id}
                      onClick={() => setSelectedSubmission(submission)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedSubmission?._id === submission._id
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {submission.studentId.name}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          submission.status === 'graded' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : submission.status === 'late'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {submission.fileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                      {submission.marks !== undefined && (
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                          {submission.marks}/{maxMarks} marks
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grading Panel */}
          <div className="flex-1 flex flex-col">
            {selectedSubmission ? (
              <>
                {/* Student Info */}
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedSubmission.studentId.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedSubmission.studentId.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(selectedSubmission.fileUrl, selectedSubmission.fileName)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Grading Form */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Marks (out of {maxMarks})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={maxMarks}
                        value={marks}
                        onChange={(e) => setMarks(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Feedback
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Provide detailed feedback for the student..."
                      />
                    </div>

                    <button
                      onClick={handleSaveGrade}
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Grade'}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a submission to start grading</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}