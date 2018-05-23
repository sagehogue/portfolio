from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.splash_page, name='splash_page'),
    url(r'^story/$', views.game_page, name='game_page'),
]