from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def save_point(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        return JsonResponse({'status': 'success', 'point': data})

@csrf_exempt
def delete_point(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        return JsonResponse({'status': 'deleted'})


def home(request):
    return render(request, 'index.html')