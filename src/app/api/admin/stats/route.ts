import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Assignment from '@/models/Assignment'
import Submission from '@/models/Submission'
import { authenticateRequest } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalAssignments,
      totalSubmissions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Assignment.countDocuments(),
      Submission.countDocuments()
    ])

    const stats = {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalAssignments,
      totalSubmissions
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}