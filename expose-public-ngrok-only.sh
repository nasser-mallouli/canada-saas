#!/bin/bash

# Simplified script using only ngrok with basic auth
# This version is simpler but URLs will change each time

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FRONTEND_PORT=5173
BACKEND_PORT=8001
AUTH_USER="${EXPOSE_AUTH_USER:-demo}"
AUTH_PASS="${EXPOSE_AUTH_PASS:-demo123}"

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check dependencies
if ! command -v ngrok >/dev/null 2>&1; then
    print_error "ngrok not found. Install: brew install ngrok/ngrok/ngrok"
    exit 1
fi

# Start services
print_info "Starting backend..."
cd backend
if [ -d "venv" ]; then source venv/bin/activate; fi
export CORS_ALLOWED_ORIGINS="*"
export ALLOWED_HOSTS="*"
python manage.py runserver 0.0.0.0:$BACKEND_PORT > ../.backend.log 2>&1 &
echo $! > ../.backend.pid
cd ..

print_info "Starting frontend..."
npm run dev > .frontend.log 2>&1 &
echo $! > .frontend.pid

sleep 3

# Start ngrok with basic auth
print_info "Starting ngrok tunnels with basic auth..."

# Create ngrok config
cat > .ngrok-config.yml <<EOF
version: "2"
tunnels:
  backend:
    addr: $BACKEND_PORT
    proto: http
    bind_tls: true
    auth: "$AUTH_USER:$AUTH_PASS"
  frontend:
    addr: $FRONTEND_PORT
    proto: http
    bind_tls: true
    auth: "$AUTH_USER:$AUTH_PASS"
EOF

ngrok start --config .ngrok-config.yml --all > .ngrok.log 2>&1 &
echo $! > .ngrok.pid

sleep 5

# Get URLs
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -oP '"public_url":"https://[^"]+"' | head -1 | cut -d'"' -f4)
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -oP '"public_url":"https://[^"]+"' | tail -1 | cut -d'"' -f4)

# Update frontend
echo "VITE_API_URL=$BACKEND_URL" > .env.local

# Save URLs
cat > .public-urls.txt <<EOF
# Public URLs - Generated on $(date)
# Username: $AUTH_USER
# Password: $AUTH_PASS

FRONTEND_URL=$FRONTEND_URL
BACKEND_URL=$BACKEND_URL
EOF

echo ""
print_success "=========================================="
print_success "  Public URLs (with authentication)"
print_success "=========================================="
echo ""
echo -e "${GREEN}Frontend: $FRONTEND_URL${NC}"
echo -e "${GREEN}Backend: $BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}Username: $AUTH_USER${NC}"
echo -e "${YELLOW}Password: $AUTH_PASS${NC}"
echo ""
print_info "URLs saved to .public-urls.txt"
print_info "Press Ctrl+C to stop"

wait

