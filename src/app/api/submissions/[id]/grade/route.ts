import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import { verifyToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'teacher' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized - Teacher access required' }, { status: 403 })
    }

    const { marks, feedback } = await request.json()

    if (marks === undefined || marks < 0) {
      return NextResponse.json({ error: 'Valid marks required' }, { status: 400 })
    }

    await connectDB()

    const submission = await Submission.findByIdAndUpdate(
      params.id,
      {
        marks: Number(marks),
        feedback: feedback || '',
        status: 'graded',
        gradedAt: new Date(),
        gradedBy: decoded.userId
      },
      { new: true }
    ).populate('studentId', 'name email').lean()

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Grade saved successfully',
      submission 
    })
  } catch (error) {
    console.error('Error saving grade:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}