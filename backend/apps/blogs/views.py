from django.db.models import Count
from rest_framework import viewsets, status, permissions, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .services import NanoBananaService
from .models import Post, Comment
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    PostCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer,
)


class IsAuthorOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow:
    - Read access to anyone
    - Create access to authenticated users
    - Delete access to author or admin
    """
    
    def has_permission(self, request, view):
        # Allow read operations for anyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Require authentication for write operations
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Allow read operations for anyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Allow delete for author or admin
        if request.method == "DELETE":
            return obj.author == request.user or request.user.is_staff
        # Allow update for author only
        return obj.author == request.user


class IsCommentManagerOrReadOnly(permissions.BasePermission):
    """
    Custom permission for comments:
    - Read access: Anyone
    - Create: Authenticated
    - Delete: Comment Author OR Post Author OR Admin
    - Update: Comment Author only
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.method == "DELETE":
            return (
                obj.author == request.user or 
                obj.post.author == request.user or 
                request.user.is_staff
            )
            
        return obj.author == request.user


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for blog posts.
    
    - list: Get all published posts (public)
    - retrieve: Get a single post by slug (public)
    - create: Create a new post (authenticated)
    - destroy: Delete a post (author or admin)
    """
    permission_classes = [IsAuthorOrAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "content", "author_pseudonym"]
    # lookup_field = "slug"  <-- Removed to support ID lookup (pk)
    
    def get_queryset(self):
        """Return published posts"""
        queryset = Post.objects.filter(is_published=True)
        search = self.request.query_params.get('search', None)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(content__icontains=search) | 
                Q(author_pseudonym__icontains=search)
            )
        return queryset
    
    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer
        elif self.action == "create":
            return PostCreateSerializer
        return PostDetailSerializer
    
    def perform_create(self, serializer):
        # Check for temp image path in request data
        temp_path = self.request.data.get('temp_image_path')
        
        if temp_path:
            import os
            from django.conf import settings
            from django.core.files import File
            from rest_framework.exceptions import ValidationError
            
            try:
                # Remove /media/ prefix if present to get relative path
                if temp_path.startswith(settings.MEDIA_URL):
                    temp_path = temp_path.replace(settings.MEDIA_URL, "", 1)
                
                # Normalize slashes for Windows
                temp_path = temp_path.replace('/', os.sep)
                    
                full_temp_path = os.path.join(settings.MEDIA_ROOT, temp_path)
                
                if os.path.exists(full_temp_path):
                    # Save with the image
                    with open(full_temp_path, 'rb') as f:
                        serializer.save(
                            author=self.request.user,
                            image=File(f, name=os.path.basename(full_temp_path))
                        )
                    # Cleanup temp file
                    try:
                        os.remove(full_temp_path)
                    except Exception:
                        pass # Ignore cleanup errors
                    return
                else:
                     print(f"File not found at: {full_temp_path}")
            except Exception as e:
                # Re-raise as 400 to see error in frontend
                print(f"Error saving temp image: {e}")
                raise ValidationError(f"Error saving image: {str(e)}")

        # Fallback if no temp image or image processing failed (but didn't raise exception)
        # Check if instance was already saved (id would be set)
        if not serializer.instance:
           serializer.save(author=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the full post data with pseudonym
        post = Post.objects.get(id=serializer.instance.id)
        response_serializer = PostListSerializer(post)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        """Get all comments for a post"""
        post = self.get_object()
        comments = post.comments.filter(is_active=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for comments.
    
    - list: Get comments for a post (public, filtered by post_id query param)
    - create: Create a new comment (authenticated)
    - destroy: Delete a comment (author or admin)
    """
    permission_classes = [IsCommentManagerOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        queryset = Comment.objects.filter(is_active=True)
        post_id = self.request.query_params.get("post")
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        return queryset
    
    def get_serializer_class(self):
        if self.action == "create":
            return CommentCreateSerializer
        return CommentSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Return the full comment data with pseudonym
        comment = Comment.objects.get(id=serializer.instance.id)
        response_serializer = CommentSerializer(comment)
        data = response_serializer.data

        # Broadcast to WebSocket group
        
        channel_layer = get_channel_layer()
        group_name = f"blog_comments_{comment.post.id}"
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "comment_message",
                "comment": data
            }
        )

        return Response(data, status=status.HTTP_201_CREATED)



class GenerateBlogImageView(APIView):
    permission_classes = [permissions.AllowAny] # Change to IsAuthenticated in production if needed

    def post(self, request):
        try:
            # Generate image using service with full data
            image_url_path = NanoBananaService.generate_from_data(request.data)
            
            if not image_url_path:
                return Response( 
                    {"error": "Failed to generate image."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response({
                "image_url": image_url_path,
                "temp_path": image_url_path # Reusing URL since local, but backend could distinguish
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
