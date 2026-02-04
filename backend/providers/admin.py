"""
Admin configuration for Game Providers Platform.
"""
from django.contrib import admin

from .models import Country, CryptoCurrency, FiatCurrency, Game, Provider, Restriction


class FiatCurrencyInline(admin.TabularInline):
    model = FiatCurrency
    extra = 0


class CryptoCurrencyInline(admin.TabularInline):
    model = CryptoCurrency
    extra = 0


class RestrictionInline(admin.TabularInline):
    model = Restriction
    extra = 0


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ['provider_name', 'status', 'currency_mode', 'game_count', 'last_synced']
    list_filter = ['status', 'currency_mode']
    search_fields = ['provider_name']
    ordering = ['provider_name']
    inlines = [FiatCurrencyInline, CryptoCurrencyInline, RestrictionInline]

    def game_count(self, obj):
        return obj.games.count()
    game_count.short_description = 'Games'


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['game_title', 'provider', 'game_type', 'rtp', 'volatility', 'enabled']
    list_filter = ['provider', 'game_type', 'enabled', 'fun_mode']
    search_fields = ['game_title', 'title', 'provider__provider_name']
    ordering = ['game_title']
    raw_id_fields = ['provider']


@admin.register(FiatCurrency)
class FiatCurrencyAdmin(admin.ModelAdmin):
    list_display = ['provider', 'currency_code', 'display', 'source']
    list_filter = ['currency_code', 'display']
    search_fields = ['provider__provider_name', 'currency_code']
    ordering = ['provider__provider_name', 'currency_code']
    raw_id_fields = ['provider']


@admin.register(CryptoCurrency)
class CryptoCurrencyAdmin(admin.ModelAdmin):
    list_display = ['provider', 'currency_code', 'display', 'source']
    list_filter = ['currency_code', 'display']
    search_fields = ['provider__provider_name', 'currency_code']
    ordering = ['provider__provider_name', 'currency_code']
    raw_id_fields = ['provider']


@admin.register(Restriction)
class RestrictionAdmin(admin.ModelAdmin):
    list_display = ['provider', 'country_code', 'restriction_type', 'source']
    list_filter = ['restriction_type', 'country_code']
    search_fields = ['provider__provider_name', 'country_code']
    ordering = ['provider__provider_name', 'country_code']
    raw_id_fields = ['provider']


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['iso3', 'iso2', 'name']
    search_fields = ['name', 'iso2', 'iso3']
    ordering = ['name']
