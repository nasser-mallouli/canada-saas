#!/bin/bash

# Script to expose both frontend and backend via Cloudflare Tunnel
# This ensures both services are accessible and properly configured

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
FRONTEND_PORT=5173
BACKEND_PORT=8001
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print functions
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    print_error "cloudflared is not installed!"
    print_info "Install it with:"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "  brew install cloudflare/cloudflare/cloudflared"
    else
        print_info "  Visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
    fi
    exit 1
fi

# Check if services are running
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

print_info "Checking if services are running..."

if ! check_port $FRONTEND_PORT; then
    print_warning "Frontend is not running on port $FRONTEND_PORT"
    print_info "Start it with: npm run dev"
    exit 1
fi

if ! check_port $BACKEND_PORT; then
    print_warning "Backend is not running on port $BACKEND_PORT"
    print_info "Start it with: cd backend && ./start.sh"
    exit 1
fi

print_success "Both services are running!"

# Cleanup function
cleanup() {
    print_info "Cleaning up..."
    if [ -f ".frontend-cloudflare.pid" ]; then
        kill $(cat .frontend-cloudflare.pid) 2>/dev/null || true
        rm .frontend-cloudflare.pid
    fi
    if [ -f ".backend-cloudflare.pid" ]; then
        kill $(cat .backend-cloudflare.pid) 2>/dev/null || true
        rm .backend-cloudflare.pid
    fi
    rm -f .frontend-cloudflare.log .backend-cloudflare.log
}

trap cleanup EXIT INT TERM

# Expose backend first
print_info "Exposing backend via Cloudflare Tunnel..."
cloudflared tunnel --url http://localhost:$BACKEND_PORT > .backend-cloudflare.log 2>&1 &
BACKEND_TUNNEL_PID=$!
echo $BACKEND_TUNNEL_PID > .backend-cloudflare.pid

print_info "Waiting for backend tunnel to establish (this may take 10-15 seconds)..."
sleep 10

