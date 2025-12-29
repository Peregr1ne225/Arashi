# Development Dockerfile
FROM oven/bun:alpine

WORKDIR /app

# Install dependencies
# We copy package files first for caching
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Start dev server
CMD ["bun", "run", "dev"]
