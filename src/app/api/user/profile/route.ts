import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { authenticateRequest } from '@/middleware/auth'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
    try {
        const user = authenticateRequest(request)
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        await dbConnect()

        const { name, email, currentPassword, newPassword } = await request.json()

        if (!name || !email) {
            return NextResponse.json(
                { message: 'Name and email are required' },
                { status: 400 }
            )
        }

        const userDoc = await User.findById(user.userId)
        if (!userDoc) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        // Check if email is being changed and if it's already taken
        if (email !== userDoc.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: user.userId } })
            if (existingUser) {
                return NextResponse.json(
                    { message: 'Email already in use' },
                    { status: 400 }
                )
            }
        }

        // If password change is requested
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { message: 'Current password is required to change password' },
                    { status: 400 }
                )
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userDoc.passwordHash)
            if (!isCurrentPasswordValid) {
                return NextResponse.json(
                    { message: 'Current password is incorrect' },
                    { status: 400 }
                )
            }

            // Hash new password
            const saltRounds = 10
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)
            userDoc.passwordHash = hashedNewPassword
        }

        // Update user data
        userDoc.name = name
        userDoc.email = email

        await userDoc.save()

        // Return updated user data (without password)
        const updatedUser = {
            id: userDoc._id,
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role
        }

        return NextResponse.json(
            { 
                message: 'Profile updated successfully',
                user: updatedUser
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}