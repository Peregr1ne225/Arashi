from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Count, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action

from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Comment, CommentLike, Post, PostLike
from .serializers import (
    CommentCreateSerializer,
    CommentSerializer,
    PostCreateSerializer,
    PostDetailSerializer,
    PostListSerializer,
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
                obj.author == request.user
                or obj.post.author == request.user
                or request.user.is_staff
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

    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthorOrAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "title",
        "content",
        "author__username",
    ]
    ordering_fields = ["created_at", "likes_count", "comment_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Return published posts with calculated metrics using Subqueries for accuracy"""
        likes_subquery = (
            PostLike.objects.filter(post=OuterRef("pk"))
            .values("post")
            .annotate(c=Count("id"))
            .values("c")
        )
        comments_subquery = (
            Comment.objects.filter(post=OuterRef("pk"), is_active=True)
            .values("post")
            .annotate(c=Count("id"))
            .values("c")
        )

        return Post.objects.filter(is_published=True).annotate(
            likes_count=Coalesce(Subquery(likes_subquery), Value(0)),
            comment_count=Coalesce(Subquery(comments_subquery), Value(0)),
        )

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer
        elif self.action == "create":
            return PostCreateSerializer
        return PostDetailSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Return the full post data
        post = self.get_queryset().get(id=serializer.instance.id)
        response_serializer = PostListSerializer(post)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        """Get all comments for a post"""
        post = self.get_object()
        comments = post.comments.filter(is_active=True).annotate(
            likes_count=Count("likes", distinct=True)
        )
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def like(self, request, pk=None):
        """Toggle like for a post (Profile required)."""
        post = self.get_object()
        user = request.user

        # Toggle like
        like_obj = PostLike.objects.filter(post=post, user=user).first()
        if like_obj:
            like_obj.delete()
            liked = False
        else:
            PostLike.objects.create(post=post, user=user)
            liked = True

        return Response(
            {
                "status": "success",
                "has_liked": liked,
                "likes_count": post.likes.count(),
            },
            status=status.HTTP_200_OK,
        )


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for comments.

    - list: Get comments for a post (public, filtered by post_id query param)
    - create: Create a new comment (authenticated, Profile required)
    - destroy: Delete a comment (author or admin)
    """

    permission_classes = [IsCommentManagerOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    serializer_class = CommentSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "likes_count"]

    def get_queryset(self):
        queryset = Comment.objects.filter(is_active=True).annotate(
            likes_count=Count("likes", distinct=True),
        )
        post_id = self.request.query_params.get("post")
        if post_id:
            queryset = queryset.filter(post_id=post_id)

        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return CommentCreateSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(author=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Return the full comment data
        comment = Comment.objects.get(id=serializer.instance.id)
        response_serializer = CommentSerializer(comment, context={"request": request})
        data = response_serializer.data

        # Broadcast to WebSocket group
        channel_layer = get_channel_layer()
        group_name = f"blog_comments_{comment.post.id}"

        async_to_sync(channel_layer.group_send)(
            group_name, {"type": "comment_message", "comment": data}
        )

        return Response(data, status=status.HTTP_201_CREATED)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def like(self, request, pk=None):
        """Toggle like for a comment (Profile required)."""
        comment = self.get_object()
        user = request.user

        # Toggle like
        like_obj = CommentLike.objects.filter(comment=comment, user=user).first()
        if like_obj:
            like_obj.delete()
            liked = False
        else:
            CommentLike.objects.create(comment=comment, user=user)
            liked = True

        return Response(
            {
                "status": "success",
                "has_liked": liked,
                "likes_count": comment.likes.count(),
            },
            status=status.HTTP_200_OK,
        )
