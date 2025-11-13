#!/bin/bash

# Script to stop all exposed services and tunnels

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info "Stopping all services and tunnels..."

# Stop backend
if [ -f ".backend.pid" ]; then
    PID=$(cat .backend.pid)
    if kill $PID 2>/dev/null; then
        print_success "Stopped backend (PID: $PID)"
    fi
    rm -f .backend.pid
fi

# Stop frontend
if [ -f ".frontend.pid" ]; then
    PID=$(cat .frontend.pid)
    if kill $PID 2>/dev/null; then
        print_success "Stopped frontend (PID: $PID)"
    fi
    rm -f .frontend.pid
fi

# Stop ngrok tunnels
if [ -f ".backend-ngrok.pid" ]; then
    PID=$(cat .backend-ngrok.pid)
    if kill $PID 2>/dev/null; then
        print_success "Stopped backend ngrok tunnel (PID: $PID)"
    fi
    rm -f .backend-ngrok.pid
fi

if [ -f ".frontend-ngrok.pid" ]; then
    PID=$(cat .frontend-ngrok.pid)
    if kill $PID 2>/dev/null; then
        print_success "Stopped frontend ngrok tunnel (PID: $PID)"
    fi
    rm -f .frontend-ngrok.pid
fi

# Also kill any remaining ngrok processes
if [ -f ".ngrok.pid" ]; then
    PID=$(cat .ngrok.pid)
    kill $PID 2>/dev/null || true
    rm -f .ngrok.pid
fi

pkill -f "ngrok http" 2>/dev/null || true

# Stop cloudflared
if [ -f ".cloudflared.pid" ]; then
    PID=$(cat .cloudflared.pid)
    if kill $PID 2>/dev/null; then
        print_success "Stopped cloudflared (PID: $PID)"
    fi
    # Also kill any remaining cloudflared processes
    pkill -f cloudflared || true
    rm -f .cloudflared.pid
fi

# Cleanup config files
rm -f .htpasswd .ngrok-config.yml .cloudflared-config.yml .env.local

print_success "All services stopped and cleaned up!"

