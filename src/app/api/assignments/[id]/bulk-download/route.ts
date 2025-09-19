import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'
import { join } from 'path'
import archiver from 'archiver'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectDB()

    const submissions = await Submission.find({ assignmentId: params.id })
      .populate('studentId', 'name email')

    if (submissions.length === 0) {
      return NextResponse.json({ error: 'No submissions found' }, { status: 404 })
    }

    // Create a zip archive
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    // Set up the response headers
    const headers = new Headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="assignment-${params.id}-submissions.zip"`
    })

    const uploadsDir = join(process.cwd(), 'uploads')

    // Add files to the archive
    for (const submission of submissions) {
      try {
        const filePath = join(uploadsDir, submission.fileUrl)
        const studentName = submission.studentId.name.replace(/[^a-zA-Z0-9]/g, '_')
        const fileName = `${studentName}_${submission.fileName}`
        
        archive.file(filePath, { name: fileName })
      } catch (error) {
        console.error(`Error adding file for submission ${submission._id}:`, error)
      }
    }

    archive.finalize()

    // Convert archive stream to buffer
    const chunks: Buffer[] = []
    archive.on('data', (chunk) => chunks.push(chunk))
    
    return new Promise<NextResponse>((resolve) => {
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(new NextResponse(buffer, { headers }))
      })
    })

  } catch (error) {
    console.error('Error creating bulk download:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}