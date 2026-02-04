"""
Views for Game Providers Platform.

Uses DRF ViewSets for CRUD operations.
"""
import csv

from django.contrib.auth import authenticate, login, logout
from django.db.models import Count
from django.http import StreamingHttpResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .filters import GameFilter, ProviderFilter
from .models import Country, CryptoCurrency, FiatCurrency, Game, Provider, Restriction
from .serializers import (
    CountrySerializer,
    FilterOptionsSerializer,
    GameSerializer,
    ProviderDetailSerializer,
    ProviderListSerializer,
    StatsSerializer,
)


@api_view(['GET'])
def health_check(request):
    """Health check endpoint."""
    return Response({'status': 'ok'})


@api_view(['GET'])
def stats(request):
    """Return total counts for dashboard."""
    data = {
        'total_providers': Provider.objects.count(),
        'total_games': Game.objects.count(),
    }
    serializer = StatsSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
def filter_options(request):
    """Return available filter options for UI dropdowns."""
    data = {
        'game_types': list(
            Game.objects.exclude(game_type__isnull=True)
            .exclude(game_type='')
            .values_list('game_type', flat=True)
            .distinct()
            .order_by('game_type')
        ),
        'currency_modes': [choice[0] for choice in Provider.CurrencyMode.choices],
        'fiat_currencies': list(
            FiatCurrency.objects.values_list('currency_code', flat=True)
            .distinct()
            .order_by('currency_code')
        ),
        'crypto_currencies': list(
            CryptoCurrency.objects.values_list('currency_code', flat=True)
            .distinct()
            .order_by('currency_code')
        ),
        'countries': list(
            Restriction.objects.values_list('country_code', flat=True)
            .distinct()
            .order_by('country_code')
        ),
    }
    serializer = FilterOptionsSerializer(data)
    return Response(serializer.data)


class Echo:
    """An object that implements just the write method of the file-like interface."""

    def write(self, value):
        return value


def generate_csv_rows(queryset, fields, headers):
    """Generator for streaming CSV response with Excel compatibility."""
    # UTF-8 BOM + sep hint for Excel to recognize comma delimiter in all locales
    yield '\ufeff'
    yield 'sep=,\r\n'

    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)
    yield writer.writerow(headers)

    for obj in queryset:
        row = []
        for field in fields:
            if '.' in field:
                # Handle nested attributes like provider.provider_name
                parts = field.split('.')
                value = obj
                for part in parts:
                    value = getattr(value, part, '')
            else:
                value = getattr(obj, field, '')
            row.append(value if value is not None else '')
        yield writer.writerow(row)


class ProviderViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Provider model."""

    filterset_class = ProviderFilter
    search_fields = ['provider_name']
    ordering_fields = ['provider_name', 'game_count']
    ordering = ['provider_name']

    def get_queryset(self):
        """Return providers with game count annotation."""
        return Provider.objects.with_game_count().prefetch_related(
            'fiat_currencies',
            'crypto_currencies',
            'restrictions',
        )

    def get_serializer_class(self):
        """Use lightweight serializer for list, full for detail."""
        if self.action == 'list':
            return ProviderListSerializer
        return ProviderDetailSerializer

    @action(detail=True, methods=['get'])
    def games(self, request, pk=None):
        """Return paginated games for a specific provider."""
        provider = self.get_object()
        games = Game.objects.filter(provider=provider).select_related('provider')

        # Apply game filters
        filterset = GameFilter(request.query_params, queryset=games)
        filtered_games = filterset.qs

        # Paginate
        page = self.paginate_queryset(filtered_games)
        if page is not None:
            serializer = GameSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = GameSerializer(filtered_games, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export providers as CSV."""
        queryset = self.filter_queryset(self.get_queryset())

        fields = ['id', 'provider_name', 'status', 'currency_mode', 'game_count']
        headers = ['ID', 'Provider Name', 'Status', 'Currency Mode', 'Game Count']

        response = StreamingHttpResponse(
            generate_csv_rows(queryset, fields, headers),
            content_type='text/csv; charset=utf-8',
        )
        response['Content-Disposition'] = 'attachment; filename="providers.csv"'
        return response

    @action(detail=True, methods=['get'], url_path='games/export')
    def games_export(self, request, pk=None):
        """Export games for a specific provider as CSV."""
        provider = self.get_object()
        games = Game.objects.filter(provider=provider).select_related('provider')

        # Apply game filters
        filterset = GameFilter(request.query_params, queryset=games)
        filtered_games = filterset.qs

        fields = [
            'id', 'game_title', 'game_type', 'platform', 'rtp', 'volatility',
            'enabled', 'thumbnail'
        ]
        headers = [
            'ID', 'Title', 'Type', 'Platform', 'RTP', 'Volatility',
            'Enabled', 'Thumbnail'
        ]

        response = StreamingHttpResponse(
            generate_csv_rows(filtered_games, fields, headers),
            content_type='text/csv; charset=utf-8',
        )
        response['Content-Disposition'] = f'attachment; filename="{provider.provider_name}_games.csv"'
        return response


class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Country model."""

    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    pagination_class = None


# Auth views
@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """Return CSRF token for frontend."""
    return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticate user and create session."""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'detail': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
        })
    else:
        return Response(
            {'detail': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Clear user session."""
    logout(request)
    return Response({'detail': 'Logged out successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Return current authenticated user info."""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
    })
