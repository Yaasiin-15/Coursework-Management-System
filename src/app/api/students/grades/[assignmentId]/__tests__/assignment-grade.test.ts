import { NextRequest } from 'next/server'
import { GET } from '../route'

// Mock dependencies
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('@/models/Submission', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn()
  }
}))

jest.mock('@/models/Assignment', () => ({
  __esModule: true,
  default: {
    findById: jest.fn()
  }
}))

jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn()
}))

describe('/api/students/grades/[assignmentId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when no token is provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/students/grades/123')
    
    const response = await GET(request, { params: { assignmentId: '123' } })
    const data = await response.json()
    
    expect(response.status).toBe(401)
    expect(data.error).toBe('No token provided')
  })

  it('should return 403 when user is not a student', async () => {
    const { verifyToken } = require('@/lib/auth')
    verifyToken.mockReturnValue({ userId: '123', role: 'teacher' })

    const request = new NextRequest('http://localhost:3000/api/students/grades/123', {
      headers: { authorization: 'Bearer valid-token' }
    })
    
    const response = await GET(request, { params: { assignmentId: '123' } })
    const data = await response.json()
    
    expect(response.status).toBe(403)
    expect(data.error).toBe('Unauthorized - Student access required')
  })

  it('should return 404 when submission is not found', async () => {
    const { verifyToken } = require('@/lib/auth')
    const Submission = require('@/models/Submission')
    
    verifyToken.mockReturnValue({ userId: '123', role: 'student' })
    Submission.findOne.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/students/grades/123', {
      headers: { authorization: 'Bearer valid-token' }
    })
    
    const response = await GET(request, { params: { assignmentId: '123' } })
    const data = await response.json()
    
    expect(response.status).toBe(404)
    expect(data.error).toBe('Submission not found')
  })

  it('should return grade details for a graded submission', async () => {
    const { verifyToken } = require('@/lib/auth')
    const Submission = require('@/models/Submission')
    
    verifyToken.mockReturnValue({ userId: '123', role: 'student' })
    
    const mockSubmission = {
      _id: 'submission123',
      assignmentId: {
        _id: 'assignment123',
        title: 'Test Assignment',
        description: 'Test Description',
        course: 'Computer Science',
        maxMarks: 100,
        deadline: new Date('2024-12-31'),
        classId: {
          _id: 'class123',
          name: 'CS101'
        }
      },
      fileName: 'test.pdf',
      submittedAt: new Date('2024-12-01'),
      status: 'graded',
      marks: 85,
      feedback: 'Great work!',
      gradedAt: new Date('2024-12-02'),
      gradedBy: {
        _id: 'teacher123',
        name: 'Dr. Smith',
        email: 'smith@university.edu'
      }
    }

    // Mock the Submission.findOne chain
    const mockPopulate = jest.fn().mockReturnThis()
    const mockLean = jest.fn().mockResolvedValue(mockSubmission)
    
    Submission.findOne.mockReturnValue({
      populate: mockPopulate,
      lean: mockLean,
    })

    const request = new NextRequest('http://localhost:3000/api/students/grades/123', {
      headers: { authorization: 'Bearer valid-token' }
    })
    
    const response = await GET(request, { params: { assignmentId: '123' } })
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.isGraded).toBe(true)
    expect(data.grade).toMatchObject({
      submissionId: 'submission123',
      assignmentTitle: 'Test Assignment',
      assignmentDescription: 'Test Description',
      assignmentMaxMarks: 100,
      course: 'Computer Science',
      className: 'CS101',
      fileName: 'test.pdf',
      status: 'graded',
      marks: 85,
      feedback: 'Great work!',
      gradedByName: 'Dr. Smith',
      gradedByEmail: 'smith@university.edu'
    })
  })

  it('should return submission details without grade for ungraded submission', async () => {
    const { verifyToken } = require('@/lib/auth')
    const Submission = require('@/models/Submission')
    
    verifyToken.mockReturnValue({ userId: '123', role: 'student' })
    
    const mockSubmission = {
      _id: 'submission123',
      assignmentId: {
        _id: 'assignment123',
        title: 'Test Assignment',
        description: 'Test Description',
        course: 'Computer Science',
        maxMarks: 100,
        deadline: new Date('2024-12-31'),
        classId: {
          _id: 'class123',
          name: 'CS101'
        }
      },
      fileName: 'test.pdf',
      submittedAt: new Date('2024-12-01'),
      status: 'submitted'
    }

    // Mock the Submission.findOne chain
    const mockPopulate = jest.fn().mockReturnThis()
    const mockLean = jest.fn().mockResolvedValue(mockSubmission)
    
    Submission.findOne.mockReturnValue({
      populate: mockPopulate,
      lean: mockLean,
    })

    const request = new NextRequest('http://localhost:3000/api/students/grades/123', {
      headers: { authorization: 'Bearer valid-token' }
    })
    
    const response = await GET(request, { params: { assignmentId: '123' } })
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.isGraded).toBe(false)
    expect(data.grade).toMatchObject({
      submissionId: 'submission123',
      assignmentTitle: 'Test Assignment',
      assignmentDescription: 'Test Description',
      assignmentMaxMarks: 100,
      course: 'Computer Science',
      className: 'CS101',
      fileName: 'test.pdf',
      status: 'submitted'
    })
    expect(data.grade.marks).toBeUndefined()
    expect(data.grade.feedback).toBeUndefined()
  })

  it('should handle database connection errors', async () => {
    const { verifyToken } = require('@/lib/auth')
    const Submission = require('@/models/Submission')
    
    verifyToken.mockReturnValue({ userId: '123', role: 'student' })
    Submission.findOne.mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/students/grades/123', {
      headers: { authorization: 'Bearer valid-token' }
    })
    
    const response = await GET(request, { params: { assignmentId: '123' } })
    const data = await response.json()
    
    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
