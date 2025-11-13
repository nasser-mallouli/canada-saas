#!/bin/bash

# Quick script to restart backend with ALLOWED_HOSTS="*"

set -e

BACKEND_PORT=8001

echo "🔄 Restarting backend with ALLOWED_HOSTS='*'..."

# Kill existing backend
if [ -f ".backend.pid" ]; then
    PID=$(cat .backend.pid 2>/dev/null || echo "")
    if [ -n "$PID" ]; then
        echo "Stopping backend (PID: $PID)..."
        kill $PID 2>/dev/null || true
        sleep 2
    fi
fi

# Also kill by process name
pkill -f "manage.py runserver.*$BACKEND_PORT" 2>/dev/null || true
sleep 1

# Start backend with correct settings
cd backend

if [ -d "venv" ]; then
    source venv/bin/activate
fi

export ALLOWED_HOSTS="*"
export CORS_ALLOWED_ORIGINS="*"

echo "Starting backend with ALLOWED_HOSTS='*'..."
python manage.py runserver 0.0.0.0:$BACKEND_PORT > ../.backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.backend.pid

cd ..

echo "✅ Backend restarted! PID: $BACKEND_PID"
echo "Backend should now accept requests from ngrok domains."

