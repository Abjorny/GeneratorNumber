from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Number, Setting
from .serializers import SettingSerializer
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import base64
import uuid


def index(request):
    settings = Setting.objects.all()
    result = []

    for setting in settings:
        ordered_numbers = [sn.number for sn in setting.settingnumber_set.all().order_by('order')]

        numbers_data = [{'id': num.id, 'value': num.value, 'flag': num.flag} for num in ordered_numbers]

        result.append({
            'setting_id': setting.id,
            'numbers': numbers_data,
        })

    return render(request, 'index.html', {
        'settings_data': result
    })


@csrf_exempt
@require_POST
def save_screenshot(request):
    import json
    data = json.loads(request.body)
    screenshot_data = data.get('screenshot')

    if not screenshot_data.startswith("data:image/png;base64,"):
        return JsonResponse({"error": "Invalid image data"}, status=400)

    format, imgstr = screenshot_data.split(';base64,') 
    ext = format.split('/')[-1]

    filename = f"screenshot_{uuid.uuid4().hex[:10]}.{ext}"

    file_data = ContentFile(base64.b64decode(imgstr), name=filename)

    from django.core.files.storage import default_storage
    file_path = default_storage.save(f"screenshots/{filename}", file_data)

    from django.conf import settings
    file_url = settings.MEDIA_URL + file_path

    return JsonResponse({"file_url": file_url})

@api_view(['POST'])
@csrf_exempt
def set_flag_true_by_value(request):
    number_value = request.data.get('value')
    if number_value is None:
        return Response({'status': 'error', 'message': 'value not provided'}, status=400)

    try:
        number = Number.objects.get(value=number_value)
        number.flag = True
        number.save()
        return Response({'status': 'success', 'id': number.id, 'value': number.value, 'flag': number.flag})
    except Number.DoesNotExist:
        return Response({'status': 'error', 'message': f'Number with value={number_value} not found'}, status=404)

@api_view(['GET'])
def get_settings(request):
    settings = Setting.objects.all()
    serializer = SettingSerializer(settings, many=True)
    return Response(serializer.data)
