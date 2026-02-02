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
echo "Running migrations..."
uv run python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
uv run python manage.py collectstatic --noinput

# Start Daphne (ASGI)
# We bind to 0.0.0.0:8000
echo "Starting Daphne..."
exec uv run daphne -b 0.0.0.0 -p 8000 config.asgi:application
