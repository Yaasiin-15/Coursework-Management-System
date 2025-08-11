'use client'

import { useState } from 'react'
import { Download, Mail, Trash2, CheckSquare, Square } from 'lucide-react'

interface Assignment {
  _id: string
  title: string
  course: string
  deadline: string
  maxMarks: number
}

interface BulkOperationsProps {
  assignments: Assignment[]
  selectedAssignments: string[]
  onSelectionChange: (selected: string[]) => void
  onBulkAction: (action: string, assignmentIds: string[]) => void
}

export default function BulkOperations({ 
  assignments, 
  selectedAssignments, 
  onSelectionChange, 
  onBulkAction 
}: BulkOperationsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectAll = () => {
    if (selectedAssignments.length === assignments.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(assignments.map(a => a._id))
    }
  }

  const handleSelectAssignment = (assignmentId: string) => {
    if (selectedAssignments.includes(assignmentId)) {
      onSelectionChange(selectedAssignments.filter(id => id !== assignmentId))
    } else {
      onSelectionChange([...selectedAssignments, assignmentId])
    }
  }

  const bulkActions = [
    {
      id: 'download',
      label: 'Download All Submissions',
      icon: Download,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => onBulkAction('download', selectedAssignments)
    },
    {
      id: 'email',
      label: 'Send Reminder Emails',
      icon: Mail,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => onBulkAction('email', selectedAssignments)
    },
    {
      id: 'delete',
      label: 'Delete Assignments',
      icon: Trash2,
      color: 'bg-red-600 hover:bg-red-700',
      action: () => onBulkAction('delete', selectedAssignments)
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 transition-colors">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bulk Operations
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Select All */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {selectedAssignments.length === assignments.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                {selectedAssignments.length === assignments.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedAssignments.length} of {assignments.length} selected
            </span>
          </div>

          {/* Assignment List */}
          <div className="max-h-60 overflow-y-auto scrollbar-thin space-y-2">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <button
                  onClick={() => handleSelectAssignment(assignment._id)}
                  className="flex-shrink-0"
                >
                  {selectedAssignments.includes(assignment._id) ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {assignment.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {assignment.course} • Due: {new Date(assignment.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedAssignments.length > 0 && (
            <div className="pt-4 border-t dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Actions for {selectedAssignments.length} assignment(s):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {bulkActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className={`flex items-center justify-center space-x-2 px-3 py-2 text-sm text-white rounded-lg transition-colors ${action.color}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{action.label}</span>
                      <span className="sm:hidden">
                        {action.label.split(' ')[0]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}