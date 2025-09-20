# Development Guide

This guide will help you set up and develop the Coursework Management System.

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)

```bash
# Run the setup script
npm run setup

# Start both frontend and backend
npm run dev
```

### Option 2: Manual Setup

```bash
# Install all dependencies
npm run install:all

# Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit environment files with your configuration
# Then start development servers
npm run dev
```

## 🔧 Environment Configuration

### Backend (.env)

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

### Frontend (.env.local)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Frontend URL
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## 📋 Available Scripts

### Root Level Commands

- `npm run dev` - Start both frontend and backend
- `npm run dev:backend` - Start only backend
- `npm run dev:frontend` - Start only frontend
- `npm run build` - Build both for production
- `npm run start` - Start both in production mode
- `npm run test:connection` - Test frontend-backend connectivity
- `npm run install:all` - Install all dependencies
- `npm run clean` - Clean all node_modules

### Backend Commands (cd backend)

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend Commands (cd frontend)

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔍 Testing Connectivity

Run the connection test to verify everything is working:

```bash
npm run test:connection
```

This will check:

- ✅ Backend health endpoint
- ✅ Frontend accessibility
- ✅ API endpoint connectivity

## 🏗️ Development Workflow

### 1. Backend Development

```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:5000` with:

- API endpoints at `/api/*`
- Health check at `/health`
- File uploads at `/api/files/*`

### 2. Frontend Development

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000` and automatically connects to the backend API.

### 3. Full Stack Development

```bash
npm run dev
```

This starts both frontend and backend simultaneously using concurrently.

## 📁 Project Structure

```
coursework-management/
├── backend/                 # Node.js/Express API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & validation
│   ├── uploads/            # File uploads (created automatically)
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   └── .env                # Backend environment variables
├── frontend/               # Next.js React app
│   ├── src/               # Source code
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities & API client
│   ├── package.json       # Frontend dependencies
│   └── .env.local         # Frontend environment variables
├── package.json           # Root package.json for scripts
└── README.md              # Main documentation
```

## � API Integration

The frontend communicates with the backend through the API client (`frontend/src/lib/api.ts`):

```typescript
import { get, post, put, del } from "@/lib/api";

// Example API calls
const assignments = await get("/assignments");
const newAssignment = await post("/assignments", assignmentData);
const updated = await put("/assignments/123", updateData);
const deleted = await del("/assignments/123");
```

## 🛠️ Adding New Features

### Backend (API Endpoint)

1. Create route in `backend/routes/`
2. Add middleware if needed
3. Update `backend/server.js` to include the route
4. Test with Postman or curl

### Frontend (UI Component)

1. Create component in `frontend/src/components/`
2. Add page in `frontend/src/app/`
3. Use API client to connect to backend
4. Add proper TypeScript types

### Database Model

1. Create model in `backend/models/`
2. Use Mongoose schema
3. Export the model
4. Import in routes that need it

## 🐛 Debugging

### Backend Issues

- Check `backend/.env` configuration
- Verify MongoDB connection
- Check server logs in terminal
- Test API endpoints with Postman

### Frontend Issues

- Check `frontend/.env.local` configuration
- Verify API URL is correct
- Check browser console for errors
- Check Network tab for API calls

### Connection Issues

- Run `npm run test:connection`
- Check if both servers are running
- Verify CORS configuration
- Check firewall settings

## 📦 Database Setup

### Local MongoDB

```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# The application will create the database automatically
```

### MongoDB Atlas (Cloud)

1. Create MongoDB Atlas account
2. Create new cluster
3. Get connection string
4. Add to `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coursework
   ```

## 🚀 Deployment

### Backend Deployment

- **Railway**: Connect GitHub repo, auto-deploy
- **Heroku**: Use Git deployment or GitHub integration
- **DigitalOcean**: Deploy to droplet with PM2
- **AWS EC2**: Use PM2 for process management

### Frontend Deployment

- **Vercel**: Connect GitHub repo, auto-deploy
- **Netlify**: Static site deployment
- **AWS S3**: Static hosting with CloudFront

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `MONGODB_URI` (production database)
- `JWT_SECRET` (strong secret key)
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL` (production API URL)

## 🔒 Security Considerations

- Use strong JWT secrets in production
- Enable HTTPS in production
- Validate all inputs
- Implement rate limiting
- Use environment variables for secrets
- Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

If you encounter issues:

1. Check this development guide
2. Run connection tests
3. Check logs for errors
4. Create GitHub issue with details
