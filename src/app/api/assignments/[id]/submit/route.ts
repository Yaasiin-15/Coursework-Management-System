import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import dbConnect from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Assignment from '@/models/Assignment'
import { authenticateRequest } from '@/middleware/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(request)
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Check if assignment exists and is not overdue
    const assignment = await Assignment.findById(params.id)
    if (!assignment) {
      return NextResponse.json(
        { message: 'Assignment not found' },
        { status: 404 }
      )
    }

    if (new Date() > new Date(assignment.deadline)) {
      return NextResponse.json(
        { message: 'Assignment deadline has passed' },
        { status: 400 }
      )
    }

    // Check if user already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId: params.id,
      studentId: user.userId
    })

    if (existingSubmission) {
      return NextResponse.json(
        { message: 'You have already submitted this assignment' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
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
      studentId: user.userId,
      fileName: file.name,
      fileUrl: `/uploads/${fileName}`,
      status: new Date() > new Date(assignment.deadline) ? 'late' : 'submitted'
    })

    await submission.save()

    return NextResponse.json(
      { message: 'Assignment submitted successfully', submission },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}