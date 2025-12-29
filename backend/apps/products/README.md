# Products App

This app manages product information for the e-commerce system. It was refactored to focus solely on product-related functionality, with category management moved to a separate catalog app.

## Models

### Product

The Product model represents individual products in the e-commerce system.

#### Fields:
- `name` - Product name
- `description` - Detailed product description
- `price` - Product price (decimal with 2 decimal places)
- `stock` - Available inventory count
- `image` - Product image file (optional)
- `image_url` - URL to product image (optional)
- `category` - Foreign key to catalog.Category
- `is_active` - Whether the product is currently available
- `created_at` - Timestamp when created
- `updated_at` - Timestamp when last updated

#### Methods:
- `__str__` - Returns product name

## API Endpoints

### Product Endpoints

All product endpoints are available at `/api/v1/products/`:

- `GET /api/v1/products/` - List all products with pagination
- `POST /api/v1/products/` - Create a new product (admin only)
- `GET /api/v1/products/{id}/` - Retrieve a specific product
- `PUT /api/v1/products/{id}/` - Update a product (admin only)
- `DELETE /api/v1/products/{id}/` - Delete a product (admin only)

### Product Actions

#### Search
- `GET /api/v1/products/product/search/?q=query` - Search products by name or description
  - Required query parameter: `q` - Search term
  - Response includes paginated results

#### Featured Products
- `GET /api/v1/products/product/featured/` - Get 10 most recent active products

## Serializers

### ProductSerializer

Basic serializer for product data with nested category information.

### ProductDetailSerializer

Extended serializer that could include additional product details in future.

## URL Structure

The products app's URLs are included in the main API at `/api/v1/products/`. This separation allows for:

1. Focus on product-specific functionality
2. Clean separation of concerns from categories
3. Easier maintenance and future enhancements

## Integration with Catalog App

The products app has a dependency relationship with the catalog app:

1. Products reference categories through a foreign key relationship
2. Category details are retrieved through serializer method fields
3. Circular imports are avoided by importing Category models only when needed

## Migration Strategy

When refactoring to separate from catalog app:

1. Product model retained in products app
2. Foreign key relationships updated to use string references ("catalog.Category")
3. Existing database tables are preserved through migrations

## Future Enhancements

Potential improvements for the products app:

1. Product variants (sizes, colors)
2. Inventory tracking with historical data
3. Product reviews and ratings
4. Product recommendations
5. Bulk pricing options
6. Product visibility controls
7. Product analytics and metrics

## Permissions

Product endpoints use `IsAdminOrReadOnly` permission class:
- Anonymous users can view products
- Admin users (is_staff=True) can create, update, and delete products