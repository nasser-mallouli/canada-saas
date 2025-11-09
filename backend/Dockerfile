FROM python:3.11-slim
# Using Python 3.11 for django-ninja-jwt compatibility (Pydantic v1 doesn't support 3.14+)

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Run migrations and start server
# Note: Port mapping in docker-compose maps host 8001 to container 8000
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000

