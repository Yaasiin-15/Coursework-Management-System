import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Class from '@/models/Class'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { name, email, password, role, classId } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate that students have a classId
    if (role === 'student' && !classId) {
      return NextResponse.json(
        { message: 'Class selection is required for students' },
        { status: 400 }
      )
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      )
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    const userData: any = {
      name,
      email,
      role,
      passwordHash,
    }

    // Add classId for students
    if (role === 'student' && classId) {
      userData.classId = classId
    }

    const user = new User(userData)
    await user.save()

    // If user is a student, add them to the class's student list
    if (role === 'student' && classId) {
      await Class.findByIdAndUpdate(
        classId,
        { $addToSet: { students: user._id } }, // $addToSet prevents duplicates
        { new: true }
      )
    }

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('E11000')) {
        return NextResponse.json(
          { message: 'User already exists with this email' },
          { status: 409 }
        )
      }
      
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { message: 'Validation error: ' + error.message },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}