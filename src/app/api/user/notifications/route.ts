import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { authenticateRequest } from '@/middleware/auth'

export async function GET(request: NextRequest) {
    try {
        const user = authenticateRequest(request)
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        await dbConnect()

        const userDoc = await User.findById(user.userId).select('notificationSettings')
        if (!userDoc) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        // Return default settings if none exist
        const defaultSettings = {
            emailNotifications: true,
            assignmentReminders: true,
            gradeNotifications: true,
            systemUpdates: false
        }

        return NextResponse.json({
            notifications: userDoc.notificationSettings || defaultSettings
        })
    } catch (error) {
        console.error('Error fetching notification settings:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

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

        const notificationSettings = await request.json()

        // Validate the notification settings structure
        const validKeys = ['emailNotifications', 'assignmentReminders', 'gradeNotifications', 'systemUpdates']
        const isValidSettings = Object.keys(notificationSettings).every(key => 
            validKeys.includes(key) && typeof notificationSettings[key] === 'boolean'
        )

        if (!isValidSettings) {
            return NextResponse.json(
                { message: 'Invalid notification settings format' },
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

        // Update notification settings
        userDoc.notificationSettings = notificationSettings
        await userDoc.save()

        return NextResponse.json(
            { 
                message: 'Notification settings updated successfully',
                notifications: notificationSettings
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error updating notification settings:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}