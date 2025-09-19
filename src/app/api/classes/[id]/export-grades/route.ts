import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'
import Assignment from '@/models/Assignment'
import Submission from '@/models/Submission'
import { authenticateRequest } from '@/middleware/auth'
import * as XLSX from 'xlsx'

export async function GET(
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

        const classId = params.id

        // Find the class with students and assignments
        const classDoc = await Class.findById(classId)
            .populate('students', 'name email')
            .populate('teacher', 'name')

        if (!classDoc) {
            return NextResponse.json(
                { message: 'Class not found' },
                { status: 404 }
            )
        }

        // Check if teacher owns this class (unless admin)
        if (user.role === 'teacher' && classDoc.teacher._id.toString() !== user.userId) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get all assignments for this class
        const assignments = await Assignment.find({ classId })
            .sort({ createdAt: 1 })

        // Get all submissions for these assignments
        const assignmentIds = assignments.map(a => a._id)
        const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
            .populate('studentId', 'name email')
            .populate('assignmentId', 'title maxMarks')

        // Create grade matrix
        const students = classDoc.students
        const gradeData = []

        // Header row
        const headers = ['Student Name', 'Email', ...assignments.map(a => a.title), 'Total Points', 'Average %']
        gradeData.push(headers)

        // Student rows
        students.forEach((student: any) => {
            const row = [student.name, student.email]
            let totalPoints = 0
            let maxPossiblePoints = 0

            assignments.forEach((assignment: any) => {
                const submission = submissions.find(
                    (sub: any) => sub.studentId._id.toString() === student._id.toString() && 
                                 sub.assignmentId._id.toString() === assignment._id.toString()
                )

                const grade = submission?.marks || 0
                row.push(grade)
                totalPoints += grade
                maxPossiblePoints += assignment.maxMarks || 100
            })

            row.push(totalPoints)
            row.push(maxPossiblePoints > 0 ? ((totalPoints / maxPossiblePoints) * 100).toFixed(1) + '%' : '0%')
            gradeData.push(row)
        })

        // Summary statistics
        gradeData.push([]) // Empty row
        gradeData.push(['SUMMARY STATISTICS'])
        gradeData.push(['Total Students:', students.length])
        gradeData.push(['Total Assignments:', assignments.length])

        if (students.length > 0 && assignments.length > 0) {
            const allGrades = students.map((student: any) => {
                let totalPoints = 0
                let maxPossiblePoints = 0

                assignments.forEach((assignment: any) => {
                    const submission = submissions.find(
                        (sub: any) => sub.studentId._id.toString() === student._id.toString() && 
                                     sub.assignmentId._id.toString() === assignment._id.toString()
                    )
                    totalPoints += submission?.marks || 0
                    maxPossiblePoints += assignment.maxMarks || 100
                })

                return maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints) * 100 : 0
            })

            const avgClassGrade = allGrades.reduce((sum: number, grade: number) => sum + grade, 0) / allGrades.length
            const highestGrade = Math.max(...allGrades)
            const lowestGrade = Math.min(...allGrades)

            gradeData.push(['Class Average:', avgClassGrade.toFixed(1) + '%'])
            gradeData.push(['Highest Grade:', highestGrade.toFixed(1) + '%'])
            gradeData.push(['Lowest Grade:', lowestGrade.toFixed(1) + '%'])
        }

        // Create Excel workbook
        const workbook = XLSX.utils.book_new()

        // Create main grades worksheet
        const gradesWorksheet = XLSX.utils.aoa_to_sheet(gradeData)

        // Style the header row
        const headerRange = XLSX.utils.decode_range(gradesWorksheet['!ref'] || 'A1')
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
            if (!gradesWorksheet[cellAddress]) continue
            gradesWorksheet[cellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "CCCCCC" } }
            }
        }

        // Set column widths
        const colWidths = [
            { wch: 20 }, // Student Name
            { wch: 25 }, // Email
            ...assignments.map(() => ({ wch: 15 })), // Assignment columns
            { wch: 12 }, // Total Points
            { wch: 12 }  // Average %
        ]
        gradesWorksheet['!cols'] = colWidths

        XLSX.utils.book_append_sheet(workbook, gradesWorksheet, 'Grades')

        // Create assignment details worksheet
        const assignmentDetails = [
            ['Assignment Details'],
            ['Assignment Title', 'Max Marks', 'Due Date', 'Submissions', 'Average Grade'],
            ...assignments.map((assignment: any) => {
                const assignmentSubmissions = submissions.filter(
                    (sub: any) => sub.assignmentId._id.toString() === assignment._id.toString()
                )
                const avgGrade = assignmentSubmissions.length > 0
                    ? (assignmentSubmissions.reduce((sum: number, sub: any) => sum + (sub.marks || 0), 0) / assignmentSubmissions.length).toFixed(1)
                    : '0'
                
                return [
                    assignment.title,
                    assignment.maxMarks || 100,
                    assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'No due date',
                    assignmentSubmissions.length,
                    avgGrade
                ]
            })
        ]

        const assignmentWorksheet = XLSX.utils.aoa_to_sheet(assignmentDetails)
        XLSX.utils.book_append_sheet(workbook, assignmentWorksheet, 'Assignment Details')

        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

        const fileName = `${classDoc.name}_${classDoc.code}_Grades_${new Date().toISOString().split('T')[0]}.xlsx`

        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        })

    } catch (error) {
        console.error('Error exporting grades:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}