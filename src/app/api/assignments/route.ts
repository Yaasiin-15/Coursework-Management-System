import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import { authenticateRequest } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    let assignments
    if (user.role === 'teacher') {
      assignments = await Assignment.find({ createdBy: user.userId })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
    } else {
      assignments = await Assignment.find()
        .populate('createdBy', 'name email')
        .sort({ deadline: 1 })
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const { title, description, course, deadline, maxMarks } = await request.json()

    if (!title || !description || !course || !deadline || !maxMarks) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    const assignment = new Assignment({
      title,
      description,
      course,
      deadline: new Date(deadline),
      maxMarks: parseInt(maxMarks),
      createdBy: user.userId,
    })

    await assignment.save()

    return NextResponse.json(
      { message: 'Assignment created successfully', assignment },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}