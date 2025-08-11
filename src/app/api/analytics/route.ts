import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import Submission from '@/models/Submission'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !['teacher', 'admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '6months'

    await connectDB()

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 6)
    }

    // Get basic counts
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalAssignments = await Assignment.countDocuments({
      createdAt: { $gte: startDate }
    })

    // Get submissions with grades
    const gradedSubmissions = await Submission.find({
      marks: { $exists: true, $ne: null },
      createdAt: { $gte: startDate }
    }).populate('assignmentId', 'maxMarks')

    // Calculate average grade
    let totalMarks = 0
    let totalMaxMarks = 0
    gradedSubmissions.forEach(submission => {
      totalMarks += submission.marks
      totalMaxMarks += submission.assignmentId.maxMarks
    })
    const averageGrade = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0

    // Calculate submission rate
    const totalSubmissions = await Submission.countDocuments({
      createdAt: { $gte: startDate }
    })
    const expectedSubmissions = totalAssignments * totalStudents
    const submissionRate = expectedSubmissions > 0 ? (totalSubmissions / expectedSubmissions) * 100 : 0

    // Grade distribution
    const gradeRanges = [
      { grade: 'A (90-100%)', min: 90, max: 100 },
      { grade: 'B (80-89%)', min: 80, max: 89 },
      { grade: 'C (70-79%)', min: 70, max: 79 },
      { grade: 'D (60-69%)', min: 60, max: 69 },
      { grade: 'F (0-59%)', min: 0, max: 59 }
    ]

    const gradeDistribution = gradeRanges.map(range => {
      const count = gradedSubmissions.filter(submission => {
        const percentage = (submission.marks / submission.assignmentId.maxMarks) * 100
        return percentage >= range.min && percentage <= range.max
      }).length
      return { grade: range.grade, count }
    })

    // Performance trend (monthly averages)
    const performanceTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthSubmissions = gradedSubmissions.filter(submission => 
        submission.createdAt >= monthStart && submission.createdAt <= monthEnd
      )

      let monthTotal = 0
      let monthMaxTotal = 0
      monthSubmissions.forEach(submission => {
        monthTotal += submission.marks
        monthMaxTotal += submission.assignmentId.maxMarks
      })

      const monthAverage = monthMaxTotal > 0 ? (monthTotal / monthMaxTotal) * 100 : 0
      
      performanceTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        average: Math.round(monthAverage * 10) / 10
      })
    }

    // Top performers
    const studentPerformance = new Map()
    gradedSubmissions.forEach(submission => {
      const studentId = submission.studentId.toString()
      if (!studentPerformance.has(studentId)) {
        studentPerformance.set(studentId, { total: 0, maxTotal: 0, name: '' })
      }
      const perf = studentPerformance.get(studentId)
      perf.total += submission.marks
      perf.maxTotal += submission.assignmentId.maxMarks
    })

    // Get student names and calculate averages
    const topPerformers = []
    for (const [studentId, perf] of Array.from(studentPerformance.entries())) {
      const student = await User.findById(studentId, 'name')
      if (student && perf.maxTotal > 0) {
        topPerformers.push({
          name: student.name,
          average: (perf.total / perf.maxTotal) * 100
        })
      }
    }
    topPerformers.sort((a, b) => b.average - a.average)
    topPerformers.splice(5) // Keep top 5

    // Assignment statistics
    const assignmentStats = await Assignment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'assignmentId',
          as: 'submissions'
        }
      },
      {
        $project: {
          title: 1,
          maxMarks: 1,
          submissions: {
            $filter: {
              input: '$submissions',
              cond: { $ne: ['$$this.marks', null] }
            }
          }
        }
      },
      {
        $project: {
          title: 1,
          submissions: { $size: '$submissions' },
          average: {
            $cond: {
              if: { $gt: [{ $size: '$submissions' }, 0] },
              then: {
                $multiply: [
                  { $divide: [{ $avg: '$submissions.marks' }, '$maxMarks'] },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      { $limit: 10 }
    ])

    return NextResponse.json({
      totalStudents,
      totalAssignments,
      averageGrade: Math.round(averageGrade * 10) / 10,
      submissionRate: Math.round(submissionRate * 10) / 10,
      gradeDistribution,
      performanceTrend,
      topPerformers,
      assignmentStats
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}