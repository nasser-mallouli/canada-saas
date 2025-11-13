#!/bin/bash

# Unified script to start the app AND expose it publicly with password protection
# This is the ONE script you need to run everything!

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
AUTH_USER="${EXPOSE_AUTH_USER:-demo}"
AUTH_PASS="${EXPOSE_AUTH_PASS:-demo123}"
URLS_FILE=".public-urls.txt"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print functions
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${CYAN}════════════════════════════════════════${NC}"; }

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Wait for service
wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=0
    
    print_info "Waiting for $service to be ready on port $port..."
    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            print_success "$service is ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    print_error "$service failed to start on port $port"
    return 1
}

# Start backend
start_backend() {
    print_info "🚀 Starting backend..."
    
    if check_port $BACKEND_PORT; then
        print_warning "Backend already running on port $BACKEND_PORT"
        return 0
    fi
    
    cd "$PROJECT_ROOT/backend"
    
    # Use the existing start.sh script if available, otherwise start manually
    if [ -f "start.sh" ]; then
        # Start backend in background using the existing script
        bash start.sh > ../.backend.log 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../.backend.pid
    else
        # Manual start
        if [ -d "venv" ]; then
            source venv/bin/activate
        fi
        
        export CORS_ALLOWED_ORIGINS="*"
        export ALLOWED_HOSTS="*"
        
        python manage.py runserver 0.0.0.0:$BACKEND_PORT > ../.backend.log 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../.backend.pid
    fi
    
    cd "$PROJECT_ROOT"
    wait_for_service $BACKEND_PORT "Backend"
}

# Start frontend
start_frontend() {
    print_info "🚀 Starting frontend..."
    
    if check_port $FRONTEND_PORT; then
        print_warning "Frontend already running on port $FRONTEND_PORT"
        return 0
    fi
    
    # Start frontend
    npm run dev > .frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > .frontend.pid
    
    wait_for_service $FRONTEND_PORT "Frontend"
}

# Expose with ngrok
expose_with_ngrok() {
    print_info "🌐 Setting up public access with ngrok..."
    
    if ! command_exists ngrok; then
        print_error "ngrok not found!"
        print_info "Install it with:"
        print_info "  macOS: brew install ngrok/ngrok/ngrok"
        print_info "  Linux: https://ngrok.com/download"
        print_info ""
        print_info "Then authenticate:"
        print_info "  ngrok config add-authtoken YOUR_TOKEN"
        print_info "  Get token from: https://dashboard.ngrok.com/get-started/your-authtoken"
        return 1
    fi
    
    # Check if ngrok is authenticated
    if ! ngrok config check >/dev/null 2>&1; then
        print_error "ngrok not authenticated!"
        print_info "Run: ngrok config add-authtoken YOUR_TOKEN"
        print_info "Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken"
        return 1
    fi
    
    # Create ngrok config with basic auth
    local ngrok_config=".ngrok-config.yml"
    cat > "$ngrok_config" <<EOF
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
    
    print_info "Starting ngrok tunnels with authentication..."
    ngrok start --config "$ngrok_config" --all > .ngrok.log 2>&1 &
    NGROK_PID=$!
    echo $NGROK_PID > .ngrok.pid
    
    sleep 5
    
    # Get URLs from ngrok API
    local max_attempts=10
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        sleep 2
        local response=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null || echo "")
        if [ -n "$response" ]; then
            BACKEND_URL=$(echo "$response" | grep -oP '"public_url":"https://[^"]+"' | head -1 | cut -d'"' -f4 || echo "")
            FRONTEND_URL=$(echo "$response" | grep -oP '"public_url":"https://[^"]+"' | tail -1 | cut -d'"' -f4 || echo "")
            
            if [ -n "$BACKEND_URL" ] && [ -n "$FRONTEND_URL" ]; then
                print_success "Ngrok tunnels established!"
                return 0
            fi
        fi
        attempt=$((attempt + 1))
    done
    
    print_error "Failed to get ngrok URLs. Check .ngrok.log for details"
    return 1
}

