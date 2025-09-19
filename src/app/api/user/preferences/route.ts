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

        const userDoc = await User.findById(user.userId).select('preferences')
        if (!userDoc) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        // Return default preferences if none exist
        const defaultPreferences = {
            language: 'en',
            theme: 'system'
        }

        return NextResponse.json({
            preferences: userDoc.preferences || defaultPreferences
        })
    } catch (error) {
        console.error('Error fetching user preferences:', error)
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

        const preferences = await request.json()

        // Validate preferences structure
        const validLanguages = ['en', 'so', 'es', 'fr']
        const validThemes = ['light', 'dark', 'system']

        if (preferences.language && !validLanguages.includes(preferences.language)) {
            return NextResponse.json(
                { message: 'Invalid language selection' },
                { status: 400 }
            )
        }

        if (preferences.theme && !validThemes.includes(preferences.theme)) {
            return NextResponse.json(
                { message: 'Invalid theme selection' },
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

        // Update preferences
        userDoc.preferences = {
            language: preferences.language || userDoc.preferences?.language || 'en',
            theme: preferences.theme || userDoc.preferences?.theme || 'system'
        }

        await userDoc.save()

        return NextResponse.json(
            { 
                message: 'Preferences updated successfully',
                preferences: userDoc.preferences
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error updating user preferences:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}