#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Wait for the database to be ready
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $POSTGRES_HOST ${POSTGRES_PORT:-5432}; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

# Run migrations
# Note: In some highly available setups you might run this manually or in a separate job.
# For single-VPS, running it on startup is convenient.
echo "Collecting static files..."
uv run python manage.py collectstatic --noinput

echo "Running migrations..."
uv run python manage.py migrate --noinput

# Start Gunicorn (WSGI/ASGI with Uvicorn workers)
# We bind to 0.0.0.0:8000
echo "Starting Gunicorn..."
exec uv run gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class gthread \
    --threads 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
