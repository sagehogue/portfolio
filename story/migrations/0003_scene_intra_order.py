# Generated by Django 2.0.5 on 2018-05-29 21:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('story', '0002_option_associated_scene'),
    ]

    operations = [
        migrations.AddField(
            model_name='scene',
            name='intra_order',
            field=models.CharField(blank=True, max_length=4, null=True),
        ),
    ]
