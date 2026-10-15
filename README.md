# Arashi — E-Commerce Platform

Arashi is a full-stack e-commerce project built with **Next.js** and **Django REST Framework**. It includes a product catalog, shopping cart and checkout flow, customer accounts, order management, a blog with interactive comments, CMS-managed homepage content, and an admin interface.

## Features

### Storefront
- Browse products and categories, search the catalog, and view product details and reviews.
- Manage a shopping cart and proceed through checkout.
- Register, sign in, manage account details, and view orders.
- Browse blog posts and interact with posts and comments.
- Responsive storefront pages for desktop and mobile.

### Administration and content
- Admin pages for managing products, categories, product attributes, orders, users, and homepage hero content.
- CMS-backed site content and product catalog APIs.
- Avatar customization and 3D avatar-related assets.

### Backend capabilities
- Django REST Framework APIs for products, catalog, authentication, cart, orders, blogs, CMS content, and avatar data.
- PostgreSQL for persistent application data.
- Redis and Django Channels for asynchronous/WebSocket features, including blog interactions.
- Stripe integration for checkout/payment workflows and webhook handling.
- Optional Google Gemini API configuration.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber, Drei |
| Backend | Python 3.12+, Django 5.2, Django REST Framework |
| Database | PostgreSQL 15 |
| Cache / realtime | Redis 7, Django Channels, Daphne |
| Payments | Stripe |
| Python dependencies | uv |
| JavaScript dependencies | Bun |
| Local development / deployment | Docker Compose |
| Production reverse proxy | Nginx with host-level HTTPS termination |

## Repository structure

```text
.
├── backend/
│   ├── apps/
│   │   ├── authentication/  # Registration, login, account authentication
│   │   ├── blogs/           # Posts, comments, interactions and realtime consumers
│   │   ├── cart/            # Shopping cart
│   │   ├── catalog/         # Categories and catalog endpoints
│   │   ├── cms/             # Homepage hero and site content
│   │   ├── orders/          # Orders and Stripe webhook
│   │   ├── products/        # Products and reviews
│   │   └── visualization/   # Avatar and avatar asset APIs
│   ├── config/              # Django settings, URL routing and ASGI/WSGI
│   ├── Dockerfile           # Development image
│   ├── Dockerfile.prod      # Production image
│   ├── pyproject.toml       # Python project/dependencies
│   └── manage.py
├── frontend/
│   ├── app/                 # Next.js App Router pages and components
│   ├── public/              # Static assets
│   ├── package.json
│   └── Dockerfile
├── compose.yml              # Development services
├── docker-compose.prod.yml  # Production services
├── ecom_production_nginx.conf
├── install_manual.md        # VPS deployment guide
└── .env.example             # Environment variable template
```

## Requirements

- Docker Engine and Docker Compose plugin (recommended for the complete stack).
- Git.
- A copy of the environment configuration described below.
- Stripe credentials for payment testing; Gemini credentials are optional for features that use Gemini.

Running the full application with Docker Compose avoids the need to install Python, Node.js, PostgreSQL, and Redis directly on your host.

## Getting started (development)

### 1. Clone the repository

```bash
git clone https://github.com/Peregr1ne225/Arashi.git
cd Arashi
```

### 2. Create the environment file

Copy `.env.example` to `.env` and replace placeholder values with local development values.

Linux/macOS:
```bash
cp .env.example .env
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

At minimum, review `SECRET_KEY`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`. Configure the frontend API URLs and allowed origins for local development. Stripe and Gemini keys can remain placeholders if you are not testing those integrations.

**Never commit your real `.env` file, API keys, database passwords, or production secrets.**

### 3. Start the stack

```bash
docker compose -f compose.yml up --build
```

The development Compose file starts the Django backend, Next.js frontend, PostgreSQL, and Redis. The source directories are mounted for development, and the backend container runs migrations as part of its startup command.

Open these local URLs:

