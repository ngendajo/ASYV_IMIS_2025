# Generated by Django 5.2.3 on 2025-06-24 09:13

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0022_author_category_book_issue_book"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="category",
            name="category_id",
        ),
    ]
