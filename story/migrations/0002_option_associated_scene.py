# Generated by Django 2.0.5 on 2018-05-23 18:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('story', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='option',
            name='associated_scene',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='associated_scene', to='story.Scene'),
        ),
    ]
