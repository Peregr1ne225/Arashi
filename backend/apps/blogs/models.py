import random
import os
import uuid
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils.text import slugify
from django.db.models.signals import post_delete
from django.dispatch import receiver


# Word lists for generating random pseudonyms
ADJECTIVES = [
    "Starry", "Cosmic", "Mystic", "Silent", "Swift", "Brave", "Gentle", "Wild",
    "Golden", "Silver", "Crystal", "Shadow", "Luminous", "Dreamy", "Fierce",
    "Noble", "Midnight", "Azure", "Crimson", "Emerald", "Velvet", "Thunder",
    "Whisper", "Radiant", "Storm", "Ocean", "Forest", "Mountain", "Desert",
    "Arctic", "Tropical", "Ancient", "Electric", "Neon", "Vintage", "Quantum"
]

NOUNS = [
    "Turtle", "Fox", "Wolf", "Eagle", "Owl", "Phoenix", "Dragon", "Tiger",
    "Panther", "Hawk", "Raven", "Dolphin", "Lion", "Bear", "Falcon", "Serpent",
    "Unicorn", "Griffin", "Pegasus", "Sphinx", "Lynx", "Jaguar", "Leopard",
    "Nighthowl", "Stardust", "Moonbeam", "Sunfire", "Frostbite", "Thunderclap",
    "Wanderer", "Seeker", "Dreamer", "Voyager", "Explorer", "Pioneer", "Mystic"
]


def generate_pseudonym():
    """Generate a random pseudonym like 'Starry Turtle' or 'Cosmic Fox'"""
    adjective = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)
    return f"{adjective} {noun}"


class Post(models.Model):
    """Blog post model"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    content = models.TextField()
    image = models.ImageField(upload_to="blog_images/", blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blog_posts")
    author_pseudonym = models.CharField(max_length=100, blank=True)
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
        
        # Auto-generate pseudonym if not set
        if not self.author_pseudonym:
            self.author_pseudonym = generate_pseudonym()
        
        super().save(*args, **kwargs)

    @property
    def comment_count(self):
        return self.comments.filter(is_active=True).count()


def comment_image_path(instance, filename):
    ext = filename.split('.')[-1]
    if instance.pk:
        return f"blog_comment_images/{instance.pk}.{ext}"
    else:
        # Fallback if PK is somehow missing, though our save method handles this
        return f"blog_comment_images/{uuid.uuid4()}.{ext}"

class Comment(models.Model):
    """Comment model for blog posts"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blog_comments")
    author_pseudonym = models.CharField(max_length=100, blank=True)
    content = models.TextField()
    image = models.ImageField(upload_to=comment_image_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        return f"Comment by {self.author_pseudonym} on {self.post.title}"

    def save(self, *args, **kwargs):
        # Auto-generate pseudonym if not set
        if not self.author_pseudonym:
            # Check if user has already commented on this post
            existing_comment = Comment.objects.filter(post=self.post, author=self.author).first()
            if existing_comment:
                # Reuse the same pseudonym for this post
                self.author_pseudonym = existing_comment.author_pseudonym
            else:
                # Generate a new random one
                self.author_pseudonym = generate_pseudonym()
        
        # Handle image renaming:
        # If this is a new comment with an image, we need to save first to get an ID,
        # then save the image so it can use the ID in the filename.
        if self.pk is None and self.image:
            image = self.image
            self.image = None
            super().save(*args, **kwargs)
            self.image = image
            # Force update of the image field which will trigger upload_to with the new ID
            if 'force_insert' in kwargs:
                kwargs.pop('force_insert')
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
