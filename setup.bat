@echo off
echo 🚀 Setting up Coursework Management System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
npm install
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

REM Create environment files if they don't exist
echo 🔧 Setting up environment files...

REM Backend .env
if not exist "backend\.env" (
    echo 📝 Creating backend .env file...
    copy "backend\.env.example" "backend\.env"
    echo ⚠️  Please edit backend\.env with your MongoDB URI and JWT secret
)

REM Frontend .env.local
if not exist "frontend\.env.local" (
    echo 📝 Creating frontend .env.local file...
    copy "frontend\.env.local.example" "frontend\.env.local"
    echo ✅ Frontend environment file created
)

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Edit backend\.env with your MongoDB connection string
echo 2. Start MongoDB (locally or use MongoDB Atlas)
echo 3. Run 'npm run dev' to start both frontend and backend
echo.
echo 🔗 URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo    API:      http://localhost:5000/api
echo.
echo 📚 Commands:
echo    npm run dev          - Start both frontend and backend
echo    npm run dev:backend  - Start only backend
echo    npm run dev:frontend - Start only frontend
echo    npm run build        - Build both for production
echo    npm run test:connection - Test frontend-backend connectivity
echo.
pause