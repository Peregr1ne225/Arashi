from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, GenerateBlogImageView

router = DefaultRouter()
router.register(r"posts", PostViewSet, basename="post")
router.register(r"comments", CommentViewSet, basename="comment")

urlpatterns = [
    path('generate-image/', GenerateBlogImageView.as_view(), name='generate-image'),
    path('generate-image', GenerateBlogImageView.as_view(), name='generate-image-no-slash'),
    path("", include(router.urls)),
]
