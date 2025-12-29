from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.products.models import Product, ProductReview
from apps.catalog.models import Category
from apps.orders.models import Order, OrderItem

User = get_user_model()

class ProductReviewTests(TestCase):
    def setUp(self):
        # 1. Setup User
        self.username = 'testuser'
        self.password = 'password123'
        self.user = User.objects.create_user(username=self.username, password=self.password)
        
        # 2. Setup Data
        self.category = Category.objects.create(name='Test Category')
        self.product = Product.objects.create(
            name='Test Product', 
            price=100.00, 
            stock=10, 
            category=self.category
        )
        
        # 3. Setup Order (SHIPPED)
        self.shipped_order = Order.objects.create(
            user=self.user,
            total_amount=100.00,
            status='shipped',
            display_id='ORDER123'
        )
        OrderItem.objects.create(order=self.shipped_order, product=self.product, quantity=1, price=100.00)
        
        # 4. Setup Order (PENDING)
        self.pending_order = Order.objects.create(
            user=self.user,
            total_amount=100.00,
            status='pending',
            display_id='ORDER456'
        )
        OrderItem.objects.create(order=self.pending_order, product=self.product, quantity=1, price=100.00)
        
        # 5. Get Real Access Token
        self.client = APIClient()
        login_response = self.client.post('/api/v1/auth/token/', {
            'username': self.username,
            'password': self.password
        })
        if login_response.status_code != 200:
            print(f"LOGIN ERROR: {login_response.data}")
        self.assertEqual(login_response.status_code, 200)
        self.token = login_response.data['access']
        # self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        # Manually set header for each request or use credentials
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_review_success(self):
        """Test creating a review for a shipped order is successful"""
        print(f"DEBUG: Using Token: {self.token[:10]}...")
        
        data = {
            'product': self.product.id,
            'order': self.shipped_order.id,
            'rating': 5,
            'comment': 'Great product!'
        }
        # Note: endpoint changed to reviews
        response = self.client.post('/api/v1/reviews/', data)
        if response.status_code != 201:
            print(f"DEBUG ERROR: {response.data}")
            
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify DB
        self.assertTrue(ProductReview.objects.filter(order=self.shipped_order, product=self.product).exists())
        
        # Verify Signal Update
        self.product.refresh_from_db()
        self.assertEqual(self.product.rating, 5.0)
        self.assertEqual(self.product.review_count, 1)

    def test_create_review_pending_order_fail(self):
        """Test creating a review for a pending order fails"""
        data = {
            'product': self.product.id,
            'order': self.pending_order.id,
            'rating': 5,
            'comment': 'Premature review'
        }
        response = self.client.post('/api/v1/reviews/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # We manually raise ValidationError, which DRF serializes as list of strings or detail key
        # Check standard ErrorDetail response string logic or just status code
        
    def test_duplicate_review_fail(self):
        """Test creating a duplicate review fails"""
        # Create first review manually
        ProductReview.objects.create(
            user=self.user,
            product=self.product,
            order=self.shipped_order,
            rating=4
        )
        
        # Try creating second review via API
        data = {
            'product': self.product.id,
            'order': self.shipped_order.id,
            'rating': 5,
            'comment': 'Another one'
        }
        response = self.client.post('/api/v1/reviews/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already rated", str(response.data))

    def test_rating_aggregation(self):
        """Test that multiple reviews average correctly"""
        # We need a SECOND user context for 2nd review
        user2 = User.objects.create_user(username='user2', password='password123')
        order2 = Order.objects.create(user=user2, status='delivered', total_amount=100, display_id='ORDER2')
        OrderItem.objects.create(order=order2, product=self.product, quantity=1, price=100)
        
        # Get token for user 2
        client2 = APIClient()
        resp = client2.post('/api/v1/auth/token/', {'username': 'user2', 'password': 'password123'})
        token2 = resp.data['access']
        client2.credentials(HTTP_AUTHORIZATION='Bearer ' + token2)
        
        # User 1 review (via fixture client)
        self.client.post('/api/v1/reviews/', {
            'product': self.product.id,
            'order': self.shipped_order.id,
            'rating': 5
        })
        
        # User 2 review (via client2)
        client2.post('/api/v1/reviews/', {
            'product': self.product.id,
            'order': order2.id,
            'rating': 3
        })
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.review_count, 2)
        self.assertEqual(self.product.rating, 4.0) # (5+3)/2 = 4
