#!/bin/bash

echo "🚀 Setting up Coursework Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create environment files if they don't exist
echo "🔧 Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your MongoDB URI and JWT secret"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local file..."
    cp frontend/.env.local.example frontend/.env.local
    echo "✅ Frontend environment file created"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your MongoDB connection string"
echo "2. Start MongoDB (locally or use MongoDB Atlas)"
echo "3. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "🔗 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API:      http://localhost:5000/api"
echo ""
echo "📚 Commands:"
echo "   npm run dev          - Start both frontend and backend"
echo "   npm run dev:backend  - Start only backend"
echo "   npm run dev:frontend - Start only frontend"
echo "   npm run build        - Build both for production"
echo "   npm run test:connection - Test frontend-backend connectivity"
echo ""