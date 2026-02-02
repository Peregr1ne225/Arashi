import uuid

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils.text import slugify


class Post(models.Model):
    """Blog post model"""

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    content = models.TextField()
    image = models.ImageField(upload_to="blog_images/", blank=True, null=True)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blog_posts"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Auto-generate slug from title
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Post.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        super().save(*args, **kwargs)


def comment_image_path(instance, filename):
    ext = filename.split(".")[-1]
    if instance.pk:
        return f"blog_comment_images/{instance.pk}.{ext}"
    else:
        # Fallback if PK is somehow missing, though our save method handles this
        return f"blog_comment_images/{uuid.uuid4()}.{ext}"


class Comment(models.Model):
    """Comment model for blog posts"""

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blog_comments"
    )
    content = models.TextField()
    image = models.ImageField(upload_to=comment_image_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        # Show profile name if it exists, otherwise username
        author_display = self.author.username
        return f"Comment by {author_display} on {self.post.title}"

    def save(self, *args, **kwargs):
        # Handle image renaming:
        # If this is a new comment with an image, we need to save first to get an ID,
        # then save the image so it can use the ID in the filename.
        if self.pk is None and self.image:
            image = self.image
            self.image = None
            super().save(*args, **kwargs)
            self.image = image
            # Force update of the image field which will trigger upload_to with the new ID
            if "force_insert" in kwargs:
                kwargs.pop("force_insert")
            super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)


@receiver(post_delete, sender=Post)
def cleanup_post_image(sender, instance, **kwargs):
    """Delete the image file when the Post is deleted"""
    if instance.image:
        instance.image.delete(save=False)


@receiver(post_delete, sender=Comment)
def cleanup_comment_image(sender, instance, **kwargs):
    """Delete the image file when the Comment is deleted"""
    if instance.image:
        instance.image.delete(save=False)


class CommentLike(models.Model):
    """Like for a comment by a user"""

    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="comment_likes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["comment", "user"]
        verbose_name = "Comment Like"
        verbose_name_plural = "Comment Likes"

    def __str__(self):
        return f"Like for {self.comment} by {self.user}"


class PostLike(models.Model):
    """Like for a blog post by a user"""

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="post_likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["post", "user"]
        verbose_name = "Post Like"
        verbose_name_plural = "Post Likes"

    def __str__(self):
        return f"Like for {self.post} by {self.user}"
