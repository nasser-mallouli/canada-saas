"""
Django settings for canada-saas project.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file in the backend directory
load_dotenv(BASE_DIR / '.env')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Allow all hosts if "*" is set (useful for ngrok/public exposure)
ALLOWED_HOSTS_ENV = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1')
if ALLOWED_HOSTS_ENV == '*':
    ALLOWED_HOSTS = ['*']
else:
    ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_ENV.split(',') if host.strip()]
    
    # Also add local network IP for network access (if not already in list)
    import socket
    try:
        # Get local network IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
        s.close()
        # Add network IP if not already in list
        if local_ip not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(local_ip)
    except Exception:
        # If we can't detect IP, just continue with defaults
        pass

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'ninja_jwt',
    'apps.core',
    'apps.api',
    'apps.ai_provider',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
        'OPTIONS': {
            'timeout': 20,  # Increase timeout to handle concurrent access better
        },
    }
}

# Use PostgreSQL if DATABASE_URL is set
if os.getenv('DATABASE_URL'):
    try:
        import dj_database_url
        DATABASES['default'] = dj_database_url.parse(os.getenv('DATABASE_URL'))
    except ImportError:
        pass

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Helper function to get local network IP
def get_local_network_ip():
    """Get the local network IP address for allowing network access"""
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return None

# CORS settings
# Allow all origins if CORS_ALLOW_ALL_ORIGINS is set (for public exposure)
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True'

if not CORS_ALLOW_ALL_ORIGINS:
    # Get allowed origins from environment or use defaults
    default_origins = 'http://localhost:5173,http://localhost:5177,http://localhost:3000,http://localhost:8001'
    allowed_origins_env = os.getenv('CORS_ALLOWED_ORIGINS', default_origins)
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_env.split(',') if origin.strip()]
    
    # Also allow common network IP patterns (for local network access)
    # This allows access from same machine via network IP
    local_ip = get_local_network_ip()
    if local_ip:
        network_origins = [
            f'http://{local_ip}:5173',
            f'http://{local_ip}:5177',
            f'http://{local_ip}:3000',
        ]
        for origin in network_origins:
            if origin not in CORS_ALLOWED_ORIGINS:
                CORS_ALLOWED_ORIGINS.append(origin)

CORS_ALLOW_CREDENTIALS = True

# CSRF settings - allow ngrok domains for public exposure
CSRF_TRUSTED_ORIGINS_ENV = os.getenv('CSRF_TRUSTED_ORIGINS', '')
if CSRF_TRUSTED_ORIGINS_ENV:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in CSRF_TRUSTED_ORIGINS_ENV.split(',') if origin.strip()]
else:
    CSRF_TRUSTED_ORIGINS = ['http://localhost:5173', 'http://localhost:8001']
    
    # Also add network IP origins for local network access
    local_ip = get_local_network_ip()
    if local_ip:
        network_csrf_origins = [
            f'http://{local_ip}:5173',
            f'http://{local_ip}:5177',
            f'http://{local_ip}:3000',
            f'http://{local_ip}:8001',
        ]
        for origin in network_csrf_origins:
            if origin not in CSRF_TRUSTED_ORIGINS:
                CSRF_TRUSTED_ORIGINS.append(origin)

# If CORS_ALLOW_ALL_ORIGINS is enabled, also allow ngrok domains for CSRF
if CORS_ALLOW_ALL_ORIGINS:
    # Add common ngrok patterns (Django doesn't support wildcards, so we'll handle this differently)
    # We'll add specific domains via environment variable
    pass

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Ninja JWT Settings - configure to avoid Pydantic v1 issues
NINJA_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUDIENCE': None,  # Explicitly set to avoid type inference issues
    'ISSUER': None,
}

# Custom User Model (using Django's built-in User)
AUTH_USER_MODEL = 'auth.User'

# OpenRouter API Settings
# Check for OPENROUTER_API1 first (as specified by user), then fallback to OPENROUTER_API_KEY
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API1') or os.getenv('OPENROUTER_API_KEY', '')
OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'minimax/minimax-m2:free')
OPENROUTER_BASE_URL = os.getenv(
    'OPENROUTER_BASE_URL',
    'https://openrouter.ai/api/v1/chat/completions'
)

