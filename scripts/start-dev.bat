@echo off
REM Nimbus Development Startup Script for Windows

echo.
echo Starting Nimbus Mini-Cloud Platform...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting services...
echo.
echo Backend will run on: http://localhost:4000
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start backend
start "Nimbus Backend" cmd /k "cd backend && npm start"

REM Wait a bit for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend
start "Nimbus Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Services started! Check the new windows for logs.
echo.
pause
