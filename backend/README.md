# Coursework Management Backend

A standalone Node.js/Express backend for the coursework management system.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Students, teachers, and admin roles
- **Class Management**: Create and manage classes with student enrollment
- **Assignment System**: Create, update, and manage assignments
- **Submission Handling**: File upload and grading system
- **Analytics**: Performance tracking and reporting
- **File Management**: Secure file upload/download with validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/role` - Update user role (admin only)

### Classes
- `GET /api/classes` - Get classes (filtered by role)
- `POST /api/classes` - Create new class (teacher/admin)
- `GET /api/classes/:id` - Get class details
- `POST /api/classes/:id/students` - Add student to class

### Assignments
- `GET /api/assignments` - Get assignments (filtered by role)
- `POST /api/assignments` - Create assignment (teacher/admin)
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submissions
- `GET /api/submissions/assignment/:assignmentId` - Get submissions for assignment
- `POST /api/submissions` - Submit assignment (students)
- `GET /api/submissions/:id` - Get submission details
- `PUT /api/submissions/:id/grade` - Grade submission (teacher/admin)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/students/:studentId` - Get student performance

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:filename` - Download file
- `DELETE /api/files/:filename` - Delete file
- `GET /api/files/:filename/info` - Get file info

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/coursework

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Different permissions for different roles
- **File Validation**: Secure file upload with type checking
- **Input Validation**: Joi schema validation

## Database Models

### User
- Personal information (name, email)
- Role-based access (student, teacher, admin)
- Notification preferences
- Theme preferences

### Class
- Class information (name, description, code)
- Teacher assignment
- Student enrollment

### Assignment
- Assignment details (title, description, deadline)
- Class association
- Submission settings

### Submission
- File information
- Grading data
- Plagiarism check results
- Status tracking

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run tests
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure file upload path
5. Set up reverse proxy (nginx)
6. Enable HTTPS

## API Testing

Use tools like Postman or curl to test the API endpoints. Make sure to include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request