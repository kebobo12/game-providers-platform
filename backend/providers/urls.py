"""
URL configuration for providers app.

All routes defined here are prefixed with /api/ in the main urls.py.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import admin_views, views

router = DefaultRouter()
router.register(r'providers', views.ProviderViewSet, basename='provider')
router.register(r'countries', views.CountryViewSet, basename='country')

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('stats/', views.stats, name='stats'),
    path('filters/', views.filter_options, name='filter-options'),
    # Auth endpoints
    path('auth/csrf/', views.get_csrf_token, name='auth-csrf'),
    path('auth/login/', views.login_view, name='auth-login'),
    path('auth/logout/', views.logout_view, name='auth-logout'),
    path('auth/me/', views.me_view, name='auth-me'),
    # Admin endpoints (superuser only)
    path('admin/stats/', admin_views.admin_stats, name='admin-stats'),
    path('admin/sync/', admin_views.admin_sync, name='admin-sync'),
    path('admin/import/', admin_views.admin_import, name='admin-import'),
    path('admin/providers/', admin_views.admin_providers, name='admin-providers'),
    path('admin/providers/<int:pk>/', admin_views.admin_provider_detail, name='admin-provider-detail'),
    path('admin/providers/<int:pk>/currencies/', admin_views.admin_provider_currencies, name='admin-provider-currencies'),
    path('admin/providers/<int:pk>/currencies/<str:code>/', admin_views.admin_provider_currency_delete, name='admin-provider-currency-delete'),
    path('admin/providers/<int:pk>/restrictions/', admin_views.admin_provider_restrictions, name='admin-provider-restrictions'),
    path('admin/providers/<int:pk>/restrictions/<int:restriction_id>/', admin_views.admin_provider_restriction_delete, name='admin-provider-restriction-delete'),
    path('admin/games/', admin_views.admin_games, name='admin-games'),
    path('admin/games/<int:pk>/', admin_views.admin_game_detail, name='admin-game-detail'),
    path('', include(router.urls)),
]
