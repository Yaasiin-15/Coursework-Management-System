import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import Submission from '@/models/Submission'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'
import { emailService } from '@/lib/emailService'
import archiver from 'archiver'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { action, assignmentIds } = await request.json()

    if (!action || !assignmentIds || !Array.isArray(assignmentIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    await connectDB()

    switch (action) {
      case 'download':
        return await handleBulkDownload(assignmentIds)
      
      case 'email':
        return await handleBulkEmail(assignmentIds)
      
      case 'delete':
        return await handleBulkDelete(assignmentIds, decoded.userId)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in bulk operations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleBulkDownload(assignmentIds: string[]) {
  try {
    const submissions = await Submission.find({ 
      assignmentId: { $in: assignmentIds } 
    }).populate('studentId', 'name email').populate('assignmentId', 'title')

    if (submissions.length === 0) {
      return NextResponse.json({ error: 'No submissions found' }, { status: 404 })
    }

    // Create a zip archive
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    const headers = new Headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="bulk-submissions.zip"'
    })

    const uploadsDir = join(process.cwd(), 'uploads')

    // Group submissions by assignment
    const submissionsByAssignment = submissions.reduce((acc, submission) => {
      const assignmentTitle = submission.assignmentId.title.replace(/[^a-zA-Z0-9]/g, '_')
      if (!acc[assignmentTitle]) {
        acc[assignmentTitle] = []
      }
      acc[assignmentTitle].push(submission)
      return acc
    }, {} as Record<string, any[]>)

    // Add files to archive organized by assignment
    for (const [assignmentTitle, assignmentSubmissions] of Object.entries(submissionsByAssignment)) {
      for (const submission of assignmentSubmissions as any[]) {
        try {
          const filePath = join(uploadsDir, submission.fileUrl)
          const studentName = submission.studentId.name.replace(/[^a-zA-Z0-9]/g, '_')
          const fileName = `${assignmentTitle}/${studentName}_${submission.fileName}`
          
          archive.file(filePath, { name: fileName })
        } catch (error) {
          console.error(`Error adding file for submission ${submission._id}:`, error)
        }
      }
    }

    archive.finalize()

    // Convert archive stream to buffer
    const chunks: Buffer[] = []
    archive.on('data', (chunk: Buffer) => chunks.push(chunk))
    
    return new Promise<NextResponse>((resolve) => {
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(new NextResponse(buffer, { headers }))
      })
    })

  } catch (error) {
    console.error('Error in bulk download:', error)
    throw error
  }
}

async function handleBulkEmail(assignmentIds: string[]) {
  try {
    const assignments = await Assignment.find({ 
      _id: { $in: assignmentIds } 
    })

    const students = await User.find({ role: 'student' })
    
    let emailsSent = 0
    let emailsFailed = 0

    for (const assignment of assignments) {
      for (const student of students) {
        // Check if student has already submitted
        const submission = await Submission.findOne({
          assignmentId: assignment._id,
          studentId: student._id
        })

        if (!submission) {
          // Calculate days until due
          const now = new Date()
          const dueDate = new Date(assignment.deadline)
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntilDue >= 0) {
            const result = await emailService.sendDueDateReminder(
              student.email,
              student.name,
              assignment,
              daysUntilDue
            )

            if (result.success) {
              emailsSent++
            } else {
              emailsFailed++
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Bulk email operation completed',
      emailsSent,
      emailsFailed
    })
  } catch (error) {
    console.error('Error in bulk email:', error)
    throw error
  }
}

async function handleBulkDelete(assignmentIds: string[], teacherId: string) {
  try {
    // Verify that all assignments belong to the teacher
    const assignments = await Assignment.find({
      _id: { $in: assignmentIds },
      createdBy: teacherId
    })

    if (assignments.length !== assignmentIds.length) {
      return NextResponse.json({ 
        error: 'Some assignments do not belong to you' 
      }, { status: 403 })
    }

    // Delete related submissions first
    await Submission.deleteMany({ assignmentId: { $in: assignmentIds } })

    // Delete assignments
    const result = await Assignment.deleteMany({ 
      _id: { $in: assignmentIds },
      createdBy: teacherId
    })

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} assignment(s) and their submissions`
    })
  } catch (error) {
    console.error('Error in bulk delete:', error)
    throw error
  }
}