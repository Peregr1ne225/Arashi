import os
from pathlib import Path

import environ

from .base import *

# Get BASE_DIR from base settings
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Initialize environment variables
env = environ.Env()
env.read_env(os.path.join(BASE_DIR, ".env"))

# Development specific settings - override from environment
DEBUG = env.bool("DEBUG", default=True)

ALLOWED_HOSTS = ["*"]

# Database settings
# PostgreSQL is already configured in base.py
# For development, we could use SQLite if needed:
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }

# Email backend for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# CORS settings for development with Next.js frontend - override from environment
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
)

# CSRF settings - override from environment
CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.ngrok-free.app", 
    ],
)

# Media files for development
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Static files for development
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
