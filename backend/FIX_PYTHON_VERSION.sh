#!/bin/bash
# Quick fix script to switch to Python 3.11

echo "🔧 Fixing Python version compatibility issue..."
echo ""
echo "The error is caused by Python 3.14 not being compatible with django-ninja-jwt."
echo "We need to use Python 3.11 or 3.12 instead."
echo ""

# Check if pyenv is available
if command -v pyenv &> /dev/null; then
    echo "✅ pyenv found"
    echo ""
    echo "Installing Python 3.11.9..."
    pyenv install 3.11.9
    
    echo ""
    echo "Setting local Python version to 3.11.9..."
    pyenv local 3.11.9
    
    echo ""
    echo "✅ Python version set to 3.11.9"
    echo ""
    echo "Now recreate your virtual environment:"
    echo "  cd backend"
    echo "  rm -rf venv"
    echo "  python -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    echo "  python manage.py makemigrations core"
    echo "  python manage.py migrate"
    echo "  python manage.py runserver"
else
    echo "❌ pyenv not found"
    echo ""
    echo "Please install Python 3.11 or 3.12 manually:"
    echo "  1. Download from https://www.python.org/downloads/"
    echo "  2. Or install pyenv: brew install pyenv"
    echo "  3. Then run this script again"
fi

