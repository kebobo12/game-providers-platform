# API Reference

## Authoritative Source

All routes defined in: [backend/providers/urls.py](../backend/providers/urls.py)

All serializers defined in: [backend/providers/serializers.py](../backend/providers/serializers.py)

All filters defined in: [backend/providers/filters.py](../backend/providers/filters.py)

## Base URL

- Development: `http://localhost:9000/api/`
- Via frontend proxy: `http://localhost:5173/api/`

## Endpoints

### Health Check

```
GET /api/health/
```

Response:
```json
{"status": "ok"}
```

### Stats

```
GET /api/stats/
```

Returns total counts for dashboard.

Response:
```json
{
  "total_providers": 133,
  "total_games": 14460
}
```

### Filter Options

```
GET /api/filters/
```

Returns available values for filter dropdowns.

Response:
```json
{
  "game_types": ["Slots", "Roulette", "Blackjack", ...],
  "currency_modes": ["LIST", "ALL_FIAT"],
  "fiat_currencies": ["USD", "EUR", "GBP", ...],
  "crypto_currencies": ["BTC", "ETH", "USDT", ...],
  "countries": ["US", "GB", "DE", ...]
}
```

### Providers

#### List Providers

```
GET /api/providers/
```

Paginated list (24 per page).

**Query Parameters:**

| Parameter | Description |
|-----------|-------------|
| `search` | Search by provider name (case-insensitive) |
| `game_type` | Filter by supported game type |
| `currency_mode` | Filter by currency mode (LIST, ALL_FIAT) |
| `supported_currency` | Filter by supported fiat or crypto currency |
| `restricted_country` | Filter by restricted country code |
| `regulated_country` | Filter by regulated country code |
| `ordering` | Sort by field (provider_name, game_count, -provider_name, -game_count) |
| `page` | Page number |

Response:
```json
{
  "count": 133,
  "next": "http://localhost:9000/api/providers/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "provider_name": "Pragmatic Play",
      "status": "ACTIVE",
      "currency_mode": "ALL_FIAT",
      "game_count": 250,
      "supported_game_types": ["Slots", "Live"]
    }
  ]
}
```

#### Provider Detail

```
GET /api/providers/{id}/
```

Full provider detail with nested currencies and restrictions.

Response:
```json
{
  "id": 1,
  "provider_name": "Pragmatic Play",
  "status": "ACTIVE",
  "currency_mode": "ALL_FIAT",
  "google_sheet_id": null,
  "last_synced": "2024-01-15T10:30:00Z",
  "notes": null,
  "game_count": 250,
  "supported_game_types": ["Slots", "Live"],
  "fiat_currencies": [
    {"currency_code": "USD", "display": true, "source": "sheet"}
  ],
  "crypto_currencies": [
    {"currency_code": "BTC", "display": true, "source": "sheet"}
  ],
  "restrictions": [
    {"country_code": "US", "restriction_type": "RESTRICTED", "source": "sheet"}
  ]
}
```

#### Provider Games

```
GET /api/providers/{id}/games/
```

Paginated list of games for a provider.

**Query Parameters:**

| Parameter | Description |
|-----------|-------------|
| `search` | Search by game title |
| `volatility` | Filter by volatility |
| `game_type` | Filter by game type |
| `enabled` | Filter by enabled status |
| `page` | Page number |

Response:
```json
{
  "count": 250,
  "next": "http://localhost:9000/api/providers/1/games/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "provider": 1,
      "provider_name": "Pragmatic Play",
      "game_title": "Sweet Bonanza",
      "game_type": "Slots",
      "rtp": "96.48",
      "volatility": "high",
      "thumbnail": "https://..."
    }
  ]
}
```

#### Export Providers CSV

```
GET /api/providers/export/
```

Download all providers as CSV. Supports same filters as list endpoint.

Response: `text/csv` file download

#### Export Provider Games CSV

```
GET /api/providers/{id}/games/export/
```

Download games for a provider as CSV. Supports same filters as games endpoint.

Response: `text/csv` file download

### Countries

```
GET /api/countries/
```

List all countries (no pagination).

