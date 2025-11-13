#!/bin/bash

# Script to create Django admin/superuser for the admin dashboard

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    print_warning "Virtual environment not found. Please run backend setup first:"
    print_info "  cd backend && ./start.sh"
    exit 1
fi

# Activate venv
source venv/bin/activate

print_info "Creating Django admin/superuser..."
print_info ""
print_info "You'll be prompted to enter:"
print_info "  - Username (e.g., 'admin' or your email)"
print_info "  - Email address (optional but recommended)"
print_info "  - Password (twice for confirmation)"
print_info ""
print_warning "⚠️  Remember these credentials - you'll need them to log into /admin"
echo ""

# Create superuser
python manage.py createsuperuser

print_info ""
print_success "✅ Admin user created successfully!"
print_info ""
print_warning "📝 IMPORTANT: Save these credentials!"
print_info "   Username: [the username you just entered]"
print_info "   Password: [the password you just entered]"
print_info ""
print_info "You can now log into the admin dashboard at:"
print_info "   Local: http://localhost:8001/admin"
print_info "   Public: https://your-ngrok-url.ngrok-free.dev/admin"
print_info ""
print_info "Use the credentials you just created to log in."

