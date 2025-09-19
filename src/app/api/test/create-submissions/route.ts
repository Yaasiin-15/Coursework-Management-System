import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Assignment from '@/models/Assignment'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'teacher' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized - Teacher/Admin access required' }, { status: 403 })
    }

    await connectDB()

    // Get the first assignment and first student
    const assignment = await Assignment.findOne().lean()
    const student = await User.findOne({ role: 'student' }).lean()

    if (!assignment || !student) {
      return NextResponse.json({ 
        error: 'No assignment or student found. Please create an assignment and student first.' 
      }, { status: 400 })
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      assignmentId: assignment._id,
      studentId: student._id
    })

    if (existingSubmission) {
      return NextResponse.json({ 
        message: 'Test submission already exists',
        submission: existingSubmission
      })
    }

    // Create a test submission
    const testSubmission = new Submission({
      assignmentId: assignment._id,
      studentId: student._id,
      fileName: 'test-submission.pdf',
      fileUrl: 'test-files/test-submission.pdf',
      status: 'submitted',
      submittedAt: new Date()
    })

    await testSubmission.save()

    // Populate the submission for response
    const populatedSubmission = await Submission.findById(testSubmission._id)
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title')
      .lean()

    return NextResponse.json({
      success: true,
      message: 'Test submission created successfully',
      submission: populatedSubmission,
      assignment: {
        id: assignment._id,
        title: assignment.title
      },
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    })
  } catch (error) {
    console.error('Error creating test submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'teacher' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized - Teacher/Admin access required' }, { status: 403 })
    }

    await connectDB()

    // Delete all test submissions
    const result = await Submission.deleteMany({ fileUrl: 'test-files/test-submission.pdf' })

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} test submissions`
    })
  } catch (error) {
    console.error('Error deleting test submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}