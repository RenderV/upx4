# Generated by Django 4.2.6 on 2023-10-17 22:11

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cams', '0002_alter_parkingspace_area'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parkingspace',
            name='area',
            field=django.contrib.postgres.fields.ArrayField(base_field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(null=True), default=list, size=2), default=list, size=None),
        ),
    ]