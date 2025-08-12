import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'
import User from '@/models/User'
import { authenticateRequest } from '@/middleware/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(request)
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const { studentId } = await request.json()
    const classId = params.id

    if (!studentId) {
      return NextResponse.json(
        { message: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Find the class
    const classDoc = await Class.findById(classId)
    if (!classDoc) {
      return NextResponse.json(
        { message: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if teacher owns this class (unless admin)
    if (user.role === 'teacher' && classDoc.teacher.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the student
    const student = await User.findById(studentId)
    if (!student || student.role !== 'student') {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if student is already in a class
    if (student.classId) {
      return NextResponse.json(
        { message: 'Student is already assigned to a class' },
        { status: 400 }
      )
    }

    // Add student to class
    classDoc.students.push(studentId)
    await classDoc.save()

    // Update student's classId
    student.classId = classId
    await student.save()

    return NextResponse.json(
      { message: 'Student added to class successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error adding student to class:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(request)
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const { studentId } = await request.json()
    const classId = params.id

    if (!studentId) {
      return NextResponse.json(
        { message: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Find the class
    const classDoc = await Class.findById(classId)
    if (!classDoc) {
      return NextResponse.json(
        { message: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if teacher owns this class (unless admin)
    if (user.role === 'teacher' && classDoc.teacher.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Remove student from class
    classDoc.students = classDoc.students.filter(
      (id: any) => id.toString() !== studentId
    )
    await classDoc.save()

    // Remove classId from student
    await User.findByIdAndUpdate(studentId, { $unset: { classId: 1 } })

    return NextResponse.json(
      { message: 'Student removed from class successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error removing student from class:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}