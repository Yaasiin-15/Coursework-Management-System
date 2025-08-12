'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, UserPlus, UserMinus, BookOpen } from 'lucide-react'

interface Class {
  _id: string
  name: string
  code: string
  description?: string
  teacher: {
    _id: string
    name: string
    email: string
  }
  students: Array<{
    _id: string
    name: string
    email: string
  }>
}

interface Student {
  _id: string
  name: string
  email: string
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([])
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [newClass, setNewClass] = useState({
    name: '',
    code: '',
    description: ''
  })

  useEffect(() => {
    fetchClasses()
    fetchUnassignedStudents()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      const data = await response.json()
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnassignedStudents = async () => {
    try {
      const response = await fetch('/api/students/unassigned')
      const data = await response.json()
      setUnassignedStudents(data.students || [])
    } catch (error) {
      console.error('Error fetching unassigned students:', error)
    }
  }

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      })

      if (response.ok) {
        setNewClass({ name: '', code: '', description: '' })
        setShowCreateForm(false)
        fetchClasses()
      }
    } catch (error) {
      console.error('Error creating class:', error)
    }
  }

  const addStudentToClass = async (classId: string, studentId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })

      if (response.ok) {
        fetchClasses()
        fetchUnassignedStudents()
      }
    } catch (error) {
      console.error('Error adding student to class:', error)
    }
  }

  const removeStudentFromClass = async (classId: string, studentId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/students`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })

      if (response.ok) {
        fetchClasses()
        fetchUnassignedStudents()
      }
    } catch (error) {
      console.error('Error removing student from class:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Class Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Class
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Class</h2>
          <form onSubmit={createClass} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class Name</label>
              <input
                type="text"
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class Code</label>
              <input
                type="text"
                value={newClass.code}
                onChange={(e) => setNewClass({ ...newClass, code: e.target.value.toUpperCase() })}
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., CS101"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create Class
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {classes.map((classItem) => (
          <div key={classItem._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen size={20} />
                  {classItem.name} ({classItem.code})
                </h3>
                <p className="text-gray-600">Teacher: {classItem.teacher.name}</p>
                {classItem.description && (
                  <p className="text-gray-500 mt-1">{classItem.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={16} />
                {classItem.students.length} students
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Students in this class:</h4>
              {classItem.students.length === 0 ? (
                <p className="text-gray-500 italic">No students assigned yet</p>
              ) : (
                <div className="grid gap-2">
                  {classItem.students.map((student) => (
                    <div key={student._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{student.name} ({student.email})</span>
                      <button
                        onClick={() => removeStudentFromClass(classItem._id, student._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {unassignedStudents.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Add students:</h5>
                  <div className="grid gap-2">
                    {unassignedStudents.map((student) => (
                      <div key={student._id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span>{student.name} ({student.email})</span>
                        <button
                          onClick={() => addStudentToClass(classItem._id, student._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <UserPlus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
          <p className="text-gray-500">Create your first class to get started</p>
        </div>
      )}
    </div>
  )
}