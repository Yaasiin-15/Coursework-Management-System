import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'
import { authenticateRequest } from '@/middleware/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = authenticateRequest(request)
        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        await dbConnect()

        const classItem = await Class.findById(params.id)
            .populate('teacher', 'name email')
            .populate('students', 'name email')

        if (!classItem) {
            return NextResponse.json(
                { message: 'Class not found' },
                { status: 404 }
            )
        }

        // Check permissions
        if (user.role === 'student') {
            // Students can only see their own class
            const isEnrolled = classItem.students.some(
                (student: any) => student._id.toString() === user.userId
            )
            if (!isEnrolled) {
                return NextResponse.json(
                    { message: 'Unauthorized' },
                    { status: 401 }
                )
            }
        } else if (user.role === 'teacher') {
            // Teachers can only see their own classes
            if (classItem.teacher._id.toString() !== user.userId) {
                return NextResponse.json(
                    { message: 'Unauthorized' },
                    { status: 401 }
                )
            }
        }
        // Admins can see all classes

        return NextResponse.json({ class: classItem })
    } catch (error) {
        console.error('Error fetching class:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = authenticateRequest(request)
        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        await dbConnect()

        const { name, code, description } = await request.json()

        if (!name || !code) {
            return NextResponse.json(
                { message: 'Name and code are required' },
                { status: 400 }
            )
        }

        const classItem = await Class.findById(params.id)
        if (!classItem) {
            return NextResponse.json(
                { message: 'Class not found' },
                { status: 404 }
            )
        }

        // Check permissions - teachers can only edit their own classes
        if (user.role === 'teacher' && classItem.teacher.toString() !== user.userId) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Update the class
        classItem.name = name
        classItem.code = code.toUpperCase()
        classItem.description = description

        await classItem.save()

        return NextResponse.json(
            { message: 'Class updated successfully', class: classItem },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Error updating class:', error)
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = authenticateRequest(request)
        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        await dbConnect()

        const classItem = await Class.findById(params.id)
        if (!classItem) {
            return NextResponse.json(
                { message: 'Class not found' },
                { status: 404 }
            )
        }

        // Check permissions - teachers can only delete their own classes
        if (user.role === 'teacher' && classItem.teacher.toString() !== user.userId) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        await Class.findByIdAndDelete(params.id)

        return NextResponse.json(
            { message: 'Class deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error deleting class:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}