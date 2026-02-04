"""
Filters for Game Providers Platform.

Uses django_filters.FilterSet for query param filtering.
"""
import django_filters
from django.db.models import Q

from .models import Game, Provider


class ProviderFilter(django_filters.FilterSet):
    """Filter for providers list endpoint."""

    search = django_filters.CharFilter(method='filter_search')
    game_type = django_filters.CharFilter(method='filter_game_type')
    currency_mode = django_filters.ChoiceFilter(choices=Provider.CurrencyMode.choices)
    supported_currency = django_filters.CharFilter(method='filter_supported_currency')
    restricted_country = django_filters.CharFilter(method='filter_restricted_country')
    regulated_country = django_filters.CharFilter(method='filter_regulated_country')

    class Meta:
        model = Provider
        fields = ['status', 'currency_mode']

    def filter_search(self, queryset, name, value):
        """Case-insensitive search by provider name."""
        if not value:
            return queryset
        return queryset.filter(provider_name__icontains=value)

    def filter_game_type(self, queryset, name, value):
        """Filter providers that have games of the specified type."""
        if not value:
            return queryset
        return queryset.filter(games__game_type__iexact=value).distinct()

    def filter_supported_currency(self, queryset, name, value):
        """Filter providers that support the specified currency (fiat or crypto)."""
        if not value:
            return queryset
        return queryset.filter(
            Q(fiat_currencies__currency_code__iexact=value) |
            Q(crypto_currencies__currency_code__iexact=value)
        ).distinct()

    def filter_restricted_country(self, queryset, name, value):
        """Filter providers that have the specified country as restricted."""
        if not value:
            return queryset
        return queryset.filter(
            restrictions__country_code__iexact=value,
            restrictions__restriction_type='RESTRICTED'
        ).distinct()

    def filter_regulated_country(self, queryset, name, value):
        """Filter providers that have the specified country as regulated."""
        if not value:
            return queryset
        return queryset.filter(
            restrictions__country_code__iexact=value,
            restrictions__restriction_type='REGULATED'
        ).distinct()


class GameFilter(django_filters.FilterSet):
    """Filter for games list endpoint."""

    search = django_filters.CharFilter(method='filter_search')
    volatility = django_filters.CharFilter(field_name='volatility', lookup_expr='iexact')
    game_type = django_filters.CharFilter(field_name='game_type', lookup_expr='iexact')
    enabled = django_filters.BooleanFilter()

    class Meta:
        model = Game
        fields = ['provider', 'game_type', 'volatility', 'enabled']

    def filter_search(self, queryset, name, value):
        """Case-insensitive search by game title."""
        if not value:
            return queryset
        return queryset.filter(
            Q(game_title__icontains=value) |
            Q(title__icontains=value)
        )
