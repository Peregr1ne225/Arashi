from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.catalog.models import Category
from apps.products.models import Product

from .models import Order, OrderItem

User = get_user_model()


class OrderTests(TestCase):
    def setUp(self):
        """Set up test data"""
        # Create a test user
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Create JWT token for authentication
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        # Create a test category
        self.category = Category.objects.create(
            name="Test Category",
            slug="test-category",
            description="Test category description",
        )

        # Create a test product
        self.product = Product.objects.create(
            name="Test Product",
            description="Test product description",
            price=Decimal("29.99"),
            stock=10,
            category=self.category,
        )

        # Set up API client with authentication
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_create_order_with_items(self):
        """Test creating an order with items"""
        order_data = {
            "full_name": "John Doe",
            "phone_number": "1234567890",
            "shipping_address": "123 Test Street, Test City",
            "total_amount": "59.98",
            "items": [{"product_id": self.product.id, "quantity": 2, "price": "29.99"}],
        }

        response = self.client.post("/api/v1/orders/", order_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)

        order = Order.objects.first()
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.full_name, "John Doe")
        self.assertEqual(order.status, "pending")
        self.assertEqual(float(order.total_amount), 59.98)

        # Check order items
        self.assertEqual(OrderItem.objects.count(), 1)
        item = OrderItem.objects.first()
        self.assertEqual(item.order, order)
        self.assertEqual(item.product, self.product)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(float(item.price), 29.99)

    def test_order_validation(self):
        """Test order validation"""
        # Test with missing full_name
        order_data = {
            "phone_number": "1234567890",
            "shipping_address": "123 Test Street, Test City",
            "total_amount": "59.98",
            "items": [{"product_id": self.product.id, "quantity": 2, "price": "29.99"}],
        }

        response = self.client.post("/api/v1/orders/", order_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test with total_amount mismatch
        order_data = {
            "full_name": "John Doe",
            "phone_number": "1234567890",
            "shipping_address": "123 Test Street, Test City",
            "total_amount": "100.00",  # Mismatch with actual total
            "items": [{"product_id": self.product.id, "quantity": 2, "price": "29.99"}],
        }

        response = self.client.post("/api/v1/orders/", order_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Total amount", response.data["non_field_errors"][0])

    def test_order_list(self):
        """Test getting a list of orders for a user"""
        # Create an order
        Order.objects.create(
            user=self.user,
            full_name="John Doe",
            phone_number="1234567890",
            shipping_address="123 Test Street, Test City",
            total_amount=Decimal("59.98"),
        )

        # Create another order for a different user
        other_user = User.objects.create_user(
            username="otheruser", email="other@example.com", password="otherpass123"
        )
        Order.objects.create(
            user=other_user,
            full_name="Jane Doe",
            phone_number="0987654321",
            shipping_address="456 Other Street, Other City",
            total_amount=Decimal("39.99"),
        )

        response = self.client.get("/api/v1/orders/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["full_name"], "John Doe")

    def test_cancel_order(self):
        """Test cancelling an order"""
        order = Order.objects.create(
            user=self.user,
            full_name="John Doe",
            phone_number="1234567890",
            shipping_address="123 Test Street, Test City",
            total_amount=Decimal("59.98"),
        )

        # Test cancelling a pending order
        response = self.client.post(f"/api/v1/orders/{order.id}/cancel/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        self.assertEqual(order.status, "cancelled")

        # Test cancelling a non-pending order
        response = self.client.post(f"/api/v1/orders/{order.id}/cancel/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Only pending orders can be cancelled", response.data["error"])


class OrderItemTests(TestCase):
    def setUp(self):
        """Set up test data"""
        # Create a test user
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Create JWT token for authentication
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        # Create a test category
        self.category = Category.objects.create(
            name="Test Category",
            slug="test-category",
            description="Test category description",
        )

        # Create a test product
        self.product = Product.objects.create(
            name="Test Product",
            description="Test product description",
            price=Decimal("29.99"),
            stock=10,
            category=self.category,
        )

        # Set up API client with authentication
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        # Create an order with items
        self.order = Order.objects.create(
            user=self.user,
            full_name="John Doe",
            phone_number="1234567890",
            shipping_address="123 Test Street, Test City",
            total_amount=Decimal("59.98"),
        )

        self.order_item = OrderItem.objects.create(
            order=self.order, product=self.product, quantity=2, price=Decimal("29.99")
        )

    def test_order_item_get_total_price(self):
        """Test the get_total_price method"""
        expected_total = Decimal("59.98")  # 2 * 29.99
        self.assertEqual(self.order_item.get_total_price(), expected_total)

    def test_order_item_list(self):
        """Test getting a list of order items for a user"""
        response = self.client.get("/api/v1/orders/items/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

        item = response.data["results"][0]
        self.assertEqual(item["quantity"], 2)
        self.assertEqual(float(item["price"]), 29.99)
        self.assertEqual(item["product"]["name"], "Test Product")
