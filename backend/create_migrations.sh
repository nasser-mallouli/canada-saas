#!/bin/bash
# Script to create Django migrations from models

cd "$(dirname "$0")"

echo "Creating Django migrations..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Create migrations
python manage.py makemigrations core

echo "Migrations created successfully!"
echo "Run 'python manage.py migrate' to apply them to the database."

