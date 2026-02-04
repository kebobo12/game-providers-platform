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
