"""
Serializers for Game Providers Platform.

Conventions:
- ListSerializer: lightweight, for list views
- DetailSerializer: nested relations, for detail views
- Always define Meta.fields explicitly
"""
from rest_framework import serializers

from .models import (
    Country,
    CryptoCurrency,
    FiatCurrency,
    Game,
    Provider,
    Restriction,
)


class FiatCurrencySerializer(serializers.ModelSerializer):
    """Serializer for fiat currencies."""

    class Meta:
        model = FiatCurrency
        fields = ['currency_code', 'display', 'source']


class CryptoCurrencySerializer(serializers.ModelSerializer):
    """Serializer for crypto currencies."""

    class Meta:
        model = CryptoCurrency
        fields = ['currency_code', 'display', 'source']


class RestrictionSerializer(serializers.ModelSerializer):
    """Serializer for country restrictions."""

    class Meta:
        model = Restriction
        fields = ['country_code', 'restriction_type', 'source']


class GameSerializer(serializers.ModelSerializer):
    """Serializer for games."""

    provider_name = serializers.CharField(source='provider.provider_name', read_only=True)

    class Meta:
        model = Game
        fields = [
            'id',
            'provider',
            'provider_name',
            'wallet_game_id',
            'game_title',
            'game_provider',
            'vendor',
            'game_type',
            'source',
            'game_id',
            'title',
            'platform',
            'subtype',
            'enabled',
            'fun_mode',
            'rtp',
            'volatility',
            'features',
            'themes',
            'tags',
            'thumbnail',
            'api_provider',
        ]


class ProviderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for provider list views."""

    game_count = serializers.IntegerField(read_only=True)
    supported_game_types = serializers.SerializerMethodField()

    class Meta:
        model = Provider
        fields = [
            'id',
            'provider_name',
            'logo_url_dark',
            'logo_url_light',
            'status',
            'currency_mode',
            'game_count',
            'supported_game_types',
        ]

    def get_supported_game_types(self, obj: Provider) -> list[str]:
        """Get distinct game types for this provider."""
        if hasattr(obj, 'prefetched_game_types'):
            return obj.prefetched_game_types
        return obj.get_supported_game_types()


class ProviderDetailSerializer(serializers.ModelSerializer):
    """Full serializer for provider detail views with nested data."""

    game_count = serializers.IntegerField(read_only=True)
    supported_game_types = serializers.SerializerMethodField()
    fiat_currencies = FiatCurrencySerializer(many=True, read_only=True)
    crypto_currencies = CryptoCurrencySerializer(many=True, read_only=True)
    restrictions = RestrictionSerializer(many=True, read_only=True)

    class Meta:
        model = Provider
        fields = [
            'id',
            'provider_name',
            'logo_url_dark',
            'logo_url_light',
            'status',
            'currency_mode',
            'google_sheet_id',
            'last_synced',
            'notes',
            'game_count',
            'supported_game_types',
            'fiat_currencies',
            'crypto_currencies',
            'restrictions',
        ]

    def get_supported_game_types(self, obj: Provider) -> list[str]:
        """Get distinct game types for this provider."""
        return obj.get_supported_game_types()


class StatsSerializer(serializers.Serializer):
    """Serializer for statistics endpoint."""

    total_providers = serializers.IntegerField()
    total_games = serializers.IntegerField()


class FilterOptionsSerializer(serializers.Serializer):
    """Serializer for available filter options."""

    game_types = serializers.ListField(child=serializers.CharField())
    currency_modes = serializers.ListField(child=serializers.CharField())
    fiat_currencies = serializers.ListField(child=serializers.CharField())
    crypto_currencies = serializers.ListField(child=serializers.CharField())
    countries = serializers.ListField(child=serializers.DictField(child=serializers.CharField()))


class CountrySerializer(serializers.ModelSerializer):
    """Serializer for countries."""

    class Meta:
        model = Country
        fields = ['iso3', 'iso2', 'name']
