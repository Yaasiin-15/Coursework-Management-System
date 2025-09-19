import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'
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

        let classes
        if (user.role === 'teacher') {
            // Teachers see only their classes
            classes = await Class.find({ teacher: user.userId })
                .populate('teacher', 'name email')
                .populate('students', 'name email')
                .sort({ createdAt: -1 })
        } else if (user.role === 'admin') {
            // Admins see all classes
            classes = await Class.find()
                .populate('teacher', 'name email')
                .populate('students', 'name email')
                .sort({ createdAt: -1 })
        } else {
            // Students see only their class
            const userDoc = await User.findById(user.userId).populate('classId')
            classes = userDoc?.classId ? [userDoc.classId] : []
        }

        return NextResponse.json({ classes })
    } catch (error) {
        console.error('Error fetching classes:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

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

        const { name, code, description, teacherId } = await request.json()

        if (!name || !code) {
            return NextResponse.json(
                { message: 'Name and code are required' },
                { status: 400 }
            )
        }

        // Use provided teacherId for admins, or current user for teachers
        const finalTeacherId = user.role === 'admin' && teacherId ? teacherId : user.userId

        const newClass = new Class({
            name,
            code: code.toUpperCase(),
            description,
            teacher: finalTeacherId,
            students: [],
        })

        await newClass.save()

        return NextResponse.json(
            { message: 'Class created successfully', class: newClass },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error creating class:', error)
        if (error.code === 11000) {
            return NextResponse.json(
                { message: 'Class code already exists' },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}