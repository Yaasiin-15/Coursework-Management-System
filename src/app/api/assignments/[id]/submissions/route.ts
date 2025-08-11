import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Submission from '@/models/Submission'
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

    let submissions
    let userSubmission = null

    if (user.role === 'teacher') {
      submissions = await Submission.find({ assignmentId: params.id })
        .populate('studentId', 'name email')
        .sort({ submittedAt: -1 })
    } else {
      submissions = []
      userSubmission = await Submission.findOne({ 
        assignmentId: params.id, 
        studentId: user.userId 
      })
    }

    return NextResponse.json({ submissions, userSubmission })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}