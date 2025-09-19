import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'
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

    // Get total counts
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalClasses = await Class.countDocuments()
    const unassignedStudents = await User.countDocuments({ 
      role: 'student', 
      classId: { $exists: false } 
    })

    // Get class distribution
    const classes = await Class.find()
      .populate('teacher', 'name')
      .populate('students', 'name')
      .sort({ name: 1 })

    const classDistribution = classes.map(cls => ({
      className: cls.name,
      studentCount: cls.students.length,
      teacherName: cls.teacher.name
    }))

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentStudents = await User.find({
      role: 'student',
      createdAt: { $gte: thirtyDaysAgo }
    })
    .populate('classId', 'name')
    .sort({ createdAt: -1 })
    .limit(10)

    const recentRegistrations = recentStudents.map(student => ({
      name: student.name,
      email: student.email,
      registeredAt: student.createdAt,
      className: student.classId?.name || null
    }))

    return NextResponse.json({
      totalStudents,
      totalClasses,
      unassignedStudents,
      classDistribution,
      recentRegistrations
    })

  } catch (error) {
    console.error('Error fetching student analytics:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}