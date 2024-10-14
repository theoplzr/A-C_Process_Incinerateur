from django.urls import path
from . import views

urlpatterns = [
    path('save-point/', views.save_point, name='save_point'),
    path('delete-point/', views.delete_point, name='delete_point'),
    path('', views.home, name='home'),  # Route pour la page d'accueil
]
