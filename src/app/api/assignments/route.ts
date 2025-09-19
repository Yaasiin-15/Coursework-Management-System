import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import User from '@/models/User'
import Class from '@/models/Class'
import { authenticateRequest } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Starting assignments GET request')
    
    const user = authenticateRequest(request)
    console.log('Authentication result:', user ? 'Success' : 'Failed')
    
    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json(
        { message: 'Unauthorized - No valid token provided' },
        { status: 401 }
      )
    }

    console.log('Connecting to database...')
    await dbConnect()
    console.log('Database connected successfully')

    let assignments
    if (user.role === 'teacher') {
      console.log('Fetching assignments for teacher:', user.userId)
      assignments = await Assignment.find({ createdBy: user.userId })
        .populate('createdBy', 'name email')
        .populate('classId', 'name code')
        .sort({ createdAt: -1 })
        .lean()
    } else if (user.role === 'student') {
      console.log('Fetching assignments for student:', user.userId)
      // Students only see assignments for their class
      const userDoc = await User.findById(user.userId).lean() as any
      console.log('User document found:', !!userDoc)
      
      if (!userDoc) {
        console.log('User not found in database')
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }
      
      if (!userDoc.classId) {
        console.log('Student has no class assigned')
        return NextResponse.json({ assignments: [] })
      }
      
      assignments = await Assignment.find({ classId: userDoc.classId })
        .populate('createdBy', 'name email')
        .populate('classId', 'name code')
        .sort({ deadline: 1 })
        .lean()
    } else {
      console.log('Fetching all assignments for admin')
      // Admins see all assignments
      assignments = await Assignment.find()
        .populate('createdBy', 'name email')
        .populate('classId', 'name code')
        .sort({ deadline: 1 })
        .lean()
    }

    console.log('Assignments fetched successfully, count:', assignments.length)
    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { message: 'Unauthorized - Teacher access required' },
        { status: 401 }
      )
    }

    await dbConnect()

    const { title, description, course, deadline, maxMarks, classId } = await request.json()

    if (!title || !description || !course || !deadline || !maxMarks || !classId) {
      return NextResponse.json(
        { message: 'All fields including class are required' },
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
      classId,
    })

    await assignment.save()

    return NextResponse.json(
      { message: 'Assignment created successfully', assignment },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}