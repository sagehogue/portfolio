from django.db import models


# Create your models here.
class Story(models.Model):
    story_title = models.CharField(max_length=200)
    def __str__(self):
        return self.story_title


class Scene(models.Model):
    label = models.CharField(max_length=200)
    scene_text = models.TextField()
    story = models.ForeignKey('Story', on_delete=models.CASCADE)

    def __str__(self):
        return self.label


class Option(models.Model):
    option_label = models.CharField(max_length=200)
    option_text = models.TextField()
    associated_scene = models.ForeignKey('Scene', on_delete=models.CASCADE, related_name='associated_scene', null=True, blank=True)
    previous_scene = models.ForeignKey('Scene', on_delete=models.CASCADE, related_name='previous_scenes', null=True, blank=True)
    next_scene = models.ForeignKey('Scene', on_delete=models.CASCADE, related_name='all_options', null=True, blank=True)

    def __str__(self):
        return self.option_label
