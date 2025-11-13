#!/bin/bash

# Alternative script using Localtunnel (free, no signup needed)
# Easier than ngrok but URLs may change

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

FRONTEND_PORT=5173
BACKEND_PORT=8001
URLS_FILE=".public-urls.txt"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${CYAN}════════════════════════════════════════${NC}"; }

# Check if localtunnel is installed
if ! command -v lt >/dev/null 2>&1; then
    print_error "localtunnel not found!"
    print_info "Install it with:"
    print_info "  npm install -g localtunnel"
    exit 1
fi

# Check prerequisites
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_header
echo -e "${CYAN}  Canada SaaS - Expose with Localtunnel${NC}"
print_header
echo ""

# Start backend
print_info "🚀 Starting backend..."
cd "$PROJECT_ROOT/backend"

if [ -d "venv" ]; then
    source venv/bin/activate
fi

export ALLOWED_HOSTS="*"
export CORS_ALLOW_ALL_ORIGINS="True"

if ! python -c "import django" 2>/dev/null; then
    print_error "Django not found. Please set up backend first."
    exit 1
fi

python manage.py runserver 0.0.0.0:$BACKEND_PORT > ../.backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.backend.pid
cd "$PROJECT_ROOT"

sleep 3

# Start frontend
print_info "🚀 Starting frontend..."
npm run dev > .frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > .frontend.pid

sleep 3

# Expose with localtunnel
print_info "🌐 Exposing with Localtunnel..."

# Expose frontend
print_info "Exposing frontend..."
lt --port $FRONTEND_PORT > .frontend-tunnel.log 2>&1 &
FRONTEND_TUNNEL_PID=$!
echo $FRONTEND_TUNNEL_PID > .frontend-tunnel.pid

sleep 5

# Extract frontend URL from log
FRONTEND_URL=$(grep -oP 'https://[a-z0-9-]+\.loca\.lt' .frontend-tunnel.log 2>/dev/null | head -1 || echo "")
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL=$(grep -oP 'https://[^\s]+\.loca\.lt' .frontend-tunnel.log 2>/dev/null | head -1 || echo "")
fi

if [ -z "$FRONTEND_URL" ]; then
    print_error "Failed to get frontend URL"
    cat .frontend-tunnel.log
    exit 1
fi

print_success "Frontend: $FRONTEND_URL"

# Expose backend
print_info "Exposing backend..."
lt --port $BACKEND_PORT > .backend-tunnel.log 2>&1 &
BACKEND_TUNNEL_PID=$!
echo $BACKEND_TUNNEL_PID > .backend-tunnel.pid

sleep 5

# Extract backend URL from log
BACKEND_URL=$(grep -oP 'https://[a-z0-9-]+\.loca\.lt' .backend-tunnel.log 2>/dev/null | head -1 || echo "")
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL=$(grep -oP 'https://[^\s]+\.loca\.lt' .backend-tunnel.log 2>/dev/null | head -1 || echo "")
fi

if [ -z "$BACKEND_URL" ]; then
    print_warning "Backend tunnel may not have started"
    BACKEND_URL="http://localhost:$BACKEND_PORT"
else
    print_success "Backend: $BACKEND_URL"
    
    # Update CSRF settings
    export CSRF_TRUSTED_ORIGINS="$BACKEND_URL"
    
    # Restart backend with CSRF settings
    kill $BACKEND_PID 2>/dev/null || true
    sleep 2
    
    cd "$PROJECT_ROOT/backend"
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    export ALLOWED_HOSTS="*"
    export CORS_ALLOW_ALL_ORIGINS="True"
    python manage.py runserver 0.0.0.0:$BACKEND_PORT > ../.backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    cd "$PROJECT_ROOT"
    sleep 3
fi

# Update frontend API URL
echo "VITE_API_URL=$BACKEND_URL" > .env.local

# Save URLs
cat > "$URLS_FILE" <<EOF
# Public URLs - Generated on $(date)
# Using Localtunnel (free, no authentication)

FRONTEND_URL=$FRONTEND_URL
BACKEND_URL=$BACKEND_URL

# Access Information:
# - Frontend: $FRONTEND_URL
# - Backend API: $BACKEND_URL
# - API Docs: $BACKEND_URL/api/docs
# - Admin Panel: $BACKEND_URL/admin

# Note: Localtunnel URLs are public (no password protection)
# For password protection, use ngrok or Cloudflare Tunnel

# To stop everything, press Ctrl+C or run: ./stop-expose.sh
EOF

# Display results
echo ""
print_header
print_success "  🎉 Application is now publicly accessible!"
print_header
echo ""
print_info "📍 Access URLs:"
echo ""
echo -e "  ${GREEN}Frontend:${NC}    $FRONTEND_URL"
echo -e "  ${GREEN}Backend API:${NC}  $BACKEND_URL"
echo -e "  ${GREEN}API Docs:${NC}     $BACKEND_URL/api/docs"
echo -e "  ${GREEN}Admin Panel:${NC}  $BACKEND_URL/admin"
echo ""
print_warning "⚠️  Note: Localtunnel URLs are PUBLIC (no password protection)"
print_warning "   For password protection, use: ./start-and-expose.sh (ngrok)"
echo ""
print_info "Press Ctrl+C to stop all services"
echo ""

# Cleanup function
cleanup() {
    echo ""
    print_info "Cleaning up..."
    for pid_file in .backend.pid .frontend.pid .frontend-tunnel.pid .backend-tunnel.pid; do
        if [ -f "$pid_file" ]; then
            PID=$(cat "$pid_file" 2>/dev/null || echo "")
            if [ -n "$PID" ]; then
                kill $PID 2>/dev/null || true
            fi
            rm -f "$pid_file"
        fi
    done
    pkill -f "lt --port" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    print_success "Cleanup complete!"
}

trap cleanup EXIT INT TERM

wait

