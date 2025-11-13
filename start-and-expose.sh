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
# Default credentials (password must be 8-128 characters for ngrok)
AUTH_USER="${EXPOSE_AUTH_USER:-demo}"
AUTH_PASS="${EXPOSE_AUTH_PASS:-DemoPass123!}"
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
        print_info "Restarting backend to apply ALLOWED_HOSTS settings for public exposure..."
        
        # Kill existing backend
        if [ -f ".backend.pid" ]; then
            local old_pid=$(cat .backend.pid 2>/dev/null || echo "")
            if [ -n "$old_pid" ]; then
                kill $old_pid 2>/dev/null || true
                sleep 2
            fi
        fi
        # Also try to kill by port
        pkill -f "manage.py runserver.*$BACKEND_PORT" 2>/dev/null || true
        sleep 1
    fi
    
    cd "$PROJECT_ROOT/backend"
    
    # Set environment variables for public exposure
    export ALLOWED_HOSTS="*"
    export CORS_ALLOWED_ORIGINS="*"
    
    # Check if venv exists and activate it
    if [ -d "venv" ]; then
        source venv/bin/activate
        print_info "Virtual environment activated"
    else
        print_warning "Virtual environment not found. Please run backend setup first:"
        print_info "  cd backend && ./start.sh"
        cd "$PROJECT_ROOT"
        return 1
    fi
    
    # Verify Python and Django are available
    if ! python -c "import django" 2>/dev/null; then
        print_error "Django not found in virtual environment"
        print_info "Installing dependencies..."
        pip install -r requirements.txt -q || {
            print_error "Failed to install dependencies. Check .backend.log"
            cd "$PROJECT_ROOT"
            return 1
        }
    fi
    
    # Run migrations (quick check)
    print_info "Checking database..."
    python manage.py migrate --no-input > ../.backend-migrate.log 2>&1 || true
    
    # Start the server
    print_info "Starting Django server on port $BACKEND_PORT..."
    python manage.py runserver 0.0.0.0:$BACKEND_PORT > ../.backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    
    cd "$PROJECT_ROOT"
    
    # Wait for backend to start
    if ! wait_for_service $BACKEND_PORT "Backend"; then
        print_error "Backend failed to start. Checking logs..."
        if [ -f ".backend.log" ]; then
            print_info "Last 20 lines of backend.log:"
            tail -20 .backend.log | sed 's/^/  /'
        fi
        if [ -f ".backend-migrate.log" ]; then
            print_info "Migration log:"
            tail -10 .backend-migrate.log | sed 's/^/  /'
        fi
        return 1
    fi
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

