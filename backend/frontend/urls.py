from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/save-screenshot/', views.save_screenshot, name='save_screenshot'),
    path('api/set-flag-by-value/', views.set_flag_true_by_value, name='set_flag_true_by_value'),
    path('api/settings/', views.get_settings, name='get_settings'),
]