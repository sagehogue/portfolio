from django.shortcuts import render, HttpResponseRedirect, redirect, HttpResponse
from story.models import Story, Scene, Option
from django.shortcuts import get_object_or_404
from django.http import JsonResponse




# Create your views here.
def splash_page(request):
    return render(request, 'story/splash_page.html')


def game_page(request):
    return render(request, 'story/game_page.html')

def story_api(request):
    if request.method == 'GET':
        print(request.GET.get('key'))
        response = []
        request_story = request.GET.get('selected')
        return_story = Story.objects.get(request_story)
        response.append({
            f'{request_story.story_title}': {
#
            }
        })
#
        scenes = Scene.objects.all()
        options = Option.objects.all()
        return JsonResponse(response, safe=False)