# Extract URL from ngrok API response
extract_url_from_api() {
    local api_port=$1
    local target_port=$2
    local max_attempts=15
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        sleep 2
        local response=$(curl -s http://localhost:$api_port/api/tunnels 2>/dev/null || echo "")
        
        if [ -n "$response" ]; then
            # Try to extract URL using Python (more reliable)
            local url=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    for tunnel in tunnels:
        config = tunnel.get('config', {})
        addr = config.get('addr', '')
        if '$target_port' in str(addr):
            print(tunnel.get('public_url', ''))
            break
except:
    pass
" 2>/dev/null || echo "")
            
            if [ -n "$url" ]; then
                echo "$url"
                return 0
            fi
            
            # Fallback: try to get first URL if we can't match by port
            if [ -z "$url" ] && [ $attempt -eq 5 ]; then
                url=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    if tunnels:
        print(tunnels[0].get('public_url', ''))
except:
    pass
" 2>/dev/null || echo "")
                if [ -n "$url" ]; then
                    echo "$url"
                    return 0
                fi
            fi
        fi
        
        attempt=$((attempt + 1))
    done
    
    return 1
}

# Expose with ngrok (v3 compatible - uses command-line flags)
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
    
    # Validate password length (ngrok requires 8-128 characters)
    local pass_len=${#AUTH_PASS}
    if [ $pass_len -lt 8 ] || [ $pass_len -gt 128 ]; then
        print_error "Password must be between 8 and 128 characters (current: $pass_len characters)"
        print_info "Current password: $AUTH_PASS"
        print_info ""
        print_info "Please set a valid password:"
        print_info "  export EXPOSE_AUTH_PASS='YourPassword123!'"
        print_info ""
        print_info "Or use the default password (DemoPass123!) by not setting EXPOSE_AUTH_PASS"
        return 1
    fi
    
    # Kill any existing ngrok processes
    pkill -f "ngrok http" 2>/dev/null || true
    sleep 1
    
    print_info "Starting ngrok tunnels with authentication..."
    
    # Start backend tunnel
    print_info "Starting backend tunnel..."
    ngrok http $BACKEND_PORT --basic-auth="$AUTH_USER:$AUTH_PASS" > .backend-ngrok.log 2>&1 &
    BACKEND_NGROK_PID=$!
    echo $BACKEND_NGROK_PID > .backend-ngrok.pid
    
    # Wait for backend tunnel to be ready
    sleep 5
    
    # Get backend URL
    print_info "Getting backend URL..."
    BACKEND_URL=$(extract_url_from_api 4040 $BACKEND_PORT)
    
    if [ -z "$BACKEND_URL" ]; then
        print_error "Failed to get backend URL. Check .backend-ngrok.log"
        if [ -f ".backend-ngrok.log" ]; then
            print_info "Last 10 lines of backend-ngrok.log:"
            tail -10 .backend-ngrok.log
        fi
        return 1
    fi
    
    print_success "Backend tunnel: $BACKEND_URL"
    
    # Extract domain from backend URL to add to ALLOWED_HOSTS
    local backend_domain=$(echo "$BACKEND_URL" | sed 's|https\?://||' | sed 's|/.*||')
    print_info "Adding ngrok domain to ALLOWED_HOSTS: $backend_domain"
    
    # Start frontend tunnel with a slight delay to avoid conflicts
    print_info "Starting frontend tunnel..."
    sleep 2
    
    # Try to start frontend tunnel - ngrok free tier may have limitations
    ngrok http $FRONTEND_PORT --basic-auth="$AUTH_USER:$AUTH_PASS" > .frontend-ngrok.log 2>&1 &
    FRONTEND_NGROK_PID=$!
    echo $FRONTEND_NGROK_PID > .frontend-ngrok.pid
    
    # Wait for frontend tunnel to be ready
    sleep 8
    
    # Function to extract URL from ngrok log
    extract_url_from_log() {
        local log_file=$1
        if [ -f "$log_file" ]; then
            # Try to find URL in log (ngrok prints it in various formats)
            local url=$(grep -oP 'https://[a-z0-9-]+\.ngrok-free\.dev' "$log_file" 2>/dev/null | head -1 || echo "")
            if [ -z "$url" ]; then
                # Try alternative format
                url=$(grep -oP 'https://[a-z0-9-]+\.ngrok\.io' "$log_file" 2>/dev/null | head -1 || echo "")
            fi
            if [ -z "$url" ]; then
                # Try to find in "Forwarding" line
                url=$(grep -i "forwarding" "$log_file" 2>/dev/null | grep -oP 'https://[^\s]+' | head -1 || echo "")
            fi
            echo "$url"
        fi
    }
    
    # Check if frontend tunnel started successfully
    if ! kill -0 $FRONTEND_NGROK_PID 2>/dev/null; then
        print_warning "Frontend tunnel process ended. Checking logs for URL..."
        
        # Try to extract URL from log file
        local log_url=$(extract_url_from_log ".frontend-ngrok.log")
        
        if [ -f ".frontend-ngrok.log" ]; then
            local error_log=$(tail -10 .frontend-ngrok.log)
            
            if [ -n "$log_url" ]; then
                print_success "Found frontend URL in logs: $log_url"
                FRONTEND_URL="$log_url"
            elif echo "$error_log" | grep -q "already online"; then
                print_warning "ngrok free tier limitation: Can't run multiple tunnels simultaneously"
                print_info "Checking if frontend tunnel is accessible via ngrok web interface..."
                
                # Try to get from API one more time (sometimes it shows up)
                sleep 2
                local api_url=$(extract_url_from_api 4040 $FRONTEND_PORT)
                if [ -n "$api_url" ] && [ "$api_url" != "$BACKEND_URL" ]; then
                    FRONTEND_URL="$api_url"
                    print_success "Frontend tunnel found via API: $FRONTEND_URL"
                else
                    print_info "Frontend tunnel not available. Showing log contents:"
                    echo "$error_log"
                    print_info ""
                    print_info "Solution: Frontend is accessible locally at http://localhost:$FRONTEND_PORT"
                    print_info "Or check ngrok web interface: http://localhost:4040"
                    FRONTEND_URL="http://localhost:$FRONTEND_PORT (check .frontend-ngrok.log or http://localhost:4040)"
                fi
            else
                print_info "Frontend tunnel error. Showing log contents:"
                echo "$error_log"
                print_info ""
                print_info "Trying to extract URL from log..."
                if [ -n "$log_url" ]; then
                    FRONTEND_URL="$log_url"
                    print_success "Frontend URL from log: $FRONTEND_URL"
                else
                    FRONTEND_URL="http://localhost:$FRONTEND_PORT (tunnel failed - check .frontend-ngrok.log)"
                fi
            fi
        else
            FRONTEND_URL="http://localhost:$FRONTEND_PORT (no log file found)"
        fi
    else
        # Get frontend URL (check API again - it should now show frontend or both)
        print_info "Getting frontend URL..."
        FRONTEND_URL=$(extract_url_from_api 4040 $FRONTEND_PORT)
        
        # If we got the same URL (backend), try to get the other one
        if [ "$FRONTEND_URL" = "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
            # Try to get all tunnels and find the one for frontend port
            local all_tunnels=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null || echo "")
            if [ -n "$all_tunnels" ]; then
                FRONTEND_URL=$(echo "$all_tunnels" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    frontend_url = ''
    for tunnel in tunnels:
        config = tunnel.get('config', {})
        addr = config.get('addr', '')
        if '$FRONTEND_PORT' in str(addr):
            frontend_url = tunnel.get('public_url', '')
            break
    # If still not found, get the last tunnel (assuming it's frontend)
    if not frontend_url and len(tunnels) > 1:
        frontend_url = tunnels[-1].get('public_url', '')
    print(frontend_url)
except:
    pass
" 2>/dev/null || echo "")
            fi
        fi
        
        # If still not found, try extracting from log
        if [ -z "$FRONTEND_URL" ] || [ "$FRONTEND_URL" = "$BACKEND_URL" ]; then
            print_info "Trying to extract frontend URL from log file..."
            local log_url=$(extract_url_from_log ".frontend-ngrok.log")
            if [ -n "$log_url" ] && [ "$log_url" != "$BACKEND_URL" ]; then
                FRONTEND_URL="$log_url"
                print_success "Frontend URL extracted from log: $FRONTEND_URL"
            else
                print_warning "Could not get frontend URL automatically"
                print_info "Frontend is accessible locally at: http://localhost:$FRONTEND_PORT"
                print_info "Check ngrok web interface: http://localhost:4040"
                print_info "Or check .frontend-ngrok.log for the URL"
                FRONTEND_URL="http://localhost:$FRONTEND_PORT (check .frontend-ngrok.log or http://localhost:4040)"
            fi
        else
            print_success "Frontend tunnel: $FRONTEND_URL"
        fi
    fi
    
    # Final check: if we still don't have a proper URL, show log contents
    if echo "$FRONTEND_URL" | grep -q "localhost\|check\|failed"; then
        print_info ""
        print_info "📋 Frontend tunnel log (last 15 lines):"
        if [ -f ".frontend-ngrok.log" ]; then
            tail -15 .frontend-ngrok.log | sed 's/^/  /'
        else
            print_warning "  Log file not found"
        fi
    fi
    
    print_success "Ngrok tunnels established!"
    return 0
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
    for pid_file in .backend.pid .frontend.pid .backend-ngrok.pid .frontend-ngrok.pid; do
        if [ -f "$pid_file" ]; then
            PID=$(cat "$pid_file" 2>/dev/null || echo "")
            if [ -n "$PID" ]; then
                kill $PID 2>/dev/null || true
            fi
            rm -f "$pid_file"
        fi
    done
    
    # Kill any remaining ngrok processes
    pkill -f "ngrok http" 2>/dev/null || true
    
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

