'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, Edit, Trash2, UserPlus, UserMinus } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface Class {
  _id: string
  name: string
  description: string
  code: string
  teacher: User
  students: User[]
  createdAt: string
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: ''
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingClass ? `/api/classes/${editingClass._id}` : '/api/classes'
      const method = editingClass ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchClasses()
        setShowCreateForm(false)
        setEditingClass(null)
        setFormData({ name: '', description: '', code: '' })
      }
    } catch (error) {
      console.error('Error saving class:', error)
    }
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      description: classItem.description,
      code: classItem.code
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchClasses()
      }
    } catch (error) {
      console.error('Error deleting class:', error)
    }
  }

  const cancelForm = () => {
    setShowCreateForm(false)
    setEditingClass(null)
    setFormData({ name: '', description: '', code: '' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your classes and students</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Class</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingClass ? 'Edit Class' : 'Create New Class'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Class Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Class Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {editingClass ? 'Update Class' : 'Create Class'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes List */}
      <div className="grid gap-6">
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No classes yet</h3>
            <p className="text-gray-600 dark:text-gray-300">Create your first class to get started</p>
          </div>
        ) : (
          classes.map((classItem) => (
            <div key={classItem._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {classItem.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Code: {classItem.code}
                  </p>
                  {classItem.description && (
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      {classItem.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(classItem._id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Students ({classItem.students.length})
                  </h4>
                  <div className="flex space-x-2">
                    <button className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors">
                      <UserPlus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {classItem.students.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No students enrolled</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classItem.students.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {student.email}
                          </p>
                        </div>
                        <button className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 p-1 rounded transition-colors">
                          <UserMinus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}