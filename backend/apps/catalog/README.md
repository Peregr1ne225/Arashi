# Catalog App

This Django app manages product categories for the e-commerce platform. It provides a hierarchical structure for organizing products using parent-child category relationships.

## Features

- Hierarchical category structure with unlimited nesting levels
- Automatic slug generation from category names
- RESTful API endpoints for CRUD operations
- Django admin integration with tree-like view
- Comprehensive test coverage

## Models

### Category

The Category model represents product categories in the system.

**Fields:**
- `name`: Unique category name (max length: 100)
- `slug`: Unique URL-friendly slug derived from name (max length: 120)
- `description`: Optional text description of the category
- `parent`: Optional self-referencing foreign key for hierarchical structure
- `created_at`: Timestamp of creation (auto-generated)
- `updated_at`: Timestamp of last update (auto-generated)

**Methods:**
- `save()`: Automatically generates slug from name if not provided

## API Endpoints

The following REST API endpoints are available:

- `GET /api/catalog/categories/`: List all categories
- `POST /api/catalog/categories/`: Create a new category
- `GET /api/catalog/categories/{id}/`: Retrieve a specific category
- `PUT /api/catalog/categories/{id}/`: Update a specific category
- `PATCH /api/catalog/categories/{id}/`: Partially update a specific category
- `DELETE /api/catalog/categories/{id}/`: Delete a specific category

## Usage Examples

### Creating a Category

```python
from apps.catalog.models import Category

# Create a parent category
parent = Category.objects.create(
    name="Electronics",
    description="All electronic items"
)

# Create a child category
child = Category.objects.create(
    name="Smartphones",
    description="All smartphone brands",
    parent=parent
)
```

### API Requests

```bash
# List all categories
GET /api/catalog/categories/

# Create a new category
POST /api/catalog/categories/
{
    "name": "Books",
    "description": "All kinds of books"
}

# Get a specific category with its children
GET /api/catalog/categories/1/
```

## Migration History

- 0001_initial.py: Creates the Category model with all fields and indexes

## Dependencies

- Django REST Framework: For API functionality
- Django-MPTT: For tree structure handling in admin (optional but recommended)

## Testing

Run tests with:

```bash
python manage.py test apps.catalog
```

The test suite covers:
- Model functionality
- Parent-child relationships
- Slug generation
- API endpoints
- Data validation