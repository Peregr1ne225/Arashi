from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("blogs", "0004_commentlike_postlike"),
    ]

    operations = [
        # Fix for IntegrityError: explicit drop of zombie column in comments table
        migrations.RunSQL(
            'ALTER TABLE "blogs_comment" DROP COLUMN IF EXISTS "author_pseudonym";',
            reverse_sql='ALTER TABLE "blogs_comment" ADD COLUMN "author_pseudonym" varchar(255) NULL;',
        ),
    ]
