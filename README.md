# Coursework Management System

A comprehensive full-stack web application for managing coursework, assignments, and student submissions. The project is split into a **Node.js/Express backend** and a **Next.js frontend** for better separation of concerns and scalability.

## 🏗️ Architecture

```
coursework-management/
├── backend/           # Node.js/Express API server
│   ├── models/        # Database models (Mongoose)
│   ├── routes/        # API routes
│   ├── middleware/    # Authentication & validation
│   └── server.js      # Express server
├── frontend/          # Next.js React application
│   ├── src/app/       # Next.js App Router pages
│   ├── src/components/# React components
│   ├── src/contexts/  # React contexts
│   └── src/lib/       # Utilities & API client
└── README.md          # This file
```

## ✨ Features

### For Students

- **Dashboard**: View assigned coursework, upcoming deadlines, and grades
- **Assignment Submission**: Upload files for assignments with deadline tracking
- **Grade Tracking**: View grades and feedback from teachers
- **Notifications**: Get notified about new assignments and grade updates
- **Profile Management**: Update personal information and preferences

### For Teachers

- **Assignment Creation**: Create and manage assignments with file attachments
- **Student Management**: View and manage students in classes
- **Grading Interface**: Grade submissions with feedback and file downloads
- **Analytics**: Track student performance and class statistics
- **Bulk Operations**: Download all submissions, send notifications
- **Class Management**: Create and manage classes with student enrollment

### For Administrators

- **User Management**: Manage all users (students, teachers, admins)
- **System Analytics**: View system-wide statistics and performance
- **Class Oversight**: Monitor all classes and assignments
- **Bulk Operations**: Perform administrative tasks across the system

## 🚀 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context API

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd coursework-management
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with backend API URL
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔧 Configuration

### Backend Environment Variables

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
```

### Frontend Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Frontend URL (for development)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## 📡 API Endpoints

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

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different roles
- **CORS Protection**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Joi schema validation for all inputs
- **File Upload Security**: File type and size validation
- **Password Hashing**: Secure password storage with bcrypt

## 🎨 UI/UX Features

- **Modern Design**: Clean, responsive interface
- **Dark/Light Theme**: Toggle with system preference support
- **Mobile Responsive**: Optimized for all device sizes
- **Real-time Notifications**: Toast notifications and notification panel
- **Analytics Dashboard**: Interactive charts and statistics
- **Accessibility**: WCAG compliant interface
- **Performance Optimized**: Fast loading with Next.js optimizations

## 🚀 Development

### Backend Development

```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
npm test     # Run tests
```

### Frontend Development

```bash
cd frontend
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## 📦 Deployment

### Backend Deployment

- **Railway**: Easy Node.js deployment
- **Heroku**: Container deployment
- **AWS EC2**: Virtual machine deployment
- **DigitalOcean**: Droplet deployment

### Frontend Deployment

- **Vercel**: Automatic deployment with Git integration
- **Netlify**: Static site hosting
- **AWS S3 + CloudFront**: Static hosting with CDN

### Docker Deployment

Both backend and frontend can be containerized using Docker for consistent deployment across environments.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Express.js for the robust backend framework
- MongoDB team for the database
- Tailwind CSS for the styling system
- All contributors who helped improve this project

---

## 📚 Additional Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

For detailed setup instructions and API documentation, please refer to the individual README files in the `backend/` and `frontend/` directories.
