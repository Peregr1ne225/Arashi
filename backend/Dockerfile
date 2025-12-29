# Development Dockerfile
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Place virtual environment OUTSIDE /app so it's not overwritten by the host bind mount
ENV UV_PROJECT_ENVIRONMENT="/venv"

# Copy dependency files first
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Add venv to PATH
ENV PATH="/venv/bin:$PATH"

# Copy the rest of the app (though volume mount usually overrides this in dev)
COPY . .

# Expose port
EXPOSE 8000

# Default command
# Default command
CMD ["sh", "-c", "uv run python manage.py migrate && uv run python manage.py collectstatic --noinput && uv run daphne -b 0.0.0.0 -p 8000 config.asgi:application"]
