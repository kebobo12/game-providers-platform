---
name: data-migration
description: Creating Django management commands for data import/export, syncing from external APIs, or migrating from SQLite. Use for any data pipeline work.
---

# Data Migration & Sync

## Management Commands

Location: `backend/providers/management/commands/`

### sync_providers

Syncs providers and games from an external API.

```bash
docker compose exec backend python manage.py sync_providers
```

What it does:
- Fetches provider data from external API
- Uses provider name mapping to normalize API variants to DB names
- Creates/updates Provider records
- Syncs associated games
- Updates `last_synced` timestamp on each provider
- Can also be triggered via `POST /api/admin/sync/` (superuser only)

### migrate_from_sqlite

Imports data from the legacy SQLite database.

```bash
docker compose exec backend python manage.py migrate_from_sqlite /path/to/database.sqlite
```

What it does:
- Reads providers, games, currencies, and restrictions from SQLite
- Maps to current PostgreSQL schema
- Uses `get_or_create()` to avoid duplicates

### create_default_admin

Creates a default superuser if none exists.

```bash
docker compose exec backend python manage.py create_default_admin
```

What it does:
- Checks if any superuser exists
- Creates one with default credentials if not
- Used for initial setup and Docker deployments

## Admin Import Endpoint

File import via `POST /api/admin/import/` (superuser only):

- Accepts `multipart/form-data` with `file` field
- **CSV format:** semicolon (`;`) delimiter, handles UTF-8 BOM
- **Excel format:** requires `openpyxl`, looks for column headers: `Provider Name`, `provider_name`, or `name`
- Returns: `{"imported": N, "skipped": N, "errors": [...]}`
- Errors are capped at first 10 entries

## Reference Implementation

See `backend/scripts/api_sync.py` for patterns:
- API authentication
- Provider name mapping
- Batch upsert logic
- Progress logging

## Best Practices

### Use Transactions

Wrap bulk operations in `transaction.atomic()` for consistency.

### Progress Reporting

Use `self.stdout.write()` for status messages:
- `self.stdout.write(self.style.SUCCESS('Done'))`
- `self.stdout.write(self.style.WARNING('Skipped'))`
- `self.stdout.write(self.style.ERROR('Failed'))`

### Error Handling

Log errors and continue — don't crash on single record failure:
- Track failed records
- Report summary at end
- Return non-zero exit code if any failures

### Django ORM

Always use ORM for database operations:
- `get_or_create()` for single records
- `bulk_create()` with `update_conflicts=True` for batch upserts
- `select_related()` / `prefetch_related()` to avoid N+1

## Legacy Data

Original SQLite database: `C:/Users/PC/projects/game_provider_app/db/database.sqlite`
