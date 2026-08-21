"""
Django settings for teamflow project.

Production & Development configuration with Render + PostgreSQL support.
"""

from pathlib import Path
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    import dj_database_url
except ImportError:
    dj_database_url = None

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ==========================================
# 1. Core Security & Environment Variables
# ==========================================

# In production on Render, set SECRET_KEY in Environment Variables
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-$7up7%9f-+f4a-idfetz==@7g*pxlb@##nc-h8b27cznt^mxfq'
)

# In production, set DEBUG=False in Render Environment Variables
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 't')

# ALLOWED_HOSTS: Set in Render to your .onrender.com URL (e.g. teamflow-api.onrender.com,localhost,127.0.0.1)
ALLOWED_HOSTS = os.environ.get(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1,0.0.0.0,.onrender.com,.vercel.app'
).split(',')


# ==========================================
# 2. Installed Applications
# ==========================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party Apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    
    # Local Apps
    'api',
    'auth.apps.AuthConfig',
]


# ==========================================
# 3. Middleware Configuration
# ==========================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Serves static assets in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'teamflow.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'teamflow.wsgi.application'


# ==========================================
# 4. Database Configuration (PostgreSQL / SQLite)
# ==========================================

# Render automatically provides DATABASE_URL when you connect a PostgreSQL service
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL and dj_database_url:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Local development fallback
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# ==========================================
# 5. Password Validation
# ==========================================

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


# ==========================================
# 6. Internationalization
# ==========================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ==========================================
# 7. Static Files & WhiteNoise Configuration
# ==========================================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Enhanced WhiteNoise storage for compressed caching
if not DEBUG:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# ==========================================
# 8. CORS & Cross-Origin Settings
# ==========================================

# Allows requests from Vercel frontend, local frontend, and custom domains
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True


# ==========================================
# 9. Django REST Framework
# ==========================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated'
    ]
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