- Storefront: http://localhost:3000
- Django backend: http://localhost:8000
- Django admin: http://localhost:8000/superuser/ (if enabled by the current URL configuration)

To follow logs:
```bash
docker compose -f compose.yml logs -f
```

To stop the services:
```bash
docker compose -f compose.yml down
```

To remove the development database and Redis volumes as well, use `docker compose -f compose.yml down -v`. **This permanently deletes the data stored in those Compose volumes.**

## Running without Docker

The repository is configured around Docker Compose. If you choose to run services directly on your host, you will need Python 3.12+, `uv`, Bun, PostgreSQL, and Redis installed and configured.

Backend:
```bash
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py runserver
```

Frontend (in a second terminal):
```bash
cd frontend
bun install
bun run dev
```

Ensure the backend and frontend environment variables point to the correct local service addresses before starting them separately.

## API overview

The backend API is mounted under `/api/v1/`. The exact actions and permissions are defined by the corresponding Django URL, view, and serializer modules.

| Area | Base path |
|---|---|
| Products and reviews | `/api/v1/products/`, `/api/v1/reviews/` |
| Catalog | `/api/v1/` (catalog routes) |
| Authentication | `/api/v1/auth/` |
| Orders and payment webhook | `/api/v1/orders/` |
| Shopping cart | `/api/v1/cart/` |
| Blog posts and comments | `/api/v1/blogs/` |
| Homepage hero and site content | `/api/v1/hero/`, `/api/v1/site-content/` |
| Avatar data and assets | `/api/v1/avatars/`, `/api/v1/avatar-assets/` |

These are route prefixes, not a complete endpoint specification. Consult the `urls.py` and `views.py` files within each backend app for individual routes and supported methods.

## Environment variables

The root `.env.example` documents the available settings. Important groups include:

- **Django:** `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`.
- **Database:** `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`.
- **Redis:** `REDIS_HOST`, `REDIS_PORT`.
- **Browser security:** `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`.
- **Email:** `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`.
- **Stripe:** `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Optional AI integration:** `GEMINI_API_KEY`.
- **Frontend API / WebSocket URLs:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `INTERNAL_API_URL`.
- **Host port mappings:** `BACKEND_PORT`, `FRONTEND_PORT`.

Use `http://` and `ws://` for local development as appropriate, and HTTPS/WSS URLs for a correctly configured production deployment. Do not expose secret keys through `NEXT_PUBLIC_` variables.

## Production deployment

A VPS-oriented deployment guide and Nginx example are included:

- `install_manual.md` — host preparation, Docker installation, Nginx, TLS, and deployment steps.
- `docker-compose.prod.yml` — production containers and persistent database/media/static mounts.
- `ecom_production_nginx.conf` — example reverse-proxy configuration.

The production setup expects you to configure a domain, `.env`, host paths, and Nginx `server_name`/proxy targets. Review the port mappings carefully: the production Compose file defaults to backend port `8001` and frontend port `3001` when the corresponding variables are not set, matching the example Nginx proxy targets. Use valid TLS certificates and strong unique secrets before making the site public.

## Development commands

```bash
# Start development services
docker compose -f compose.yml up --build

# View service logs
docker compose -f compose.yml logs -f backend frontend

# Stop services
docker compose -f compose.yml down

# Build and start the production Compose configuration
docker compose -f docker-compose.prod.yml up -d --build
```

Run the production command only after configuring production environment values, domain routing, persistent storage, and TLS.

## Project status and notes

- This repository is an evolving e-commerce application; validate important purchase and account flows in a test environment before production use.
- Configure Stripe test credentials and webhook forwarding when testing payment flows locally.
- Protect administrative routes and API endpoints with appropriate authentication and permissions.
- Back up the PostgreSQL database and uploaded media before upgrades or redeployment.
- The repository includes an example deployment configuration; it is not a substitute for reviewing security, monitoring, backups, and recovery for your own hosting environment.

## License

No license file is currently present in the repository. All rights reserved by default unless the repository owner adds a license.
