'use client'

import { useState, useEffect } from 'react'
import { Download, Save, FileText, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

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

  // Auto-refresh submissions every 30 seconds to show real-time status changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubmissions()
    }, 30000)

    return () => clearInterval(interval)
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
      if (!token) {
        alert('Please log in again')
        return
      }

      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Submissions data:', data)
        
        if (data.success && data.submissions) {
          setSubmissions(data.submissions)
          if (data.submissions.length > 0) {
            setSelectedSubmission(data.submissions[0])
          }
        } else {
          console.error('No submissions found or invalid response format')
        }
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Error fetching submissions: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
      alert('Error fetching submissions. Please try again.')
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
    if (!selectedSubmission) {
      alert('No submission selected')
      return
    }

    if (marks < 0 || marks > maxMarks) {
      alert(`Marks must be between 0 and ${maxMarks}`)
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please log in again')
        return
      }

      console.log('Saving grade:', { marks, feedback, submissionId: selectedSubmission._id })

      const response = await fetch(`/api/submissions/${selectedSubmission._id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ marks: Number(marks), feedback })
      })

      const data = await response.json()
      console.log('Grade save response:', data)

      if (response.ok && data.success) {
        // Update local state
        setSubmissions(prev => prev.map(sub =>
          sub._id === selectedSubmission._id
            ? { ...sub, marks: Number(marks), feedback, status: 'graded' as const }
            : sub
        ))
        setSelectedSubmission(prev => prev ? { ...prev, marks: Number(marks), feedback, status: 'graded' } : null)

        // Show success message
        alert(`Grade saved successfully! ${selectedSubmission.studentId.name}'s submission has been graded.`)
      } else {
        console.error('Error response:', data)
        alert(`Error saving grade: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving grade:', error)
      alert('Error saving grade. Please check your connection and try again.')
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
          <p className="mt-2 text-xs text-gray-500">Assignment ID: {assignmentId}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-full sm:h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Grading Interface
            </h2>
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center space-y-2 xs:space-y-0 xs:space-x-2">
              <button
                onClick={handleBulkDownload}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">Bulk Download</span>
                <span className="xs:hidden">Download All</span>
              </button>
              <button
                onClick={onClose}
                className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>

          {/* Submission Statistics */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">
                Total: {submissions.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-gray-600 dark:text-gray-300">
                Complete: {submissions.filter(s => s.status === 'graded').length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-gray-600 dark:text-gray-300">
                Submitted: {submissions.filter(s => s.status === 'submitted').length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-gray-600 dark:text-gray-300">
                Late: {submissions.filter(s => s.status === 'late').length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Submissions List */}
          <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r dark:border-gray-700 overflow-y-auto max-h-64 lg:max-h-none">
            <div className="p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">Submissions</h3>
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No submissions found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                    Students haven't submitted any work for this assignment yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {submissions.map((submission) => {
                    const getStatusIcon = () => {
                      switch (submission.status) {
                        case 'graded':
                          return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        case 'late':
                          return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        default:
                          return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      }
                    }

                    const getStatusText = () => {
                      switch (submission.status) {
                        case 'graded':
                          return 'Complete'
                        case 'late':
                          return 'Late Submission'
                        default:
                          return 'Submitted'
                      }
                    }

                    return (
                      <div
                        key={submission._id}
                        onClick={() => setSelectedSubmission(submission)}
                        className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-colors border ${selectedSubmission?._id === submission._id
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {submission.studentId.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {getStatusIcon()}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                            {submission.fileName}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${submission.status === 'graded'
                              ? 'text-green-600 dark:text-green-400'
                              : submission.status === 'late'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                              }`}>
                              {getStatusText()}
                            </span>

                            {submission.marks !== undefined && (
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {submission.marks}/{maxMarks}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Grading Panel */}
          <div className="flex-1 flex flex-col">
            {selectedSubmission ? (
              <>
                {/* Student Info */}
                <div className="p-3 sm:p-6 border-b dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-3 mb-2 space-y-2 xs:space-y-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {selectedSubmission.studentId.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {selectedSubmission.status === 'graded' ? (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs sm:text-sm">
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden xs:inline">Complete</span>
                            </div>
                          ) : selectedSubmission.status === 'late' ? (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs sm:text-sm">
                              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden xs:inline">Late</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs sm:text-sm">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden xs:inline">Submitted</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <p className="truncate">{selectedSubmission.studentId.email}</p>
                        <p className="truncate">File: {selectedSubmission.fileName}</p>
                        <p>Submitted: {new Date(selectedSubmission.submittedAt).toLocaleDateString()}</p>
                        {selectedSubmission.marks !== undefined && (
                          <p className="font-medium text-blue-600 dark:text-blue-400">
                            Current Grade: {selectedSubmission.marks}/{maxMarks} marks
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(selectedSubmission.fileUrl, selectedSubmission.fileName)}
                      className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Grading Form */}
                <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
                  <div className="space-y-4 sm:space-y-6">
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Feedback
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base resize-none"
                        placeholder="Provide detailed feedback for the student..."
                      />
                    </div>

                    <button
                      onClick={handleSaveGrade}
                      disabled={saving}
                      className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-sm sm:text-base"
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