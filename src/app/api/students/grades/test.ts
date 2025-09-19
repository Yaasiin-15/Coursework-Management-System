// Simple test utilities for the grades API
// This file can be used for manual testing during development

export interface StudentGradeDTO {
  submissionId: string
  assignmentTitle: string
  assignmentDescription: string
  assignmentMaxMarks: number
  course: string
  className: string
  marks?: number
  feedback?: string
  status: 'graded' | 'submitted' | 'late'
  submittedAt: Date
  gradedAt?: Date
  gradedByName?: string
  deadline: Date
}

export interface GradeDetailsDTO {
  submissionId: string
  assignmentTitle: string
  assignmentDescription: string
  assignmentMaxMarks: number
  course: string
  className: string
  deadline: Date
  fileName: string
  submittedAt: Date
  status: 'graded' | 'submitted' | 'late'
  marks?: number
  feedback?: string
  gradedAt?: Date
  gradedByName?: string
  gradedByEmail?: string
}

// Test helper function to validate API response structure
export function validateGradeResponse(response: any): boolean {
  if (!response.success || !Array.isArray(response.grades)) {
    return false
  }

  return response.grades.every((grade: any) => 
    typeof grade.submissionId === 'string' &&
    typeof grade.assignmentTitle === 'string' &&
    typeof grade.assignmentMaxMarks === 'number' &&
    typeof grade.course === 'string'
  )
}

// Test helper function to validate grade details response
export function validateGradeDetailsResponse(response: any): boolean {
  if (!response.success || !response.grade) {
    return false
  }

  const grade = response.grade
  return (
    typeof grade.submissionId === 'string' &&
    typeof grade.assignmentTitle === 'string' &&
    typeof grade.assignmentMaxMarks === 'number' &&
    typeof grade.status === 'string'
  )
}