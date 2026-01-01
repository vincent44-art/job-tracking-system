#!/bin/bash

# 🔌 BACKEND-FRONTEND STARTUP SCRIPT
# This script starts both the Flask backend and React frontend

set -e

PROJECT_DIR="/home/vincent/money/job-tracking-system"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "================================"
echo "🔌 BACKEND-FRONTEND CONNECTOR"
echo "================================"
echo ""

# Check if backend is already running on port 5000
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  WARNING: Port 5000 is already in use"
    echo "Current process:"
    lsof -Pi :5000 -sTCP:LISTEN
    echo ""
    read -p "Kill the existing process? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PID=$(lsof -t -i :5000)
        kill -9 $PID 2>/dev/null || true
        echo "✅ Killed process $PID"
        sleep 2
    else
        echo "❌ Please stop the process manually and try again"
        exit 1
    fi
fi

# Check if frontend port is in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  WARNING: Port 3000 is already in use"
    read -p "Kill the existing process? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PID=$(lsof -t -i :3000)
        kill -9 $PID 2>/dev/null || true
        echo "✅ Killed process $PID"
        sleep 2
    fi
fi

echo ""
echo "📋 SETUP CHECKLIST"
echo "================================"

# Check if venv exists
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "❌ Backend virtual environment not found"
    echo "Creating venv..."
    cd "$BACKEND_DIR"
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    echo "✅ Backend venv created and dependencies installed"
else
    echo "✅ Backend virtual environment exists"
fi

# Check if node_modules exists
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "❌ Frontend node_modules not found"
    echo "Installing dependencies..."
    cd "$FRONTEND_DIR"
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend node_modules exists"
fi

# Check database
if [ ! -f "$PROJECT_DIR/instance/fruittrack.db" ]; then
    echo "❌ Database not found, will be created on first run"
else
    echo "✅ Database found"
fi

echo ""
echo "🚀 STARTING SERVICES"
echo "================================"
echo ""
echo "Terminal 1: Starting Backend on http://127.0.0.1:5000"
echo "Terminal 2: Starting Frontend on http://localhost:3000"
echo ""
echo "When both are ready, open http://localhost:3000 in your browser"
echo ""
read -p "Press ENTER to continue..."
echo ""

# Start backend in background
echo "🔧 Starting Backend..."
cd "$BACKEND_DIR"
source venv/bin/activate
export FLASK_ENV=development
export FLASK_DEBUG=1
export PYTHONPATH="$PROJECT_DIR"
python3 app.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Log: tail -f /tmp/backend.log"
sleep 3

# Check if backend started
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check log:"
    cat /tmp/backend.log
    exit 1
fi

# Test backend health
echo ""
echo "Testing backend health..."
for i in {1..10}; do
    if curl -s http://127.0.0.1:5000/api/health > /dev/null 2>&1; then
        echo "✅ Backend is responding"
        break
    fi
    if [ $i -lt 10 ]; then
        echo "⏳ Waiting for backend to start... ($i/10)"
        sleep 1
    else
        echo "❌ Backend failed to respond"
        kill -9 $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
done

# Start frontend
echo ""
echo "🎨 Starting Frontend..."
cd "$FRONTEND_DIR"

# Kill frontend if already running
pkill -f "npm start" > /dev/null 2>&1 || true
sleep 1

npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Log: tail -f /tmp/frontend.log"
sleep 5

echo ""
echo "================================"
echo "✅ SETUP COMPLETE"
echo "================================"
echo ""
echo "📍 SERVICES RUNNING:"
echo "   Backend:  http://127.0.0.1:5000  (PID: $BACKEND_PID)"
echo "   Frontend: http://localhost:3000  (PID: $FRONTEND_PID)"
echo ""
echo "🧪 TEST COMMANDS:"
echo "   curl http://127.0.0.1:5000/api/health"
echo "   curl -X POST http://127.0.0.1:5000/api/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"test@example.com\",\"password\":\"password\"}'"
echo ""
echo "📂 LOG FILES:"
echo "   tail -f /tmp/backend.log"
echo "   tail -f /tmp/frontend.log"
echo ""
echo "⏸️  TO STOP SERVICES:"
echo "   kill $BACKEND_PID  # Stop backend"
echo "   kill $FRONTEND_PID # Stop frontend"
echo ""
echo "🌐 Open browser: http://localhost:3000"
echo ""

# Keep script running
wait
