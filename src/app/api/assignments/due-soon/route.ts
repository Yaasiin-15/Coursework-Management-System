import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await connectDB()

    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))

    let assignments
    if (decoded.role === 'student') {
      assignments = await Assignment.find({
        deadline: {
          $gte: now,
          $lte: threeDaysFromNow
        }
      }).populate('createdBy', 'name')
    } else {
      assignments = await Assignment.find({
        createdBy: decoded.userId,
        deadline: {
          $gte: now,
          $lte: threeDaysFromNow
        }
      })
    }

    const assignmentsWithDays = assignments.map(assignment => {
      const daysUntilDue = Math.ceil((new Date(assignment.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        ...assignment.toObject(),
        daysUntilDue
      }
    })

    return NextResponse.json({ assignments: assignmentsWithDays })
  } catch (error) {
    console.error('Error fetching due assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}