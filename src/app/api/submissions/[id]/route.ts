import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Submission from '@/models/Submission'
import User from '@/models/User'
import Assignment from '@/models/Assignment'
import { authenticateRequest } from '@/middleware/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const submission = await Submission.findById(params.id)
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title course maxMarks')

    if (!submission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to view this submission
    if (user.role === 'student' && submission.studentId._id.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}