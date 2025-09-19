import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Assignment from '@/models/Assignment'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Student access required' }, { status: 403 })
    }

    await dbConnect()

    // Find the student's submission for this assignment
    const submission = await Submission.findOne({
      assignmentId: params.assignmentId,
      studentId: decoded.userId
    })
      .populate({
        path: 'assignmentId',
        select: 'title description course maxMarks deadline classId',
        populate: {
          path: 'classId',
          select: 'name'
        }
      })
      .populate('gradedBy', 'name email')
      .lean()

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Type assertion for populated data
    const populatedSubmission = submission as any

    // Check if the submission has been graded
    const isGraded = populatedSubmission.status === 'graded' && 
                    typeof populatedSubmission.marks === 'number'

    const gradeDetails = {
      submissionId: populatedSubmission._id,
      assignmentTitle: populatedSubmission.assignmentId?.title || 'Unknown Assignment',
      assignmentDescription: populatedSubmission.assignmentId?.description || '',
      assignmentMaxMarks: populatedSubmission.assignmentId?.maxMarks || 0,
      course: populatedSubmission.assignmentId?.course || '',
      className: populatedSubmission.assignmentId?.classId?.name || '',
      deadline: populatedSubmission.assignmentId?.deadline,
      fileName: populatedSubmission.fileName || '',
      submittedAt: populatedSubmission.submittedAt,
      status: populatedSubmission.status,
      // Only include grade information if graded
      ...(isGraded && {
        marks: populatedSubmission.marks,
        feedback: populatedSubmission.feedback || '',
        gradedAt: populatedSubmission.gradedAt,
        gradedByName: populatedSubmission.gradedBy?.name || 'Unknown Teacher',
        gradedByEmail: populatedSubmission.gradedBy?.email || ''
      })
    }

    return NextResponse.json({
      success: true,
      grade: gradeDetails,
      isGraded
    })

  } catch (error) {
    console.error('Error fetching assignment grade:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}