# Database Schema

## Authoritative Source

All models defined in: [backend/providers/models.py](../backend/providers/models.py)

## Entity Overview

### Provider

Game provider company (e.g., Pragmatic Play, Evolution).

| Field | Type | Description |
|-------|------|-------------|
| id | BigAutoField | Primary key |
| provider_name | CharField(255) | Unique provider name |
| status | CharField(20) | DRAFT or ACTIVE |
| currency_mode | CharField(20) | LIST or ALL_FIAT |
| logo_url_dark | URLField(500) | Logo URL for dark theme (optional) |
| logo_url_light | URLField(500) | Logo URL for light theme (optional) |
| google_sheet_id | CharField(255) | Optional Google Sheet reference |
| last_synced | DateTimeField | Last API sync timestamp |
| notes | TextField | Optional notes |

Custom manager: `ProviderManager`
- `with_game_count()` — annotates queryset with game count
- `active()` — filters to ACTIVE status only

Methods:
- `get_supported_game_types()` — returns distinct game types from related games

### Game

Individual game from a provider.

| Field | Type | Description |
|-------|------|-------------|
| id | BigAutoField | Primary key |
| provider | ForeignKey | Provider reference (CASCADE) |
| wallet_game_id | CharField(255) | External wallet game ID |
| game_title | CharField(255) | Game title (required) |
| game_provider | CharField(255) | Provider name from API |
| vendor | CharField(255) | Game vendor |
| game_type | CharField(100) | slots, roulette, etc. |
| source | CharField(100) | Data source (api_sync, etc.) |
| game_id | IntegerField | External game ID |
| title | CharField(255) | Alternative title |
| platform | CharField(100) | desktop, mobile, etc. |
| subtype | CharField(100) | Game subtype |
| enabled | BooleanField | Is game enabled (default: true) |
| fun_mode | BooleanField | Has fun/demo mode (default: false) |
| rtp | DecimalField(6,2) | Return to player percentage |
| volatility | CharField(50) | low, medium, high |
| features | TextField | JSON array of features |
| themes | TextField | JSON array of themes |
| tags | TextField | JSON array of tags |
| thumbnail | URLField(500) | Game thumbnail URL |
| api_provider | CharField(255) | Original API provider name |

### FiatCurrency

Supported fiat currency for a provider.

| Field | Type | Description |
|-------|------|-------------|
| id | BigAutoField | Primary key |
| provider | ForeignKey | Provider reference (CASCADE) |
| currency_code | CharField(10) | ISO currency code (USD, EUR, etc.) |
| display | BooleanField | Show in UI (default: true) |
| source | CharField(100) | Data source |

Unique constraint: (provider, currency_code)

### CryptoCurrency

Supported cryptocurrency for a provider.

| Field | Type | Description |
|-------|------|-------------|
| id | BigAutoField | Primary key |
| provider | ForeignKey | Provider reference (CASCADE) |
| currency_code | CharField(20) | Crypto code (BTC, ETH, etc.) |
| display | BooleanField | Show in UI (default: true) |
| source | CharField(100) | Data source |

Unique constraint: (provider, currency_code)

### Restriction

Country restriction for a provider.

| Field | Type | Description |
|-------|------|-------------|
| id | BigAutoField | Primary key |
| provider | ForeignKey | Provider reference (CASCADE) |
| country_code | CharField(10) | ISO country code |
| restriction_type | CharField(20) | RESTRICTED or REGULATED |
| source | CharField(100) | Data source |

Unique constraint: (provider, country_code)

### Country

Reference table for country ISO codes.

| Field | Type | Description |
|-------|------|-------------|
| iso3 | CharField(3) | Primary key, ISO 3166-1 alpha-3 |
| iso2 | CharField(2) | ISO 3166-1 alpha-2 |
| name | CharField(255) | Country name |

## Relationships

```
Provider
├── has many Games (via provider FK, related_name='games')
├── has many FiatCurrencies (via provider FK, related_name='fiat_currencies')
├── has many CryptoCurrencies (via provider FK, related_name='crypto_currencies')
└── has many Restrictions (via provider FK, related_name='restrictions')

Country (standalone reference table)
```

## Migrations

View migration history:
```bash
docker compose exec backend python manage.py showmigrations
```

Create new migration:
```bash
docker compose exec backend python manage.py makemigrations
```

Apply migrations:
```bash
docker compose exec backend python manage.py migrate
```

Current migrations:
- `0001_initial` — Provider, Game, FiatCurrency, CryptoCurrency, Restriction, Country
- `0002_provider_logo_url` — Added logo_url field
- `0003_rename_logo_url_add_light` — Split into logo_url_dark + logo_url_light

## Data Import

Import from legacy SQLite:
```bash
docker compose exec backend python manage.py migrate_from_sqlite /path/to/database.sqlite
```

Sync from external API:
```bash
docker compose exec backend python manage.py sync_providers
```
