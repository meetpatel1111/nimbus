#!/bin/bash
# Quick start script for Nimbus Cloud Platform

set -e

echo "🌥️  Starting Nimbus Cloud Platform..."
echo ""

# Check if k3s is running
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please run the bootstrap script first:"
    echo "   sudo ./bootstrap/full-mini-cloud-bootstrap-fixed.sh"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Start backend
echo "🚀 Starting backend API on port 4000..."
cd ../backend
node index.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🚀 Starting frontend on port 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Nimbus Cloud Platform is starting!"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 API: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping Nimbus...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

wait
