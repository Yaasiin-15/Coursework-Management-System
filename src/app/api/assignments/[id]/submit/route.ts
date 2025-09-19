import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Assignment from '@/models/Assignment'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Student access required' }, { status: 403 })
    }

    await connectDB()

    // Check if assignment exists and is not overdue
    const assignment = await Assignment.findById(params.id)
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    if (new Date() > new Date(assignment.deadline)) {
      return NextResponse.json(
        { error: 'Assignment deadline has passed' },
        { status: 400 }
      )
    }

    // Check if user already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId: params.id,
      studentId: decoded.userId
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this assignment' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = path.join(uploadsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create submission record
    const submission = new Submission({
      assignmentId: params.id,
      studentId: decoded.userId,
      fileName: file.name,
      fileUrl: fileName, // Store relative path
      status: new Date() > new Date(assignment.deadline) ? 'late' : 'submitted'
    })

    await submission.save()

    return NextResponse.json(
      { 
        success: true,
        message: 'Assignment submitted successfully', 
        submission 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}