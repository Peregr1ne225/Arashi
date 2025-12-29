from rest_framework import serializers
from .models import Post, Comment


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for blog comments"""
    author_pseudonym = serializers.CharField(read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "author_pseudonym",
            "author_username",
            "content",
            "image",
            "created_at",
            "is_active",
            "can_delete",
        ]
        read_only_fields = ["id", "author_pseudonym", "created_at", "is_active", "can_delete"]

    def get_can_delete(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        
        is_author = obj.author == request.user
        is_post_author = obj.post.author == request.user
        is_staff = request.user.is_staff
        
        # print(f"DEBUG: User={request.user}, CommentAuthor={obj.author}, PostAuthor={obj.post.author}, CanDelete={is_author or is_post_author or is_staff}")
        
        return is_author or is_post_author or is_staff


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    
    class Meta:
        model = Comment
        fields = ["post", "content", "image"]


class PostListSerializer(serializers.ModelSerializer):
    """Serializer for listing blog posts"""
    author_pseudonym = serializers.CharField(read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    excerpt = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "image",
            "author_pseudonym",
            "author_username",
            "comment_count",
            "is_owner",
            "created_at",
            "updated_at",
        ]
    
    def get_excerpt(self, obj):
        """Return first 200 characters of content as excerpt"""
        if len(obj.content) > 200:
            return obj.content[:200] + "..."
        return obj.content

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def get_is_owner(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False


class PostDetailSerializer(serializers.ModelSerializer):
    """Serializer for single blog post detail"""
    image = serializers.SerializerMethodField()
    author_pseudonym = serializers.CharField(read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "image",
            "author_pseudonym",
            "author_username",
            "comment_count",
            "is_owner",
            "comments",
            "created_at",
            "updated_at",
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None



    def get_is_owner(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog posts"""
    
    class Meta:
        model = Post
        fields = ["title", "content", "image"]

