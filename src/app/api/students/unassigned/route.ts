import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { authenticateRequest } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Find students who are not assigned to any class
    const unassignedStudents = await User.find({
      role: 'student',
      classId: { $exists: false }
    }).select('name email _id')

    return NextResponse.json({ students: unassignedStudents })
  } catch (error) {
    console.error('Error fetching unassigned students:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}