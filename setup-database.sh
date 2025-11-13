#!/bin/bash

# Script to set up database and run all migrations on a new machine
# This ensures the database is ready before starting the app

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    print_warning "Virtual environment not found. Creating one..."
    
    # Try to find Python 3.11 or 3.12
    if command -v python3.11 &> /dev/null; then
        PYTHON_CMD="python3.11"
    elif command -v python3.12 &> /dev/null; then
        PYTHON_CMD="python3.12"
    elif command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    else
        print_error "Python 3 not found. Please install Python 3.11 or 3.12"
        exit 1
    fi
    
    print_info "Creating virtual environment with $PYTHON_CMD..."
    $PYTHON_CMD -m venv venv
fi

# Activate venv
source venv/bin/activate

# Verify Python version
PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
print_info "Using Python $PYTHON_VERSION"

# Check if Django is installed
if ! python -c "import django" 2>/dev/null; then
    print_info "Installing dependencies..."
    pip install --upgrade pip -q
    pip install -r requirements.txt -q
fi

print_info ""
print_info "🗄️  Setting up database..."

# Create all migrations
print_info "Creating migrations for all apps..."
python manage.py makemigrations core --no-input || {
    print_warning "Some migrations may already exist, continuing..."
}

# Show what migrations will be applied
print_info "Checking migration status..."
python manage.py showmigrations core 2>/dev/null || true

# Apply migrations
print_info "Applying migrations to database..."
python manage.py migrate --no-input

# Check if migrations were successful
if [ $? -eq 0 ]; then
    print_success "✅ Database setup complete!"
    print_info ""
    print_info "Database tables created:"
    python manage.py showmigrations core 2>/dev/null | grep "\[X\]" | wc -l | xargs echo "  - Applied migrations:"
    print_info ""
    print_info "You can now:"
    print_info "  1. Create a superuser: ./create-admin-user.sh"
    print_info "  2. Start the app: ./start-and-expose.sh"
else
    print_error "Database setup failed!"
    exit 1
fi

cd ..

