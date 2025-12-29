from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category


class CategoryModelTests(TestCase):
    """Test cases for the Category model"""

    def setUp(self):
        """Set up test data"""
        self.parent_category = Category.objects.create(
            name="Electronics", slug="electronics", description="All electronic items"
        )
        self.child_category = Category.objects.create(
            name="Smartphones",
            slug="smartphones",
            description="All smartphone brands",
            parent=self.parent_category,
        )

    def test_category_str_representation(self):
        """Test the string representation of a category"""
        self.assertEqual(str(self.parent_category), "Electronics")
        self.assertEqual(str(self.child_category), "Smartphones")

    def test_category_slug_auto_generation(self):
        """Test that slug is automatically generated from name"""
        category = Category.objects.create(name="Test Category")
        self.assertEqual(category.slug, "test-category")

    def test_category_parent_child_relationship(self):
        """Test the parent-child relationship between categories"""
        self.assertEqual(self.child_category.parent, self.parent_category)
        self.assertIn(self.child_category, self.parent_category.children.all())

    def test_category_unique_name_and_slug(self):
        """Test that name and slug fields are unique"""
        with self.assertRaises(Exception):
            Category.objects.create(name="Electronics")

        with self.assertRaises(Exception):
            Category.objects.create(slug="electronics")

    def test_category_ordering(self):
        """Test that categories are ordered by name"""
        Category.objects.create(name="Appliances", slug="appliances")
        Category.objects.create(name="Books", slug="books")

        categories = Category.objects.all()
        expected_order = ["Appliances", "Books", "Electronics", "Smartphones"]
        actual_order = [category.name for category in categories]
        self.assertEqual(actual_order, expected_order)


class CategoryAPITests(APITestCase):
    """Test cases for the Category API endpoints"""

    def setUp(self):
        """Set up test data"""
        self.parent_category = Category.objects.create(
            name="Electronics", slug="electronics", description="All electronic items"
        )
        self.child_category = Category.objects.create(
            name="Smartphones",
            slug="smartphones",
            description="All smartphone brands",
            parent=self.parent_category,
        )

    def test_get_category_list(self):
        """Test retrieving a list of categories"""
        url = reverse("category-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

    def test_get_category_detail(self):
        """Test retrieving a single category"""
        url = reverse("category-detail", kwargs={"pk": self.parent_category.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Electronics")

    def test_create_category(self):
        """Test creating a new category"""
        url = reverse("category-list")
        data = {"name": "Books", "description": "All kinds of books"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), 3)
        self.assertEqual(Category.objects.get(id=response.data["id"]).name, "Books")

    def test_update_category(self):
        """Test updating an existing category"""
        url = reverse("category-detail", kwargs={"pk": self.parent_category.pk})
        data = {"name": "Updated Electronics", "description": "Updated description"}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.parent_category.refresh_from_db()
        self.assertEqual(self.parent_category.name, "Updated Electronics")
        self.assertEqual(self.parent_category.description, "Updated description")

    def test_delete_category(self):
        """Test deleting a category"""
        url = reverse("category-detail", kwargs={"pk": self.child_category.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Category.objects.count(), 1)

    def test_category_hierarchy_in_api(self):
        """Test that parent-child relationships are properly represented in API responses"""
        url = reverse("category-detail", kwargs={"pk": self.parent_category.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["children"]), 1)
        self.assertEqual(response.data["children"][0]["name"], "Smartphones")
