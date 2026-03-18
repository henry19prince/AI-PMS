from django.urls import path
from . import views

urlpatterns = [
    path('trends/', views.spend_trends, name='trends'),
    path('forecast/', views.spend_forecast, name='forecast'),
    path('outliers/', views.detect_outliers, name='outliers'),
]