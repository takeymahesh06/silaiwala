"""
Production settings for SilaiWala backend
"""
import os
from .settings import *

# Security settings
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'silaiwala-backend.onrender.com',
    'silaiwala-backend-v3-production.up.railway.app',
    'silaiwala-backend-production.up.railway.app',
    'silaiwala-frontend-new-production.up.railway.app',
    'silaiwala-frontend-docker-production.up.railway.app',
    'swaruchii.com',
    'www.swaruchii.com',
    '.onrender.com',
    '*.railway.app',
]

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    'https://silaiwala-backend-v3-production.up.railway.app',
    'https://silaiwala-backend-production.up.railway.app',
    'https://silaiwala-frontend-new-production.up.railway.app',
    'https://silaiwala-frontend-docker-production.up.railway.app',
    'https://silaiwala-backend.onrender.com',
    'https://silaiwala.onrender.com',
    'https://swaruchii.com',
    'https://www.swaruchii.com',
    'http://localhost:3000',
    'http://localhost:8000',
]

# Database configuration for production
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'silaiwala_prod'),
        'USER': os.environ.get('POSTGRES_USER', 'silaiwala_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', ''),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# Redis configuration
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://silaiwala-frontend.onrender.com",
    "https://silaiwala.onrender.com",
    "https://silaiwala-frontend-new-production.up.railway.app",
    "https://silaiwala-frontend-docker-production.up.railway.app",
    "https://silaiwala-backend-production.up.railway.app",
    "https://silaiwala-backend-v3-production.up.railway.app",
    "https://swaruchii.com",
    "https://www.swaruchii.com",
]

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HTTPS settings (uncomment when using custom domain with SSL)
# SECURE_SSL_REDIRECT = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Email configuration (configure with your email service)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@silaiwala.com')

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Celery configuration (if using background tasks)
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
