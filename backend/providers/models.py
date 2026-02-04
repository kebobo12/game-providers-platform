"""
Models for Game Providers Platform.

Entity relationship:
- Provider has many FiatCurrencies, CryptoCurrencies, Restrictions, Games
- Game belongs to a Provider
- Country is a reference table for ISO codes
"""
from django.db import models
from django.db.models import Count


class ProviderManager(models.Manager):
    """Custom manager for Provider model."""

    def with_game_count(self):
        """Annotate providers with their game count."""
        return self.annotate(game_count=Count('games'))

    def active(self):
        """Return only active providers."""
        return self.filter(status=Provider.Status.ACTIVE)


class Provider(models.Model):
    """Game provider company (e.g., Pragmatic Play, Evolution)."""

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'

    class CurrencyMode(models.TextChoices):
        LIST = 'LIST', 'List (specific currencies)'
        ALL_FIAT = 'ALL_FIAT', 'All Fiat currencies'

    provider_name = models.CharField(max_length=255, unique=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    currency_mode = models.CharField(
        max_length=20,
        choices=CurrencyMode.choices,
        default=CurrencyMode.ALL_FIAT,
    )
    google_sheet_id = models.CharField(max_length=255, blank=True, null=True)
    last_synced = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    objects = ProviderManager()

    class Meta:
        ordering = ['provider_name']

    def __str__(self) -> str:
        return self.provider_name

    def get_supported_game_types(self) -> list[str]:
        """Return distinct game types for this provider."""
        game_types = set(
            self.games.exclude(game_type__isnull=True)
            .exclude(game_type='')
            .values_list('game_type', flat=True)
        )
        return sorted(game_types)


class Game(models.Model):
    """Individual game from a provider."""

    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name='games',
    )
    wallet_game_id = models.CharField(max_length=255, blank=True, null=True)
    game_title = models.CharField(max_length=255)
    game_provider = models.CharField(max_length=255, blank=True, null=True)
    vendor = models.CharField(max_length=255, blank=True, null=True)
    game_type = models.CharField(max_length=100, blank=True, null=True)
    source = models.CharField(max_length=100, blank=True, null=True)
    game_id = models.IntegerField(blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    platform = models.CharField(max_length=100, blank=True, null=True)
    subtype = models.CharField(max_length=100, blank=True, null=True)
    enabled = models.BooleanField(default=True)
    fun_mode = models.BooleanField(default=False)
    rtp = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    volatility = models.CharField(max_length=50, blank=True, null=True)
    features = models.TextField(blank=True, null=True)
    themes = models.TextField(blank=True, null=True)
    tags = models.TextField(blank=True, null=True)
    thumbnail = models.URLField(max_length=500, blank=True, null=True)
    api_provider = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['game_title']

    def __str__(self) -> str:
        return self.game_title


class FiatCurrency(models.Model):
    """Supported fiat currency for a provider."""

    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name='fiat_currencies',
    )
    currency_code = models.CharField(max_length=10)
    display = models.BooleanField(default=True)
    source = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ['provider', 'currency_code']
        ordering = ['currency_code']
        verbose_name_plural = 'Fiat currencies'

    def __str__(self) -> str:
        return f"{self.provider.provider_name} - {self.currency_code}"


class CryptoCurrency(models.Model):
    """Supported cryptocurrency for a provider."""

    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name='crypto_currencies',
    )
    currency_code = models.CharField(max_length=20)
    display = models.BooleanField(default=True)
    source = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ['provider', 'currency_code']
        ordering = ['currency_code']
        verbose_name_plural = 'Crypto currencies'

    def __str__(self) -> str:
        return f"{self.provider.provider_name} - {self.currency_code}"


class Restriction(models.Model):
    """Country restriction for a provider."""

    class RestrictionType(models.TextChoices):
        RESTRICTED = 'RESTRICTED', 'Restricted'
        REGULATED = 'REGULATED', 'Regulated'

    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name='restrictions',
    )
    country_code = models.CharField(max_length=10)
    restriction_type = models.CharField(
        max_length=20,
        choices=RestrictionType.choices,
        default=RestrictionType.RESTRICTED,
    )
    source = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ['provider', 'country_code']
        ordering = ['country_code']

    def __str__(self) -> str:
        return f"{self.provider.provider_name} - {self.country_code} ({self.restriction_type})"


class Country(models.Model):
    """Reference table for country ISO codes."""

    iso3 = models.CharField(max_length=3, primary_key=True)
    iso2 = models.CharField(max_length=2, blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Countries'

    def __str__(self) -> str:
        return self.name or self.iso3
