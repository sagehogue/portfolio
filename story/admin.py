from django.contrib import admin
from story.models import Story, Scene, Option
# Register your models here.
admin.site.register(Story)
admin.site.register(Scene)
admin.site.register(Option)