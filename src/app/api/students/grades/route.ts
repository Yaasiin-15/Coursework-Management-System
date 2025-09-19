import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Assignment from '@/models/Assignment'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Student access required' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const assignmentId = searchParams.get('assignmentId')

    await dbConnect()

    // Build query for submissions
    const submissionQuery: any = {
      studentId: decoded.userId,
      status: 'graded' // Only return graded submissions
    }

    // Add filters if provided
    if (assignmentId) {
      submissionQuery.assignmentId = assignmentId
    }

    // Find all graded submissions for the student
    let submissions = await Submission.find(submissionQuery)
      .populate({
        path: 'assignmentId',
        select: 'title description course maxMarks deadline classId',
        populate: {
          path: 'classId',
          select: 'name'
        }
      })
      .populate('gradedBy', 'name')
      .sort({ gradedAt: -1 })
      .lean()

    // Filter by classId if provided (after population)
    if (classId) {
      submissions = submissions.filter(sub => 
        sub.assignmentId?.classId?._id?.toString() === classId
      )
    }

    // Transform data for frontend consumption
    const grades = submissions.map(submission => ({
      submissionId: submission._id,
      assignmentTitle: submission.assignmentId?.title || 'Unknown Assignment',
      assignmentDescription: submission.assignmentId?.description || '',
      assignmentMaxMarks: submission.assignmentId?.maxMarks || 0,
      course: submission.assignmentId?.course || '',
      className: submission.assignmentId?.classId?.name || '',
      marks: submission.marks,
      feedback: submission.feedback || '',
      status: 'graded',
      submittedAt: submission.submittedAt,
      gradedAt: submission.gradedAt,
      gradedByName: submission.gradedBy?.name || 'Unknown Teacher',
      deadline: submission.assignmentId?.deadline
    }))

    return NextResponse.json({
      success: true,
      grades,
      total: grades.length
    })

  } catch (error) {
    console.error('Error fetching student grades:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}