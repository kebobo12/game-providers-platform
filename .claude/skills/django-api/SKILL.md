---
name: django-api
description: Creating or modifying Django REST API endpoints, serializers, viewsets, and filters. Use when adding new API features or debugging endpoint issues.
---

# Django API Development

## Patterns

Reference `backend/providers/` for model/serializer/view patterns.

## Serializer Conventions

- `ListSerializer` — lightweight, for list views
- `DetailSerializer` — nested relations, for detail views
- Always define `Meta.fields` explicitly, never use `__all__`

## Filter Conventions

- Use `django_filters.FilterSet` classes in `backend/providers/filters.py`
- Register filters in viewset: `filterset_class = ProviderFilter`

## Pagination

- Default: `PageNumberPagination`, 24 items per page
- Configured in `backend/config/settings.py` under `REST_FRAMEWORK`

## Adding New Endpoints

1. Create/update model in `backend/providers/models.py`
2. Create serializer in `backend/providers/serializers.py`
3. Create view/viewset in `backend/providers/views.py`
4. Register URL in `backend/providers/urls.py`
5. Register model in `backend/providers/admin.py`
6. Run `python manage.py makemigrations && python manage.py migrate`

## Export Endpoints

For CSV exports, use `StreamingHttpResponse`:
- Set `content_type='text/csv'`
- Set `Content-Disposition` header with filename

## Error Responses

Always return: `{"detail": "Human readable message"}`