# Try to extract backend URL with multiple patterns and retries
BACKEND_URL=""
for i in {1..15}; do
    # Try different patterns to match the URL
    # Pattern 1: Standard URL format
    BACKEND_URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' .backend-cloudflare.log 2>/dev/null | head -1 || echo "")
    
    if [ -n "$BACKEND_URL" ]; then
        break
    fi
    
    # Pattern 2: Look in recent lines only
    BACKEND_URL=$(tail -20 .backend-cloudflare.log | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' 2>/dev/null | head -1 || echo "")
    
    if [ -n "$BACKEND_URL" ]; then
        break
    fi
    
    # Pattern 3: Look for "trycloudflare.com" anywhere and construct URL
    DOMAIN=$(grep -oE '[a-zA-Z0-9-]+\.trycloudflare\.com' .backend-cloudflare.log 2>/dev/null | head -1 || echo "")
    if [ -n "$DOMAIN" ]; then
        BACKEND_URL="https://$DOMAIN"
        break
    fi
    
    sleep 2
    if [ $((i % 3)) -eq 0 ]; then
        print_info "Waiting for backend URL... (attempt $i/15)"
    fi
done

if [ -z "$BACKEND_URL" ]; then
    print_error "Failed to get backend URL from Cloudflare Tunnel after 40 seconds"
    print_info "Backend tunnel log (full log):"
    cat .backend-cloudflare.log
    print_info ""
    print_info "The tunnel might still be starting. You can:"
    print_info "  1. Check the log manually: tail -f .backend-cloudflare.log"
    print_info "  2. Run the tunnel manually to see the URL:"
    print_info "     cloudflared tunnel --url http://localhost:$BACKEND_PORT"
    print_info "  3. Look for the URL in the output above and set it manually:"
    print_info "     echo 'VITE_API_URL=https://your-backend-url.trycloudflare.com' > .env.local"
    exit 1
fi

print_success "Backend exposed: $BACKEND_URL"

# Expose frontend
print_info "Exposing frontend via Cloudflare Tunnel..."
cloudflared tunnel --url http://localhost:$FRONTEND_PORT > .frontend-cloudflare.log 2>&1 &
FRONTEND_TUNNEL_PID=$!
echo $FRONTEND_TUNNEL_PID > .frontend-cloudflare.pid

print_info "Waiting for frontend tunnel to establish (this may take 10-15 seconds)..."
sleep 10

# Try to extract frontend URL with multiple patterns and retries
FRONTEND_URL=""
for i in {1..15}; do
    # Try different patterns to match the URL
    # Pattern 1: Standard URL format
    FRONTEND_URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' .frontend-cloudflare.log 2>/dev/null | head -1 || echo "")
    
    if [ -n "$FRONTEND_URL" ]; then
        break
    fi
    
    # Pattern 2: Look in recent lines only
    FRONTEND_URL=$(tail -20 .frontend-cloudflare.log | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' 2>/dev/null | head -1 || echo "")
    
    if [ -n "$FRONTEND_URL" ]; then
        break
    fi
    
    # Pattern 3: Look for "trycloudflare.com" anywhere and construct URL
    DOMAIN=$(grep -oE '[a-zA-Z0-9-]+\.trycloudflare\.com' .frontend-cloudflare.log 2>/dev/null | head -1 || echo "")
    if [ -n "$DOMAIN" ]; then
        FRONTEND_URL="https://$DOMAIN"
        break
    fi
    
    sleep 2
    if [ $((i % 3)) -eq 0 ]; then
        print_info "Waiting for frontend URL... (attempt $i/15)"
    fi
done

if [ -z "$FRONTEND_URL" ]; then
    print_error "Failed to get frontend URL from Cloudflare Tunnel after 40 seconds"
    print_info "Frontend tunnel log (full log):"
    cat .frontend-cloudflare.log
    print_info ""
    print_info "The tunnel might still be starting. Check the log manually:"
    print_info "  tail -f .frontend-cloudflare.log"
    exit 1
fi

print_success "Frontend exposed: $FRONTEND_URL"

# Update frontend to use backend URL
print_info "Configuring frontend to use backend URL..."
echo "VITE_API_URL=$BACKEND_URL" > .env.local
print_success "Created .env.local with backend URL"

# Update backend CORS settings
print_info "Updating backend CORS settings..."
cd "$PROJECT_ROOT/backend"
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Restart backend with proper CORS settings
pkill -f "manage.py runserver.*$BACKEND_PORT" 2>/dev/null || true
sleep 2

export ALLOWED_HOSTS="*"
export CORS_ALLOW_ALL_ORIGINS="True"
export CSRF_TRUSTED_ORIGINS="$FRONTEND_URL"

python manage.py runserver 0.0.0.0:$BACKEND_PORT > ../.backend.log 2>&1 &
NEW_BACKEND_PID=$!
echo $NEW_BACKEND_PID > ../.backend.pid
cd "$PROJECT_ROOT"

sleep 3

# Save URLs
cat > .cloudflare-urls.txt <<EOF
# Cloudflare Tunnel URLs - Generated on $(date)

FRONTEND_URL=$FRONTEND_URL
BACKEND_URL=$BACKEND_URL

# Access Information:
# - Frontend: $FRONTEND_URL
# - Backend API: $BACKEND_URL
# - API Docs: $BACKEND_URL/api/docs
# - Admin Panel: $BACKEND_URL/admin

# Note: Restart your Vite dev server to pick up the new VITE_API_URL
# Stop current server (Ctrl+C) and run: npm run dev
EOF

print_success "URLs saved to .cloudflare-urls.txt"

echo ""
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Cloudflare Tunnel Setup Complete!${NC}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo ""
echo -e "📍 ${BLUE}Frontend:${NC} $FRONTEND_URL"
echo -e "📍 ${BLUE}Backend:${NC}  $BACKEND_URL"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC} Restart your Vite dev server to use the new backend URL:"
echo -e "   1. Stop current server (Ctrl+C in the terminal running 'npm run dev')"
echo -e "   2. Restart: ${GREEN}npm run dev${NC}"
echo ""
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop all tunnels"
echo ""

# Keep script running
wait