Response:
```json
[
  {"iso3": "USA", "iso2": "US", "name": "United States"},
  {"iso3": "GBR", "iso2": "GB", "name": "United Kingdom"}
]
```

## Pagination

All list endpoints use page-based pagination:

- `page`: Page number (default: 1)
- Default page size: 24 items

Response format:
```json
{
  "count": 100,
  "next": "http://localhost:9000/api/providers/?page=2",
  "previous": null,
  "results": [...]
}
```

## Admin Endpoints (Superuser Only)

All admin endpoints require `is_superuser=true`. Returns 403 for non-superusers.

### Admin Stats

```
GET /api/admin/stats/
```

Returns detailed database statistics.

Response:
```json
{
  "providers": 133,
  "games": 14460,
  "fiat_currencies": 450,
  "crypto_currencies": 120,
  "restrictions": 890,
  "countries": 250,
  "last_sync": "2024-01-15T10:30:00Z"
}
```

### Admin Sync

```
POST /api/admin/sync/
```

Trigger provider sync from external API.

Response:
```json
{
  "success": true,
  "providers_processed": 133,
  "games_synced": 14460,
  "output": "..."
}
```

### Admin Import

```
POST /api/admin/import/
```

Import providers from CSV or Excel file.

Request: `multipart/form-data` with `file` field

Response:
```json
{
  "imported": 10,
  "skipped": 2,
  "errors": ["Row 5: Invalid status value"]
}
```

### Admin Provider CRUD

#### List Providers

```
GET /api/admin/providers/
```

Query Parameters:
- `search`: Filter by provider name

Response: Array of provider objects

#### Create Provider

```
POST /api/admin/providers/
```

Request:
```json
{
  "provider_name": "New Provider",
  "status": "DRAFT",
  "currency_mode": "ALL_FIAT"
}
```

#### Get Provider

```
GET /api/admin/providers/{id}/
```

#### Update Provider

```
PUT /api/admin/providers/{id}/
```

Request:
```json
{
  "provider_name": "Updated Name",
  "status": "ACTIVE",
  "currency_mode": "LIST"
}
```

#### Delete Provider

```
DELETE /api/admin/providers/{id}/
```

### Admin Game CRUD

#### List Games

```
GET /api/admin/games/
```

Query Parameters:
- `provider`: Filter by provider ID
- `search`: Filter by game title

#### Create Game

```
POST /api/admin/games/
```

Request:
```json
{
  "provider": 1,
  "game_title": "New Game",
  "game_type": "Slots",
  "rtp": 96.5,
  "volatility": "high"
}
```

#### Update Game

```
PUT /api/admin/games/{id}/
```

#### Delete Game

```
DELETE /api/admin/games/{id}/
```

### Admin Currency Management

#### List Currencies

```
GET /api/admin/providers/{id}/currencies/
```

Response:
```json
{
  "fiat": [{"id": 1, "currency_code": "USD"}],
  "crypto": [{"id": 2, "currency_code": "BTC"}]
}
```

#### Add Currencies

```
POST /api/admin/providers/{id}/currencies/
```

Request:
```json
{
  "currency_codes": "USD, EUR, GBP",
  "type": "fiat"
}
```

#### Delete Currency

```
DELETE /api/admin/providers/{id}/currencies/{code}/?type=fiat
```

### Admin Restriction Management

#### List Restrictions

```
GET /api/admin/providers/{id}/restrictions/
```

Response:
```json
[
  {"id": 1, "country_code": "US", "restriction_type": "RESTRICTED"},
  {"id": 2, "country_code": "GB", "restriction_type": "REGULATED"}
]
```

#### Add Restrictions

```
POST /api/admin/providers/{id}/restrictions/
```

Request:
```json
{
  "country_codes": "US, GB, DE",
  "restriction_type": "RESTRICTED"
}
```

#### Delete Restriction

```
DELETE /api/admin/providers/{id}/restrictions/{restriction_id}/
```

## Error Format

All errors return:
```json
{
  "detail": "Human readable error message"
}
```

HTTP status codes:
- `400`: Bad request / validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error
