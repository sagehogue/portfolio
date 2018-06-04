from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^$', views.splash_page, name='splash_page'),
    url(r'^story/$', views.game_page, name='game_page'),
    url(r'^story/api/$', views.story_api, name='story_api'),
]

# I might want to make a story page.