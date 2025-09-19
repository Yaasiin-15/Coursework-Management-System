import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import User from '@/models/User'
import Assignment from '@/models/Assignment'
import { verifyToken } from '@/lib/auth'
import { plagiarismService } from '@/lib/plagiarismService'

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
    if (!decoded || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectDB()

    // Get the submission to check
    const submission = await Submission.findById(params.id)
      .populate('assignmentId', 'title')
      .populate('studentId', 'name email')

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Get other submissions for the same assignment (excluding the current one)
    const otherSubmissions = await Submission.find({
      assignmentId: submission.assignmentId._id,
      _id: { $ne: submission._id }
    })

    const otherFilePaths = otherSubmissions.map(sub => sub.fileUrl)

    // Run plagiarism check
    const result = await plagiarismService.checkPlagiarism(
      submission.fileUrl,
      otherFilePaths
    )

    // Generate report
    const report = plagiarismService.generateReport(result)

    // Save plagiarism check result to submission
    await Submission.findByIdAndUpdate(params.id, {
      plagiarismCheck: {
        similarity: result.similarity,
        matches: result.matches,
        report,
        checkedAt: new Date(),
        checkedBy: decoded.userId
      }
    })

    return NextResponse.json({
      similarity: result.similarity,
      matches: result.matches,
      report,
      riskLevel: result.similarity > 0.7 ? 'HIGH' : 
                 result.similarity > 0.4 ? 'MEDIUM' : 
                 result.similarity > 0.2 ? 'LOW' : 'CLEAR'
    })
  } catch (error) {
    console.error('Error in plagiarism check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}