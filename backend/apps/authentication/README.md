# JWT Authentication

This app provides JWT (JSON Web Token) authentication for the e-commerce API.

## Features

- User registration and authentication
- JWT token generation and refresh
- User profile management
- Secure token-based authentication

## Endpoints

### Authentication Endpoints

- `POST /api/v1/auth/token/` - Get JWT tokens (login)
- `POST /api/v1/auth/token/refresh/` - Refresh JWT tokens
- `POST /api/v1/auth/register/` - Register a new user
- `GET /api/v1/auth/profile/` - Get user profile (authenticated)
- `PUT/PATCH /api/v1/auth/profile/update/` - Update user profile (authenticated)

## Usage Examples

### Register a New User

```http
POST /api/v1/auth/register/
Content-Type: application/json

{
    "username": "newuser",
    "email": "user@example.com",
    "password": "securepassword123"
}
```

Response:
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "newuser",
        "email": "user@example.com",
        "first_name": "",
        "last_name": "",
        "is_staff": false
    }
}
```

### Login and Get Tokens

```http
POST /api/v1/auth/token/
Content-Type: application/json

{
    "username": "existinguser",
    "password": "userpassword123"
}
```

Response:
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 2,
        "username": "existinguser",
        "email": "existing@example.com",
        "first_name": "",
        "last_name": "",
        "is_staff": true
    }
}
```

### Access Protected Endpoint

```http
GET /api/v1/products/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
    "name": "New Product",
    "description": "This is a great product description",
    "price": 29.99,
    "stock": 100,
    "image_url": "https://example.com/image.jpg",
    "category_id": 1,
    "is_active": true
}
```

### Refresh Tokens

```http
POST /api/v1/auth/token/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

Response:
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Configuration

JWT settings are configured in `config/settings/base.py`:

```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}
```

## Permissions

The API uses the following permission classes:
- `IsAuthenticatedOrReadOnly` - Allows unauthenticated read access but requires authentication for write operations
- `IsAdminOrReadOnly` - Requires admin privileges (`is_staff=True`) for write operations

## Security Features

- Tokens expire after 60 minutes
- Refresh tokens expire after 7 days
- Refresh tokens are rotated after use and blacklisted
- Tokens are signed using the project's secret key

## Creating an Admin User

To create an admin user with staff privileges, run:

```bash
python manage.py createsuperuser
```

Or use the provided script:

```bash
python create_admin.py
```

This will create a superuser with:
- Username: admin
- Password: admin123
- Email: admin@example.com

## Postman Collection

You can import the following collection to test the authentication endpoints:

```json
{
    "info": {
        "name": "E-commerce JWT Authentication",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "Register User",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"username\": \"newuser\",\n    \"email\": \"user@example.com\",\n    \"password\": \"securepassword123\"\n}"
                },
                "url": {
                    "raw": "{{base_url}}/api/v1/auth/register/",
                    "host": ["{{base_url}}"],
                    "path": ["api", "v1", "auth", "register", ""]
                }
            }
        },
        {
            "name": "Get Token",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"username\": \"newuser\",\n    \"password\": \"securepassword123\"\n}"
                },
                "url": {
                    "raw": "{{base_url}}/api/v1/auth/token/",
                    "host": ["{{base_url}}"],
                    "path": ["api", "v1", "auth", "token", ""]
                }
            }
        },
        {
            "name": "Get Profile",
            "request": {
                "method": "GET",
                "header": [
                    {
                        "key": "Authorization",
                        "value": "Bearer {{access_token}}"
                    }
                ],
                "url": {
                    "raw": "{{base_url}}/api/v1/auth/profile/",
                    "host": ["{{base_url}}"],
                    "path": ["api", "v1", "auth", "profile", ""]
                }
            }
        }
    ],
    "variable": [
        {
            "key": "base_url",
            "value": "http://localhost:8000"
        },
        {
            "key": "access_token",
            "value": ""
        }
    ]
}
```
