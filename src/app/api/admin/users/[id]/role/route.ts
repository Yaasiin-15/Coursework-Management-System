import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { authenticateRequest } from '@/middleware/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const { role } = await request.json()

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      )
    }

    const userToUpdate = await User.findById(params.id)
    if (!userToUpdate) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from changing their own role
    if (userToUpdate._id.toString() === user.userId) {
      return NextResponse.json(
        { message: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    userToUpdate.role = role
    await userToUpdate.save()

    return NextResponse.json({ 
      message: 'User role updated successfully',
      user: {
        id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role
      }
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}