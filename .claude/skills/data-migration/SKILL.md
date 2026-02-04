---
name: data-migration
description: Creating Django management commands for data import/export, syncing from external APIs, or migrating from SQLite. Use for any data pipeline work.
---

# Data Migration & Sync

## Management Commands

Location: `backend/providers/management/commands/`

Structure:
```
backend/providers/management/
  __init__.py
  commands/
    __init__.py
    your_command.py
```

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
