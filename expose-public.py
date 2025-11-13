#!/usr/bin/env python3
"""
Python script to expose frontend and backend to public with authentication.
Uses ngrok or cloudflared for tunneling with basic HTTP authentication.

Usage:
    python expose-public.py
    # Or with custom credentials:
    EXPOSE_AUTH_USER=testuser EXPOSE_AUTH_PASS=testpass python expose-public.py
"""

import os
import sys
import subprocess
import time
import json
import signal
import requests
from pathlib import Path
from datetime import datetime

# Configuration
FRONTEND_PORT = 5173
BACKEND_PORT = 8001
AUTH_USER = os.getenv("EXPOSE_AUTH_USER", "demo")
AUTH_PASS = os.getenv("EXPOSE_AUTH_PASS", "demo123")
URLS_FILE = ".public-urls.txt"
PROJECT_ROOT = Path(__file__).parent

# Process IDs
pids = {
    "backend": None,
    "frontend": None,
    "tunnel": None
}

# Colors for terminal output
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def print_info(msg):
    print(f"{Colors.BLUE}[INFO]{Colors.NC} {msg}")

def print_success(msg):
    print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {msg}")

def print_warning(msg):
    print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {msg}")

def print_error(msg):
    print(f"{Colors.RED}[ERROR]{Colors.NC} {msg}")

