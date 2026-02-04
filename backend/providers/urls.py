"""
URL configuration for providers app.

All routes defined here are prefixed with /api/ in the main urls.py.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'providers', views.ProviderViewSet, basename='provider')
router.register(r'countries', views.CountryViewSet, basename='country')

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('stats/', views.stats, name='stats'),
    path('filters/', views.filter_options, name='filter-options'),
    path('', include(router.urls)),
]
