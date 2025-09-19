# Design Document

## Overview

This feature enhances the existing grading system by adding student-facing grade viewing capabilities and automatic assignment status updates. The design leverages the current MongoDB-based architecture with Submission, Assignment, and User models, extending the existing grading workflow to provide transparency and automation.

## Architecture

The solution builds upon the existing Next.js application architecture:

- **Frontend**: React components for student grade viewing interface
- **Backend**: REST API endpoints for grade retrieval and status management
- **Database**: MongoDB with existing Submission model enhancements
- **Authentication**: JWT-based auth system (already implemented)

### Current System Analysis

The existing system already has:
- Submission model with `marks`, `feedback`, `status`, `gradedAt`, and `gradedBy` fields
- Grading interface for teachers (`GradingInterface.tsx`)
- API endpoint for saving grades (`/api/submissions/[id]/grade`)
- Status tracking with values: `'submitted'`, `'graded'`, `'late'`

## Components and Interfaces

### 1. Student Grade Viewing Components

#### StudentGradeView Component
- **Purpose**: Main interface for students to view their grades
- **Location**: `src/components/StudentGradeView.tsx`
- **Features**:
  - Display all graded submissions for the logged-in student
  - Filter by class/assignment
  - Show grade, feedback, and grading date
  - Responsive design for mobile and desktop

#### GradeCard Component
- **Purpose**: Individual grade display component
- **Location**: `src/components/GradeCard.tsx`
- **Features**:
  - Shows assignment title, grade, max marks
  - Displays teacher feedback
  - Shows submission and grading dates
  - Status indicators (graded/pending)

### 2. API Endpoints

#### GET /api/students/grades
- **Purpose**: Retrieve all grades for the authenticated student
- **Authentication**: Student role required
- **Response**: Array of graded submissions with assignment details
- **Query Parameters**: 
  - `classId` (optional): Filter by specific class
  - `assignmentId` (optional): Filter by specific assignment

#### GET /api/students/grades/[assignmentId]
- **Purpose**: Get grade details for a specific assignment
- **Authentication**: Student role required
- **Response**: Detailed grade information including feedback

### 3. Status Update Mechanism

#### Automatic Status Updates
- **Trigger**: When student submits assignment via existing submission API
- **Logic**: Update submission status from any state to 'submitted' (or 'late' if past deadline)
- **Implementation**: Enhance existing submission creation endpoint

#### Real-time Updates
- **Method**: Database triggers and API response updates
- **Scope**: Teacher interfaces automatically reflect updated statuses
- **Performance**: Optimized queries with proper indexing

## Data Models

### Enhanced Submission Model
The existing Submission model already contains all necessary fields:

```typescript
interface ISubmission {
  assignmentId: ObjectId
  studentId: ObjectId
  marks?: number        // Grade value
  feedback?: string     // Teacher feedback
  status: 'submitted' | 'graded' | 'late'
  gradedAt?: Date      // When grade was assigned
  gradedBy?: ObjectId  // Teacher who graded
  submittedAt: Date    // Submission timestamp
  // ... other existing fields
}
```

### Grade View Data Transfer Objects

#### StudentGradeDTO
```typescript
interface StudentGradeDTO {
  submissionId: string
  assignmentTitle: string
  assignmentMaxMarks: number
  marks?: number
  feedback?: string
  status: 'pending' | 'graded'
  submittedAt: Date
  gradedAt?: Date
  gradedByName?: string
  course: string
}
```

## Error Handling

### Client-Side Error Handling
- **Network Errors**: Retry mechanism with user feedback
- **Authentication Errors**: Redirect to login with appropriate message
- **Permission Errors**: Clear messaging about access restrictions
- **Data Loading**: Loading states and skeleton components

### Server-Side Error Handling
- **Database Connection**: Graceful degradation with error messages
- **Invalid Requests**: Proper HTTP status codes and error responses
- **Authorization**: Role-based access control validation
- **Data Validation**: Input sanitization and validation

### Error Scenarios
1. **Student accessing other student's grades**: 403 Forbidden
2. **Accessing non-existent assignments**: 404 Not Found
3. **Database connectivity issues**: 500 Internal Server Error
4. **Invalid authentication tokens**: 401 Unauthorized

## Testing Strategy

### Unit Tests
- **Components**: Test grade display, filtering, and error states
- **API Endpoints**: Test authentication, data retrieval, and error handling
- **Utilities**: Test date formatting, grade calculations, and status logic

### Integration Tests
- **Grade Viewing Flow**: End-to-end student grade viewing process
- **Status Update Flow**: Submission to status change workflow
- **Authentication Flow**: Role-based access control testing

### Test Data Setup
- **Mock Submissions**: Various status states and grade scenarios
- **User Roles**: Student, teacher, and admin test accounts
- **Assignment Data**: Different courses, deadlines, and max marks

### Performance Tests
- **Grade Loading**: Test with large numbers of submissions
- **Concurrent Access**: Multiple students accessing grades simultaneously
- **Database Queries**: Optimize query performance with proper indexing

## Security Considerations

### Data Access Control
- **Student Isolation**: Students can only view their own grades
- **Teacher Verification**: Only assigned teachers can grade submissions
- **Admin Oversight**: Admins have read access to all grades

### API Security
- **JWT Validation**: All endpoints require valid authentication
- **Role Authorization**: Endpoint-specific role requirements
- **Input Sanitization**: Prevent injection attacks
- **Rate Limiting**: Prevent API abuse

### Data Privacy
- **Grade Confidentiality**: No cross-student grade visibility
- **Feedback Privacy**: Teacher feedback only visible to respective student
- **Audit Trail**: Track who accessed what grade information

## Performance Optimizations

### Database Optimizations
- **Indexing**: Compound indexes on `studentId + assignmentId`
- **Query Optimization**: Efficient joins with assignment and user data
- **Caching Strategy**: Cache frequently accessed grade data

### Frontend Optimizations
- **Lazy Loading**: Load grades on demand
- **Pagination**: Handle large numbers of assignments
- **Caching**: Client-side caching of grade data
- **Responsive Images**: Optimize for mobile devices

### API Optimizations
- **Batch Requests**: Reduce number of API calls
- **Data Aggregation**: Pre-calculate grade statistics
- **Response Compression**: Minimize payload sizes