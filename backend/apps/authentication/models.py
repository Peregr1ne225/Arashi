from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # For existing users, ensure profile exists
        try:
            instance.profile
        except UserProfile.DoesNotExist:
            UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # Only save the profile if it's not already being saved and exists
    if hasattr(instance, "_skip_profile_save") and instance._skip_profile_save:
        return
    try:
        instance.profile.save()
    except UserProfile.DoesNotExist:
        # Profile doesn't exist, don't try to save it
        pass


# Create a management command to create profiles for existing users
def create_missing_profiles():
    """
    Create UserProfile for any users that don't have one
    This can be called from the shell or a management command
    """
    users_without_profiles = User.objects.filter(profile__isnull=True)
    for user in users_without_profiles:
        UserProfile.objects.create(user=user)
    return users_without_profiles.count()
