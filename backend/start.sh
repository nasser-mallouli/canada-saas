#!/bin/bash
# Smart startup script that auto-selects best Python version

set -e  # Exit on error

echo "🚀 Starting Canada SaaS Backend..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if Python version exists
check_python() {
    if command -v "$1" &> /dev/null; then
        VERSION=$($1 --version 2>&1 | awk '{print $2}')
        echo "$VERSION"
        return 0
    fi
    return 1
}

# Find best Python version (prefer 3.11 or 3.12 for compatibility)
PYTHON_CMD=""
PYTHON_VERSION=""

echo "🔍 Detecting Python version..."

# Try Python 3.11 first (best compatibility)
if VERSION=$(check_python python3.11); then
    PYTHON_CMD="python3.11"
    PYTHON_VERSION=$VERSION
    echo -e "${GREEN}✅ Found Python 3.11 ($VERSION)${NC}"
# Try Python 3.12 second
elif VERSION=$(check_python python3.12); then
    PYTHON_CMD="python3.12"
    PYTHON_VERSION=$VERSION
    echo -e "${GREEN}✅ Found Python 3.12 ($VERSION)${NC}"
# Try Python 3.10 as fallback
elif VERSION=$(check_python python3.10); then
    PYTHON_CMD="python3.10"
    PYTHON_VERSION=$VERSION
    echo -e "${YELLOW}⚠️  Found Python 3.10 ($VERSION) - may have compatibility issues${NC}"
# Try generic python3
elif VERSION=$(check_python python3); then
    PYTHON_CMD="python3"
    PYTHON_VERSION=$VERSION
    MAJOR=$(echo $VERSION | cut -d. -f1)
    MINOR=$(echo $VERSION | cut -d. -f2)
    if [ "$MAJOR" -eq 3 ] && [ "$MINOR" -ge 11 ] && [ "$MINOR" -le 12 ]; then
        echo -e "${GREEN}✅ Found Python 3 ($VERSION)${NC}"
    elif [ "$MAJOR" -eq 3 ] && [ "$MINOR" -eq 14 ]; then
        echo -e "${RED}❌ Python 3.14 detected - not compatible with django-ninja-jwt${NC}"
        echo -e "${YELLOW}Please install Python 3.11 or 3.12:${NC}"
        echo "  pyenv install 3.11.9"
        echo "  pyenv local 3.11.9"
        exit 1
    else
        echo -e "${YELLOW}⚠️  Found Python 3 ($VERSION)${NC}"
    fi
else
    echo -e "${RED}❌ No Python 3 found!${NC}"
    echo "Please install Python 3.11 or 3.12"
    exit 1
fi

echo ""
echo "📦 Setting up virtual environment..."

# Remove old venv if it exists and was created with wrong Python version
if [ -d "venv" ]; then
    VENV_PYTHON=$(venv/bin/python --version 2>&1 | awk '{print $2}' || echo "")
    if [ -n "$VENV_PYTHON" ] && [ "$VENV_PYTHON" != "$PYTHON_VERSION" ]; then
        echo "🔄 Removing old virtual environment (Python $VENV_PYTHON)..."
        rm -rf venv
    fi
fi

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment with $PYTHON_CMD..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Verify we're using the right Python
ACTIVE_PYTHON=$(python --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✅ Using Python $ACTIVE_PYTHON${NC}"

# Check if Python 3.14 (incompatible)
MAJOR=$(echo $ACTIVE_PYTHON | cut -d. -f1)
MINOR=$(echo $ACTIVE_PYTHON | cut -d. -f2)
if [ "$MAJOR" -eq 3 ] && [ "$MINOR" -eq 14 ]; then
    echo -e "${RED}❌ Python 3.14 is not compatible with django-ninja-jwt${NC}"
    echo -e "${YELLOW}Please use Python 3.11 or 3.12${NC}"
    exit 1
fi

echo ""
echo "📥 Installing/updating dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo ""
echo "🗄️  Running database migrations..."
python manage.py makemigrations core --no-input || true
python manage.py migrate --no-input

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🌐 Starting Django development server..."
echo "   Backend API: http://localhost:8001"
echo "   API Docs: http://localhost:8001/api/docs"
echo "   Admin: http://localhost:8001/admin"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server on port 8001, binding to all interfaces (0.0.0.0) for network access
python manage.py runserver 0.0.0.0:8001

