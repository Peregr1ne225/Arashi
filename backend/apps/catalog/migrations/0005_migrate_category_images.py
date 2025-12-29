import requests
from django.core.files.base import ContentFile
from django.db import migrations
from urllib.parse import urlparse

def migrate_images_forward(apps, schema_editor):
    Category = apps.get_model('catalog', 'Category')
    
    for category in Category.objects.all():
        if not category.image and category.image_url:
            try:
                print(f"Attempting to download image for category '{category.name}' from {category.image_url}...")
                response = requests.get(category.image_url, timeout=10)
                if response.status_code == 200:
                    # Determine filename
                    parsed_url = urlparse(category.image_url)
                    filename = parsed_url.path.split('/')[-1]
                    if not filename:
                        filename = f"category_{category.id}_image.jpg"
                    
                    # Save image
                    category.image.save(filename, ContentFile(response.content), save=True)
                    print(f"Successfully saved image for category '{category.name}'")
                else:
                    print(f"Failed to download image for category '{category.name}': Status {response.status_code}")
            except Exception as e:
                print(f"Error processing category '{category.name}': {e}")

def migrate_images_backward(apps, schema_editor):
    # No backward operation needed as we are just populating a field, not removing data
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0004_category_image'),
    ]

    operations = [
        migrations.RunPython(migrate_images_forward, migrate_images_backward),
    ]
