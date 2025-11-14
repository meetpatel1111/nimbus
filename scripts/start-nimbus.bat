@echo off
REM Quick start script for Nimbus Cloud Platform (Windows)

echo Starting Nimbus Cloud Platform...
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Please install Node.js 18+
    exit /b 1
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
if not exist "node_modules" (
    call npm install
)

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
if not exist "node_modules" (
    call npm install
)

REM Start backend
echo Starting backend API on port 4000...
cd ..\backend
start "Nimbus Backend" cmd /k node index.js

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend on port 3000...
cd ..\frontend
start "Nimbus Frontend" cmd /k npm run dev

echo.
echo Nimbus Cloud Platform is starting!
echo.
echo Dashboard: http://localhost:3000
echo API: http://localhost:4000
echo.
echo Close the terminal windows to stop the services
echo.

pause
