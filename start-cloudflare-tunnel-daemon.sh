#!/bin/bash

# Starts backend + frontend dev servers, exposes both with Cloudflare tunnels,
# prints the resulting URLs, and detaches every process so they keep running
# even after the terminal is closed. Use ./stop-expose.sh to stop everything.

set -euo pipefail

FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORT="${BACKEND_PORT:-8001}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
LOG_DIR="$PROJECT_ROOT/.cloudflare"
URLS_FILE="$PROJECT_ROOT/.cloudflare-urls.txt"
mkdir -p "$LOG_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${CYAN}════════════════════════════════════════${NC}"; }

STARTED_PID_FILES=()

record_pid_file() {
    STARTED_PID_FILES+=("$1")
}

cleanup_on_error() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_warning "An error occurred. Cleaning up processes started in this run..."
        for pid_file in "${STARTED_PID_FILES[@]}"; do
            if [ -f "$pid_file" ]; then
                local pid
                pid=$(cat "$pid_file" 2>/dev/null || echo "")
                if [ -n "$pid" ]; then
                    kill "$pid" 2>/dev/null || true
                fi
                rm -f "$pid_file"
            fi
        done
    fi
}
trap cleanup_on_error EXIT

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

check_port() {
    if lsof -Pi :"$1" -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

wait_for_service() {
    local port=$1
    local label=$2
    local attempts=30

    print_info "Waiting for $label to listen on port $port..."
    for ((i=1; i<=attempts; i++)); do
        if check_port "$port"; then
            print_success "$label is up!"
            return 0
        fi
        sleep 1
    done

    print_error "$label failed to start on port $port"
    return 1
}

stop_process() {
    local pid_file=$1
    local label=$2

    if [ -f "$pid_file" ]; then
        local pid
        pid=$(cat "$pid_file" 2>/dev/null || echo "")
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            print_warning "Stopping $label (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            sleep 2
        fi
        rm -f "$pid_file"
    fi
}

ensure_prerequisites() {
    print_info "Checking prerequisites..."

    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found at $BACKEND_DIR"
        exit 1
    fi

    for cmd in python3 npm node cloudflared lsof; do
        if ! command_exists "$cmd"; then
            print_error "$cmd is not installed. Please install it and retry."
            exit 1
        fi
    done
}

ensure_node_modules() {
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        print_warning "node_modules not found. Installing frontend dependencies..."
        cd "$PROJECT_ROOT"
        npm install
    elif [ "${FORCE_NPM_INSTALL:-0}" -eq 1 ]; then
        print_warning "FORCE_NPM_INSTALL=1 detected. Reinstalling frontend dependencies..."
        cd "$PROJECT_ROOT"
        npm install
    fi
    cd "$PROJECT_ROOT"
}

prepare_backend_environment() {
    print_info "Preparing backend virtual environment..."

    if [ ! -d "$BACKEND_DIR/venv" ]; then
        print_error "backend/venv not found. Run 'cd backend && ./start.sh' to bootstrap the backend once."
        exit 1
    fi

    cd "$BACKEND_DIR"
    # shellcheck disable=SC1091
    source venv/bin/activate

    if [ "${SKIP_BACKEND_DEPS:-0}" -eq 0 ]; then
        print_info "Installing backend dependencies (set SKIP_BACKEND_DEPS=1 to skip)..."
        pip install --upgrade pip -q
        pip install -r requirements.txt -q
    else
        print_info "Skipping backend dependency installation (SKIP_BACKEND_DEPS=1)"
    fi

    print_info "Applying database migrations..."
    python manage.py migrate --no-input > "$LOG_DIR/backend-migrate.log" 2>&1

    deactivate
    cd "$PROJECT_ROOT"
}

launch_backend() {
    local csrf_origins="${1:-}"
    stop_process "$PROJECT_ROOT/.backend.pid" "existing backend server"

    print_info "Starting Django backend on port $BACKEND_PORT..."

    local env_block=$'export ALLOWED_HOSTS="*"\nexport CORS_ALLOW_ALL_ORIGINS="True"\n'
    if [ -n "$csrf_origins" ]; then
        env_block+="export CSRF_TRUSTED_ORIGINS=\"$csrf_origins\"\n"
    fi

    nohup bash -c "
        set -e
        cd \"$BACKEND_DIR\"
        source venv/bin/activate
        $env_block
        python manage.py runserver 0.0.0.0:$BACKEND_PORT
    " > "$LOG_DIR/backend.log" 2>&1 &

    local backend_pid=$!
    echo "$backend_pid" > "$PROJECT_ROOT/.backend.pid"
    record_pid_file "$PROJECT_ROOT/.backend.pid"

    wait_for_service "$BACKEND_PORT" "Backend"
}

launch_frontend() {
    stop_process "$PROJECT_ROOT/.frontend.pid" "existing frontend dev server"
    print_info "Starting Vite dev server on port $FRONTEND_PORT..."

    nohup bash -c "
        set -e
        cd \"$PROJECT_ROOT\"
        HOST=0.0.0.0 npm run dev -- --host 0.0.0.0 --port $FRONTEND_PORT
    " > "$LOG_DIR/frontend.log" 2>&1 &

    local frontend_pid=$!
    echo "$frontend_pid" > "$PROJECT_ROOT/.frontend.pid"
    record_pid_file "$PROJECT_ROOT/.frontend.pid"

    wait_for_service "$FRONTEND_PORT" "Frontend"
}

extract_cloudflare_url() {
    local log_file=$1
    local attempts=${2:-20}

    for ((i=1; i<=attempts; i++)); do
        if [ -f "$log_file" ]; then
            local url
            url=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$log_file" 2>/dev/null | head -1 || true)
            if [ -n "$url" ]; then
                echo "$url"
                return 0
            fi
        fi
        sleep 2
    done
    return 1
}

start_cloudflare_tunnel() {
    local label=$1
    local port=$2
    local log_file="$LOG_DIR/${label}-cloudflare.log"
    local pid_file="$PROJECT_ROOT/.${label}-cloudflare.pid"

    stop_process "$pid_file" "$label Cloudflare tunnel"

    print_info "Exposing $label (port $port) via Cloudflare..."
    nohup cloudflared tunnel --url "http://localhost:$port" > "$log_file" 2>&1 &
    local tunnel_pid=$!
    echo "$tunnel_pid" > "$pid_file"
    record_pid_file "$pid_file"

    sleep 5
    local url
    if ! url=$(extract_cloudflare_url "$log_file"); then
        print_error "Unable to detect Cloudflare URL for $label. Check $log_file"
        exit 1
    fi

    print_success "$label tunnel ready: $url"
    echo "$url"
}

update_frontend_env() {
    local backend_url=$1
    print_info "Writing VITE_API_URL to .env.local..."
    cat > "$PROJECT_ROOT/.env.local" <<EOF
VITE_API_URL=$backend_url
EOF
}

save_urls_file() {
    local frontend_url=$1
    local backend_url=$2

    cat > "$URLS_FILE" <<EOF
# Cloudflare Tunnel URLs - Generated on $(date)

FRONTEND_URL=$frontend_url
BACKEND_URL=$backend_url

# Access Information:
# - Frontend: $frontend_url
# - Backend API: $backend_url
# - API Docs: $backend_url/api/docs
# - Admin Panel: $backend_url/admin

# Stop everything: ./stop-expose.sh
EOF

    print_success "Saved URLs to $URLS_FILE"
}

display_summary() {
    local frontend_url=$1
    local backend_url=$2

    echo ""
    print_header
    print_success "  Cloudflare tunnels are live!"
    print_header
    echo ""
    print_info "Frontend URL: $frontend_url"
    print_info "Backend URL:  $backend_url"
    print_info "API Docs:     $backend_url/api/docs"
    print_info "Admin Panel:  $backend_url/admin"
    echo ""
    print_info "Processes are detached. You can close this terminal."
    print_info "Stop everything later with: ./stop-expose.sh"
    echo ""
    print_info "Logs:"
    echo "  Backend:   $LOG_DIR/backend.log"
    echo "  Frontend:  $LOG_DIR/frontend.log"
    echo "  Cloudflare (frontend): $LOG_DIR/frontend-cloudflare.log"
    echo "  Cloudflare (backend):  $LOG_DIR/backend-cloudflare.log"
    echo ""
}

main() {
    ensure_prerequisites
    prepare_backend_environment

    # Start backend locally
    launch_backend

    # Backend tunnel + API URL
    BACKEND_URL=$(start_cloudflare_tunnel "backend" "$BACKEND_PORT")
    update_frontend_env "$BACKEND_URL"

    # Frontend dependencies & server
    ensure_node_modules
    launch_frontend

    # Frontend tunnel
    FRONTEND_URL=$(start_cloudflare_tunnel "frontend" "$FRONTEND_PORT")

    # Restart backend with CSRF settings that trust both domains
    local csrf="$BACKEND_URL"
    if [ -n "$FRONTEND_URL" ]; then
        csrf="$csrf,$FRONTEND_URL"
    fi
    launch_backend "$csrf"

    save_urls_file "$FRONTEND_URL" "$BACKEND_URL"
    display_summary "$FRONTEND_URL" "$BACKEND_URL"

    # Successful completion: remove trap so we don't kill detached jobs
    trap - EXIT
}

main

