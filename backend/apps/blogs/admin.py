from django.contrib import admin

from .models import Comment, CommentLike, Post, PostLike


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "created_at", "is_published"]
    list_filter = ["is_published", "created_at"]
    search_fields = ["title", "content", "author__username"]
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "created_at"
    ordering = ["-created_at"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["post", "author", "created_at", "is_active"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["content", "author__username", "post__title"]
    date_hierarchy = "created_at"
    ordering = ["-created_at"]


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ["comment", "user", "created_at"]
    list_filter = ["created_at"]


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ["post", "user", "created_at"]
    list_filter = ["created_at"]
