from django.shortcuts import render, HttpResponseRedirect, redirect, HttpResponse
from story.models import Story, Scene, Option
from django.shortcuts import get_object_or_404
from django.http import JsonResponse


def splash_page(request):
    return render(request, 'story/splash_page.html')


def game_page(request):
    return render(request, 'story/game_page.html')

# The first statement in the if chain handles something yet to be implemented --
# In the initializing function on the page there will be a fetch request for the story names
# They will then be rendered into the storySelector elements currently hardcoded in.
def story_api(request):
    response = []
    if request.method == 'GET':
        if request.GET.get('fetchStories'):
            story_queryset = Story.objects.all()
            response = {'stories': {}}
            counter = 1
            for i in story_queryset:
                response['stories'].update({str(counter): i.story_title})
                counter += 1
        elif request.GET.get('storySelection'):
            request_story = request.GET.get('storySelection')
            return_story = Story.objects.filter(story_title=f'{request_story}')
            relevant_scene = Scene.objects.filter(story_id=return_story[0].id, intra_order=1)
            relevant_text = relevant_scene[0].scene_text
            relevant_options = {}
            option_num = 0
            for i in Option.objects.filter(associated_scene_id=relevant_scene[0].id).values(
                    'option_label', 'option_text'):
                relevant_options.update({option_num + 1: i})
                option_num += 1
            return_context = {'story': f'{return_story[0].story_title}',
                              'storyID': f'{return_story[0].id}',
                              'scene': f'{relevant_scene[0].label}',
                              'sceneText': f'{relevant_text}',
                              'options': relevant_options,
                              'optionQuantity': option_num
                              }
            response.append({'context': return_context})
        elif request.GET.get('optionSelection'):
            option_context = request.GET.get('optionSelection')
            return_scene_id = Option.objects.filter(option_label=option_context).values(
                'next_scene_id')[0]['next_scene_id']
            return_qset = Scene.objects.filter(id=return_scene_id).values(
                'label', 'scene_text', 'intra_order')
            return_scene_text = return_qset[0]['scene_text']
            return_scene_label = return_qset[0]['label']
            return_scene_position = return_qset[0]['intra_order']
            option_num = 0
            relevant_options = {}
            for i in Option.objects.filter(associated_scene_id=return_scene_id).values(
                    'option_label', 'option_text'):
                relevant_options.update({option_num + 1: i})
                option_num += 1
            return_context = {
                'scene': f'{return_scene_label}',
                'sceneText': f'{return_scene_text}',
                'options': relevant_options,
                'optionQuantity': option_num,
                'intra': return_scene_position
            }
            response.append({'context': return_context})
        return JsonResponse(response, safe=False)
