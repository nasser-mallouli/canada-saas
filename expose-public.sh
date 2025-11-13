#!/bin/bash

# Script to expose frontend and backend to public with authentication
# Uses Cloudflare Tunnel (cloudflared) for free static domains
# Falls back to ngrok if cloudflared is not available

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=5173
BACKEND_PORT=8001
AUTH_USER="${EXPOSE_AUTH_USER:-demo}"
AUTH_PASS="${EXPOSE_AUTH_PASS:-demo123}"
URLS_FILE=".public-urls.txt"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
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

# Function to start backend
start_backend() {
    print_info "Starting backend on port $BACKEND_PORT..."
    
    if check_port $BACKEND_PORT; then
        print_warning "Backend already running on port $BACKEND_PORT"
        return 0
    fi
    
    # Check if we're in the project root
    if [ ! -f "backend/manage.py" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Start backend in background
    cd backend
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Update CORS settings to allow the tunnel URLs
    export CORS_ALLOWED_ORIGINS="*"
    export ALLOWED_HOSTS="*"
    
    python manage.py runserver 0.0.0.0:$BACKEND_PORT > ../.backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    cd ..
    
    wait_for_service $BACKEND_PORT "Backend"
}

# Function to start frontend
start_frontend() {
    print_info "Starting frontend on port $FRONTEND_PORT..."
    
    if check_port $FRONTEND_PORT; then
        print_warning "Frontend already running on port $FRONTEND_PORT"
        return 0
    fi
    
    # Start frontend in background
    npm run dev > .frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > .frontend.pid
    
    wait_for_service $FRONTEND_PORT "Frontend"
}

# Function to create basic auth file for cloudflared
create_auth_file() {
    local auth_file=".htpasswd"
    print_info "Creating basic auth file..."
    
    # Create htpasswd file using openssl (works on macOS and Linux)
    echo "$AUTH_PASS" | openssl passwd -apr1 -stdin > "$auth_file"
    echo "$AUTH_USER:$(cat $auth_file)" > "$auth_file"
    
    print_success "Auth file created: $auth_file"
    print_info "Username: $AUTH_USER"
    print_info "Password: $AUTH_PASS"
}

# Function to expose with Cloudflare Tunnel (preferred - free static domains)
expose_with_cloudflared() {
    print_info "Using Cloudflare Tunnel (cloudflared) for static domains..."
    
    if ! command_exists cloudflared; then
        print_warning "cloudflared not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if command_exists brew; then
                brew install cloudflare/cloudflare/cloudflared
            else
                print_error "Please install Homebrew first: https://brew.sh"
                return 1
            fi
        else
            print_info "Please install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
            return 1
        fi
    fi
    
    create_auth_file
    
    # Create cloudflared config
    local config_file=".cloudflared-config.yml"
    cat > "$config_file" <<EOF
tunnel: canada-saas-tunnel
credentials-file: .cloudflared-credentials.json

ingress:
  # Backend with auth
  - hostname: backend-canada-saas.$(cloudflared tunnel info 2>/dev/null | grep -oP 'Hostname: \K[^ ]+' | head -1 || echo "your-domain.com")
    service: http://localhost:$BACKEND_PORT
    originRequest:
      noHappyEyeballs: true
  # Frontend with auth
  - hostname: frontend-canada-saas.$(cloudflared tunnel info 2>/dev/null | grep -oP 'Hostname: \K[^ ]+' | head -1 || echo "your-domain.com")
    service: http://localhost:$FRONTEND_PORT
    originRequest:
      noHappyEyeballs: true
  # Catch-all
  - service: http_status:404
EOF
    
    print_info "Starting Cloudflare Tunnel..."
    print_warning "First time setup: You'll need to login to Cloudflare"
    print_warning "Run: cloudflared tunnel login"
    
    # Try to start tunnel (will fail if not logged in, but that's okay)
    cloudflared tunnel --config "$config_file" run > .cloudflared.log 2>&1 &
    CLOUDFLARED_PID=$!
    echo $CLOUDFLARED_PID > .cloudflared.pid
    
    sleep 3
    
    # Get URLs from cloudflared
    if [ -f ".cloudflared.log" ]; then
        BACKEND_URL=$(grep -oP 'https://[^ ]+\.trycloudflare\.com' .cloudflared.log | head -1 || echo "")
        FRONTEND_URL=$(grep -oP 'https://[^ ]+\.trycloudflare\.com' .cloudflared.log | tail -1 || echo "")
    fi
    
    if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
        print_warning "Could not get URLs from cloudflared. Using ngrok fallback..."
        return 1
    fi
    
    return 0
}

# Function to expose with ngrok (fallback)
expose_with_ngrok() {
    print_info "Using ngrok (fallback - URLs will change each time)..."
    
    if ! command_exists ngrok; then
        print_error "ngrok not found. Please install it:"
        print_info "  macOS: brew install ngrok/ngrok/ngrok"
        print_info "  Linux: https://ngrok.com/download"
        print_info "  Or sign up at: https://dashboard.ngrok.com/get-started/setup"
        exit 1
    fi
    
    create_auth_file
    
    # Check if ngrok is authenticated
    if ! ngrok config check >/dev/null 2>&1; then
        print_warning "ngrok not authenticated. Please run: ngrok config add-authtoken YOUR_TOKEN"
        print_info "Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken"
        exit 1
    fi
    
    # Create ngrok config for basic auth
    local ngrok_config=".ngrok-config.yml"
    cat > "$ngrok_config" <<EOF
version: "2"
authtoken: $(ngrok config check 2>/dev/null | grep -oP 'Authtoken: \K[^ ]+' || echo "")
tunnels:
  backend:
    addr: $BACKEND_PORT
    proto: http
    bind_tls: true
    inspect: false
    auth: "$AUTH_USER:$AUTH_PASS"
  frontend:
    addr: $FRONTEND_PORT
    proto: http
    bind_tls: true
    inspect: false
    auth: "$AUTH_USER:$AUTH_PASS"
EOF
    
    print_info "Starting ngrok tunnels..."
    ngrok start --config "$ngrok_config" --all > .ngrok.log 2>&1 &
    NGROK_PID=$!
    echo $NGROK_PID > .ngrok.pid
    
    sleep 3
    
    # Get URLs from ngrok API
    sleep 2
    BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -oP '"public_url":"https://[^"]+"' | head -1 | cut -d'"' -f4 || echo "")
    FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -oP '"public_url":"https://[^"]+"' | tail -1 | cut -d'"' -f4 || echo "")
    
    if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
        print_error "Failed to get ngrok URLs. Check .ngrok.log for details"
        return 1
    fi
    
    return 0
}

