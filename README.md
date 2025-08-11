# Coursework Management System

A comprehensive web-based platform for managing coursework, assignments, and submissions between teachers and students.

## Features

### For Teachers
- Create and manage assignments with deadlines
- Set mark allocations and course information
- View all student submissions in one place
- Grade submissions and provide detailed feedback
- Track student performance and analytics

### For Students
- View all upcoming assignments and deadlines
- Submit coursework files online before deadlines
- Track marks and feedback history
- Receive notifications for new assignments and grades

### For Admins
- Manage teacher and student accounts
- View system-wide performance reports
- System administration and user management

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **File Storage**: Local file system (can be extended to cloud storage)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas connection
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coursework-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/coursework-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── assignments/   # Assignment management endpoints
│   ├── assignments/       # Assignment pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   └── register/         # Registration page
├── components/            # Reusable React components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   └── mongodb.ts        # Database connection
├── middleware/           # Custom middleware
├── models/              # MongoDB/Mongoose models
│   ├── User.ts
│   ├── Assignment.ts
│   └── Submission.ts
└── types/               # TypeScript type definitions
```

## Database Schema

### Users
- `name`: User's full name
- `email`: Unique email address
- `role`: 'student', 'teacher', or 'admin'
- `passwordHash`: Encrypted password

### Assignments
- `title`: Assignment title
- `description`: Detailed instructions
- `course`: Course name/code
- `deadline`: Submission deadline
- `maxMarks`: Maximum possible marks
- `createdBy`: Reference to teacher who created it

### Submissions
- `assignmentId`: Reference to assignment
- `studentId`: Reference to student
- `fileUrl`: Path to uploaded file
- `fileName`: Original file name
- `marks`: Awarded marks (optional)
- `feedback`: Teacher feedback (optional)
- `status`: 'submitted', 'graded', or 'late'

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Assignments
- `GET /api/assignments` - List assignments (role-based)
- `POST /api/assignments` - Create assignment (teachers only)
- `GET /api/assignments/[id]` - Get assignment details
- `GET /api/assignments/[id]/submissions` - Get submissions
- `POST /api/assignments/[id]/submit` - Submit assignment (students only)

## Features to Implement

- [ ] Due date reminders
- [ ] Email notifications for new assignments and grades
- [ ] File download functionality for teachers
- [ ] Grading interface for teachers
- [ ] Student performance analytics
- [ ] Plagiarism detection integration
- [ ] Dark/Light theme toggle
- [ ] Mobile responsive improvements
- [ ] Bulk operations for teachers
- [ ] Assignment templates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.