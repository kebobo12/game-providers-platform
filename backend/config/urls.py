"""URL configuration for Game Providers Platform."""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('providers.urls')),
]
