from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("blogs", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            'ALTER TABLE "blogs_post" DROP COLUMN IF EXISTS "author_pseudonym";',
            reverse_sql='ALTER TABLE "blogs_post" ADD COLUMN "author_pseudonym" varchar(255) NULL;',
        ),
    ]
