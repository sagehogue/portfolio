from django.shortcuts import render

# Create your views here.
def splash_page(request):
    return render(request, 'story/splash_page.html')

def game_page(request):
    return render(request, 'story/game_page.html')