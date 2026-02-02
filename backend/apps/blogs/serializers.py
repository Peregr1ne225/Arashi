from rest_framework import serializers

from .models import Comment, Post


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for blog comments"""

    author_name = serializers.SerializerMethodField()
    author_username = serializers.CharField(source="author.username", read_only=True)
    can_delete = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "author_name",
            "author_username",
            "content",
            "image",
            "created_at",
            "is_active",
            "likes_count",
            "can_delete",
            "has_liked",
        ]
        read_only_fields = [
            "id",
            "author_name",
            "created_at",
            "is_active",
            "can_delete",
            "likes_count",
            "has_liked",
        ]

    def get_author_name(self, obj):
        return obj.author.username

    def get_can_delete(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        is_author = obj.author == request.user
        is_post_author = obj.post.author == request.user
        is_staff = request.user.is_staff

        return is_author or is_post_author or is_staff

    def get_has_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""

    class Meta:
        model = Comment
        fields = ["post", "content", "image"]

    def to_internal_value(self, data):
        internal_data = {}
        if hasattr(data, "getlist"):
            for key in data.keys():
                internal_data[key] = data.get(key)
        else:
            internal_data = dict(data)

        if "image" in internal_data and isinstance(internal_data["image"], str):
            if internal_data["image"] in ["", "null", "undefined"]:
                internal_data["image"] = None

        return super().to_internal_value(internal_data)


class PostListSerializer(serializers.ModelSerializer):
    """Serializer for listing blog posts"""

    # ... (rest of PostListSerializer unchanged)

    author_name = serializers.SerializerMethodField()
    author_username = serializers.CharField(source="author.username", read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    excerpt = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(read_only=True)
    has_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "image",
            "author_name",
            "author_username",
            "comment_count",
            "is_owner",
            "created_at",
            "updated_at",
            "likes_count",
            "has_liked",
        ]

    def get_author_name(self, obj):
        return obj.author.username

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

    def get_has_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostDetailSerializer(serializers.ModelSerializer):
    """Serializer for single blog post detail"""

    image = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()
    author_username = serializers.CharField(source="author.username", read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(read_only=True)
    has_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "image",
            "author_name",
            "author_username",
            "comment_count",
            "is_owner",
            "comments",
            "created_at",
            "updated_at",
            "likes_count",
            "has_liked",
        ]

    def get_author_name(self, obj):
        return obj.author.username

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def get_is_owner(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False

    def get_has_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog posts"""

    class Meta:
        model = Post
        fields = ["title", "content", "image"]

    def to_internal_value(self, data):
        internal_data = {}
        if hasattr(data, "getlist"):
            for key in data.keys():
                internal_data[key] = data.get(key)
        else:
            internal_data = dict(data)

        if "image" in internal_data and isinstance(internal_data["image"], str):
            if internal_data["image"] in ["", "null", "undefined"]:
                internal_data["image"] = None

        return super().to_internal_value(internal_data)
