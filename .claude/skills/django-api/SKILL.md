---
name: django-api
description: Creating or modifying Django REST API endpoints, serializers, viewsets, and filters. Use when adding new API features or debugging endpoint issues.
---

# Django API Development

## Patterns

Reference `backend/providers/` for model/serializer/view patterns.

## View Patterns

### Public ViewSets (`views.py`)

Standard DRF ViewSets for read-only public endpoints:

```python
class ProviderViewSet(viewsets.ReadOnlyModelViewSet):
    filterset_class = ProviderFilter
    # list → ProviderListSerializer (lightweight)
    # retrieve → ProviderDetailSerializer (nested relations)
```

### Admin Function-Based Views (`admin_views.py`)

Superuser-only endpoints using `@api_view` decorators:

```python
@api_view(['GET', 'POST'])
def admin_providers(request):
    if not request.user.is_superuser:
        return Response({'detail': 'Forbidden'}, status=403)
    # ... handler logic
```

Checklist for admin views:
1. Always check `request.user.is_superuser`
2. Return 403 with `{"detail": "Forbidden"}` for non-superusers
3. Use serializers for response data (never raw dicts)
4. Register route in `urls.py` under `/api/admin/` prefix

## Serializer Conventions

Current serializers in `backend/providers/serializers.py`:

| Serializer | Purpose |
|------------|---------|
| `ProviderListSerializer` | Lightweight for list views (includes `game_count`, `supported_game_types`) |
| `ProviderDetailSerializer` | Full with nested `fiat_currencies`, `crypto_currencies`, `restrictions` |
| `GameSerializer` | Game fields with read-only `provider_name` |
| `FiatCurrencySerializer` | Currency code, display, source |
| `CryptoCurrencySerializer` | Currency code, display, source |
| `RestrictionSerializer` | Country code, restriction type, source |
| `StatsSerializer` | `total_providers`, `total_games` |
| `FilterOptionsSerializer` | Game types, currency modes, currencies, countries |
| `CountrySerializer` | ISO3, ISO2, name |

Rules:
- `ListSerializer` — lightweight, for list views
- `DetailSerializer` — nested relations, for detail views
- Always define `Meta.fields` explicitly, never use `__all__`

## Filter Conventions

- Use `django_filters.FilterSet` classes in `backend/providers/filters.py`
- Register filters in viewset: `filterset_class = ProviderFilter`

## Pagination

- Default: `PageNumberPagination`, 24 items per page
- Configured in `backend/config/settings.py` under `REST_FRAMEWORK`

## Adding New Public Endpoints

1. Create/update model in `backend/providers/models.py`
2. Create serializer in `backend/providers/serializers.py`
3. Create view/viewset in `backend/providers/views.py`
4. Register URL in `backend/providers/urls.py`
5. Register model in `backend/providers/admin.py`
6. Run `python manage.py makemigrations && python manage.py migrate`

## Adding New Admin Endpoints

1. Add function-based view in `backend/providers/admin_views.py`
2. Start with superuser permission check
3. Register URL in `backend/providers/urls.py` under admin prefix
4. Use serializers for all response data

## CSV Export Pattern

Use `StreamingHttpResponse` for CSV exports:

```python
response = StreamingHttpResponse(csv_generator(), content_type='text/csv')
response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
```

Current export endpoints:
- `GET /api/providers/export/` — all providers
- `GET /api/providers/{id}/games/export/` — provider's games

## File Import Pattern

For CSV/Excel imports (see `admin_import` in `admin_views.py`):

```python
@api_view(['POST'])
def admin_import(request):
    file = request.FILES.get('file')
    # CSV: semicolon delimiter, handle UTF-8 BOM
    # Excel: requires openpyxl, look for column by name
    # Return: {"imported": N, "skipped": N, "errors": [...]}
```

## Management Commands

Location: `backend/providers/management/commands/`

| Command | Purpose |
|---------|---------|
| `sync_providers` | Sync providers/games from external API |
| `migrate_from_sqlite` | Import from legacy SQLite database |
| `create_default_admin` | Create default superuser if none exists |

## Error Responses

Always return: `{"detail": "Human readable message"}`

## URL Structure

```
/api/providers/          # Public provider endpoints (ViewSet)
/api/countries/          # Public country endpoints (ViewSet)
/api/health/             # Health check
/api/stats/              # Public stats
/api/filters/            # Filter options
/api/auth/               # Authentication (csrf, login, logout, me)
/api/admin/              # Superuser-only CRUD, sync, import
```
