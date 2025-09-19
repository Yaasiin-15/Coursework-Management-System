import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'
import User from '@/models/User'
import { authenticateRequest } from '@/middleware/auth'

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const { action, studentIds, targetClassId } = await request.json()

    if (!action || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      )
    }

    let results = []

    if (action === 'move' && targetClassId) {
      // Move students to target class
      const targetClass = await Class.findById(targetClassId)
      if (!targetClass) {
        return NextResponse.json(
          { message: 'Target class not found' },
          { status: 404 }
        )
      }

      for (const studentId of studentIds) {
        try {
          // Remove from current class if any
          await Class.updateMany(
            { students: studentId },
            { $pull: { students: studentId } }
          )

          // Add to target class
          await Class.findByIdAndUpdate(
            targetClassId,
            { $addToSet: { students: studentId } }
          )

          // Update student's classId
          await User.findByIdAndUpdate(
            studentId,
            { classId: targetClassId }
          )

          results.push({ studentId, status: 'success' })
        } catch (error) {
          results.push({ 
            studentId, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          })
        }
      }
    } else if (action === 'remove') {
      // Remove students from all classes
      for (const studentId of studentIds) {
        try {
          // Remove from all classes
          await Class.updateMany(
            { students: studentId },
            { $pull: { students: studentId } }
          )

          // Remove classId from student
          await User.findByIdAndUpdate(
            studentId,
            { $unset: { classId: 1 } }
          )

          results.push({ studentId, status: 'success' })
        } catch (error) {
          results.push({ 
            studentId, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          })
        }
      }
    } else {
      return NextResponse.json(
        { message: 'Invalid action or missing target class' },
        { status: 400 }
      )
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      message: `Bulk operation completed: ${successCount} successful, ${errorCount} failed`,
      results,
      successCount,
      errorCount
    })

  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}