def check_command(cmd):
    """Check if a command exists in PATH"""
    try:
        subprocess.run(["which", cmd], check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError:
        return False

def check_port(port):
    """Check if a port is in use"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result == 0

def wait_for_service(port, service_name, max_attempts=30):
    """Wait for a service to be ready on a port"""
    print_info(f"Waiting for {service_name} to be ready on port {port}...")
    for attempt in range(max_attempts):
        if check_port(port):
            print_success(f"{service_name} is ready!")
            return True
        time.sleep(1)
    print_error(f"{service_name} failed to start on port {port}")
    return False

def start_backend():
    """Start the Django backend"""
    print_info(f"Starting backend on port {BACKEND_PORT}...")
    
    if check_port(BACKEND_PORT):
        print_warning(f"Backend already running on port {BACKEND_PORT}")
        return True
    
    backend_dir = PROJECT_ROOT / "backend"
    if not (backend_dir / "manage.py").exists():
        print_error("Please run this script from the project root directory")
        return False
    
    # Prepare environment
    env = os.environ.copy()
    env["CORS_ALLOWED_ORIGINS"] = "*"
    env["ALLOWED_HOSTS"] = "*"
    
    # Activate virtual environment if it exists
    venv_python = backend_dir / "venv" / "bin" / "python"
    python_cmd = str(venv_python) if venv_python.exists() else sys.executable
    
    # Start backend
    log_file = open(PROJECT_ROOT / ".backend.log", "w")
    process = subprocess.Popen(
        [python_cmd, "manage.py", "runserver", f"0.0.0.0:{BACKEND_PORT}"],
        cwd=backend_dir,
        env=env,
        stdout=log_file,
        stderr=subprocess.STDOUT
    )
    pids["backend"] = process.pid
    
    # Save PID
    (PROJECT_ROOT / ".backend.pid").write_text(str(process.pid))
    
    return wait_for_service(BACKEND_PORT, "Backend")

def start_frontend():
    """Start the frontend dev server"""
    print_info(f"Starting frontend on port {FRONTEND_PORT}...")
    
    if check_port(FRONTEND_PORT):
        print_warning(f"Frontend already running on port {FRONTEND_PORT}")
        return True
    
    # Start frontend
    log_file = open(PROJECT_ROOT / ".frontend.log", "w")
    process = subprocess.Popen(
        ["npm", "run", "dev"],
        stdout=log_file,
        stderr=subprocess.STDOUT
    )
    pids["frontend"] = process.pid
    
    # Save PID
    (PROJECT_ROOT / ".frontend.pid").write_text(str(process.pid))
    
    return wait_for_service(FRONTEND_PORT, "Frontend")

def expose_with_ngrok():
    """Expose services using ngrok with basic auth"""
    print_info("Using ngrok for tunneling...")
    
    if not check_command("ngrok"):
        print_error("ngrok not found. Please install it:")
        print_info("  macOS: brew install ngrok/ngrok/ngrok")
        print_info("  Linux: https://ngrok.com/download")
        return None, None
    
    # Create ngrok config
    config_file = PROJECT_ROOT / ".ngrok-config.yml"
    config_content = f"""version: "2"
tunnels:
  backend:
    addr: {BACKEND_PORT}
    proto: http
    bind_tls: true
    auth: "{AUTH_USER}:{AUTH_PASS}"
  frontend:
    addr: {FRONTEND_PORT}
    proto: http
    bind_tls: true
    auth: "{AUTH_USER}:{AUTH_PASS}"
"""
    config_file.write_text(config_content)
    
    # Start ngrok
    print_info("Starting ngrok tunnels...")
    log_file = open(PROJECT_ROOT / ".ngrok.log", "w")
    process = subprocess.Popen(
        ["ngrok", "start", "--config", str(config_file), "--all"],
        stdout=log_file,
        stderr=subprocess.STDOUT
    )
    pids["tunnel"] = process.pid
    (PROJECT_ROOT / ".ngrok.pid").write_text(str(process.pid))
    
    # Wait for ngrok to start
    time.sleep(5)
    
    # Get URLs from ngrok API
    try:
        response = requests.get("http://localhost:4040/api/tunnels", timeout=5)
        data = response.json()
        tunnels = data.get("tunnels", [])
        
        backend_url = None
        frontend_url = None
        
        for tunnel in tunnels:
            url = tunnel.get("public_url", "")
            config = tunnel.get("config", {})
            addr = config.get("addr", "")
            
            if str(BACKEND_PORT) in addr:
                backend_url = url
            elif str(FRONTEND_PORT) in addr:
                frontend_url = url
        
        if backend_url and frontend_url:
            print_success("Ngrok tunnels established!")
            return backend_url, frontend_url
        else:
            print_error("Could not retrieve ngrok URLs")
            return None, None
    except Exception as e:
        print_error(f"Failed to get ngrok URLs: {e}")
        return None, None

def update_frontend_api_url(backend_url):
    """Update frontend's API URL"""
    if backend_url:
        print_info(f"Updating frontend to use backend URL: {backend_url}")
        env_file = PROJECT_ROOT / ".env.local"
        env_file.write_text(f"VITE_API_URL={backend_url}\n")
        print_success("Frontend API URL updated. Restart frontend if needed.")

def save_urls(backend_url, frontend_url):
    """Save URLs to file"""
    content = f"""# Public URLs - Generated on {datetime.now()}
# Username: {AUTH_USER}
# Password: {AUTH_PASS}

FRONTEND_URL={frontend_url}
BACKEND_URL={backend_url}

# To stop the tunnels, run: ./stop-expose.sh
# Or kill the processes: kill $(cat .ngrok.pid .cloudflared.pid 2>/dev/null)
"""
    (PROJECT_ROOT / URLS_FILE).write_text(content)
    print_success(f"URLs saved to {URLS_FILE}")

def display_urls(backend_url, frontend_url):
    """Display the public URLs"""
    print("")
    print_success("==========================================")
    print_success("  Public URLs (with authentication)")
    print_success("==========================================")
    print("")
    print_info("Frontend URL:")
    print(f"{Colors.GREEN}  {frontend_url}{Colors.NC}")
    print("")
    print_info("Backend URL:")
    print(f"{Colors.GREEN}  {backend_url}{Colors.NC}")
    print("")
    print_info("Authentication:")
    print(f"{Colors.YELLOW}  Username: {AUTH_USER}{Colors.NC}")
    print(f"{Colors.YELLOW}  Password: {AUTH_PASS}{Colors.NC}")
    print("")
    print_info(f"URLs saved to: {URLS_FILE}")
    print("")
    print_warning(f"Note: Update your frontend's VITE_API_URL to: {backend_url}")
    print_warning("The frontend may need to be restarted to pick up the new API URL")
    print("")

def cleanup():
    """Cleanup function to stop all processes"""
    print_info("Cleaning up...")
    
    for service, pid_file in [("backend", ".backend.pid"), ("frontend", ".frontend.pid"), 
                              ("tunnel", ".ngrok.pid"), ("tunnel", ".cloudflared.pid")]:
        pid_path = PROJECT_ROOT / pid_file
        if pid_path.exists():
            try:
                pid = int(pid_path.read_text().strip())
                os.kill(pid, signal.SIGTERM)
                print_success(f"Stopped {service} (PID: {pid})")
            except (ValueError, ProcessLookupError, OSError):
                pass
            pid_path.unlink(missing_ok=True)
    
    # Cleanup config files
    for config_file in [".htpasswd", ".ngrok-config.yml", ".cloudflared-config.yml"]:
        (PROJECT_ROOT / config_file).unlink(missing_ok=True)

def signal_handler(sig, frame):
    """Handle Ctrl+C"""
    print("\n")
    cleanup()
    sys.exit(0)

def main():
    """Main function"""
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print_info("Starting public exposure setup...")
    print("")
    
    # Start services
    if not start_backend():
        cleanup()
        sys.exit(1)
    
    if not start_frontend():
        cleanup()
        sys.exit(1)
    
    # Wait a bit for services to fully start
    time.sleep(2)
    
    # Expose with ngrok
    backend_url, frontend_url = expose_with_ngrok()
    
    if not backend_url or not frontend_url:
        print_error("Failed to expose services. Check logs for details.")
        cleanup()
        sys.exit(1)
    
    # Update frontend API URL
    update_frontend_api_url(backend_url)
    
    # Save URLs
    save_urls(backend_url, frontend_url)
    
    # Display URLs
    display_urls(backend_url, frontend_url)
    
    print_success("Setup complete! Services are now publicly accessible.")
    print_info("Press Ctrl+C to stop all services and tunnels.")
    
    # Keep script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()

if __name__ == "__main__":
    main()

