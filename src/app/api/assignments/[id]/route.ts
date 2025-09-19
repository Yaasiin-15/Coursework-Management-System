import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import User from '@/models/User'
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

    const assignment = await Assignment.findById(params.id)
      .populate('createdBy', 'name email')

    if (!assignment) {
      return NextResponse.json(
        { message: 'Assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}