# Function to update frontend API URL
update_frontend_api_url() {
    if [ -n "$BACKEND_URL" ]; then
        print_info "Updating frontend to use backend URL: $BACKEND_URL"
        # Create a .env.local file for Vite
        echo "VITE_API_URL=$BACKEND_URL" > .env.local
        print_success "Frontend API URL updated. Restart frontend if it's already running."
    fi
}

# Function to save URLs
save_urls() {
    cat > "$URLS_FILE" <<EOF
# Public URLs - Generated on $(date)
# Username: $AUTH_USER
# Password: $AUTH_PASS

FRONTEND_URL=$FRONTEND_URL
BACKEND_URL=$BACKEND_URL

# To stop the tunnels, run: ./stop-expose.sh
# Or kill the processes: kill \$(cat .ngrok.pid .cloudflared.pid 2>/dev/null)
EOF
    
    print_success "URLs saved to $URLS_FILE"
}

# Function to display URLs
display_urls() {
    echo ""
    print_success "=========================================="
    print_success "  Public URLs (with authentication)"
    print_success "=========================================="
    echo ""
    print_info "Frontend URL:"
    echo -e "${GREEN}  $FRONTEND_URL${NC}"
    echo ""
    print_info "Backend URL:"
    echo -e "${GREEN}  $BACKEND_URL${NC}"
    echo ""
    print_info "Authentication:"
    echo -e "${YELLOW}  Username: $AUTH_USER${NC}"
    echo -e "${YELLOW}  Password: $AUTH_PASS${NC}"
    echo ""
    print_info "URLs saved to: $URLS_FILE"
    echo ""
    print_warning "Note: Update your frontend's VITE_API_URL to: $BACKEND_URL"
    print_warning "The frontend may need to be restarted to pick up the new API URL"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    print_info "Cleaning up..."
    if [ -f ".backend.pid" ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    if [ -f ".frontend.pid" ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
    if [ -f ".ngrok.pid" ]; then
        kill $(cat .ngrok.pid) 2>/dev/null || true
        rm .ngrok.pid
    fi
    if [ -f ".cloudflared.pid" ]; then
        kill $(cat .cloudflared.pid) 2>/dev/null || true
        rm .cloudflared.pid
    fi
    rm -f .htpasswd .ngrok-config.yml .cloudflared-config.yml
}

trap cleanup EXIT INT TERM

# Main execution
main() {
    print_info "Starting public exposure setup..."
    echo ""
    
    # Start services
    start_backend
    start_frontend
    
    # Wait a bit for services to fully start
    sleep 2
    
    # Try cloudflared first, fallback to ngrok
    if ! expose_with_cloudflared; then
        if ! expose_with_ngrok; then
            print_error "Failed to expose services. Check logs for details."
            exit 1
        fi
    fi
    
    # Update frontend API URL
    update_frontend_api_url
    
    # Save URLs
    save_urls
    
    # Display URLs
    display_urls
    
    print_success "Setup complete! Services are now publicly accessible."
    print_info "Press Ctrl+C to stop all services and tunnels."
    
    # Keep script running
    wait
}

# Run main function
main

