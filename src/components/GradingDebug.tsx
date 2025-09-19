'use client'

import { useState } from 'react'
import { Bug, Plus, Trash2 } from 'lucide-react'

export default function GradingDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const createTestSubmission = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/test/create-submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to create test submission' })
    } finally {
      setLoading(false)
    }
  }

  const deleteTestSubmissions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/test/create-submissions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to delete test submissions' })
    } finally {
      setLoading(false)
    }
  }

  const testGradingAPI = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // First get assignments
      const assignmentsResponse = await fetch('/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const assignmentsData = await assignmentsResponse.json()
      
      if (assignmentsData.assignments && assignmentsData.assignments.length > 0) {
        const firstAssignment = assignmentsData.assignments[0]
        
        // Then get submissions for the first assignment
        const submissionsResponse = await fetch(`/api/assignments/${firstAssignment._id}/submissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const submissionsData = await submissionsResponse.json()
        
        setResult({
          assignment: firstAssignment,
          submissionsResponse: submissionsData,
          submissionsCount: submissionsData.submissions ? submissionsData.submissions.length : 0
        })
      } else {
        setResult({ error: 'No assignments found' })
      }
    } catch (error) {
      setResult({ error: 'Failed to test grading API' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 z-50"
        title="Debug Grading"
      >
        <Bug className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Grading Debug</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={createTestSubmission}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Test Submission</span>
        </button>
        
        <button
          onClick={deleteTestSubmissions}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Test Submissions</span>
        </button>
        
        <button
          onClick={testGradingAPI}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          <Bug className="w-4 h-4" />
          <span>Test Grading API</span>
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
      
      {result && (
        <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-xs">
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}