# Update frontend API URL
update_frontend_api_url() {
    if [ -n "$BACKEND_URL" ]; then
        print_info "Updating frontend API URL to use public backend..."
        echo "VITE_API_URL=$BACKEND_URL" > .env.local
        print_success "Frontend API URL updated"
        print_warning "Note: Frontend may need a moment to pick up the new URL"
    fi
}

# Save URLs
save_urls() {
    cat > "$URLS_FILE" <<EOF
# Public URLs - Generated on $(date)
# Username: $AUTH_USER
# Password: $AUTH_PASS

FRONTEND_URL=$FRONTEND_URL
BACKEND_URL=$BACKEND_URL

# Access Information:
# - Frontend: $FRONTEND_URL
# - Backend API: $BACKEND_URL
# - API Docs: $BACKEND_URL/api/docs
# - Admin Panel: $BACKEND_URL/admin

# Authentication:
# Username: $AUTH_USER
# Password: $AUTH_PASS

# To stop everything, press Ctrl+C or run: ./stop-expose.sh
EOF
    
    print_success "URLs saved to $URLS_FILE"
}

# Display results
display_results() {
    echo ""
    print_header
    print_success "  🎉 Application is now running and publicly accessible!"
    print_header
    echo ""
    print_info "📍 Access URLs:"
    echo ""
    echo -e "  ${GREEN}Frontend:${NC}    $FRONTEND_URL"
    echo -e "  ${GREEN}Backend API:${NC}  $BACKEND_URL"
    echo -e "  ${GREEN}API Docs:${NC}     $BACKEND_URL/api/docs"
    echo -e "  ${GREEN}Admin Panel:${NC}  $BACKEND_URL/admin"
    echo ""
    print_info "🔐 Authentication:"
    echo ""
    echo -e "  ${YELLOW}Username:${NC} $AUTH_USER"
    echo -e "  ${YELLOW}Password:${NC} $AUTH_PASS"
    echo ""
    print_info "💡 Local Access (no password needed):"
    echo ""
    echo -e "  Frontend: ${CYAN}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "  Backend:  ${CYAN}http://localhost:$BACKEND_PORT${NC}"
    echo ""
    print_info "📝 URLs saved to: $URLS_FILE"
    echo ""
    print_warning "⚠️  Note: ngrok URLs change each time you restart"
    print_warning "   For static URLs, see PUBLIC_EXPOSE_README.md"
    echo ""
    print_info "Press Ctrl+C to stop all services"
    echo ""
}

# Cleanup function
cleanup() {
    echo ""
    print_info "Cleaning up..."
    
    # Kill processes
    for pid_file in .backend.pid .frontend.pid .ngrok.pid; do
        if [ -f "$pid_file" ]; then
            PID=$(cat "$pid_file" 2>/dev/null || echo "")
            if [ -n "$PID" ]; then
                kill $PID 2>/dev/null || true
            fi
            rm -f "$pid_file"
        fi
    done
    
    # Kill any remaining processes
    pkill -f "ngrok start" 2>/dev/null || true
    
    # Cleanup config files
    rm -f .ngrok-config.yml .env.local
    
    print_success "Cleanup complete!"
}

# Trap signals
trap cleanup EXIT INT TERM

# Main execution
main() {
    clear
    print_header
    echo -e "${CYAN}  Canada SaaS - Start & Expose Script${NC}"
    print_header
    echo ""
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found"
        exit 1
    fi
    
    # Check if npm dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Frontend dependencies not installed. Installing..."
        npm install
    fi
    
    echo ""
    
    # Start services
    start_backend
    start_frontend
    
    # Wait a bit
    sleep 2
    
    # Expose publicly
    if ! expose_with_ngrok; then
        print_error "Failed to expose services publicly"
        print_info "Services are still running locally:"
        print_info "  Frontend: http://localhost:$FRONTEND_PORT"
        print_info "  Backend: http://localhost:$BACKEND_PORT"
        print_info ""
        print_info "Press Ctrl+C to stop"
        wait
        exit 1
    fi
    
    # Update frontend
    update_frontend_api_url
    
    # Save URLs
    save_urls
    
    # Display results
    display_results
    
    # Keep running
    wait
}

# Run main
main

