# Architecture Overview

## Services

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  Postgres   │
│  (React)    │     │  (Django)   │     │   (DB)      │
│  :5173      │     │  :9000      │     │  :5432      │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **Frontend**: Vite dev server, proxies `/api/` to backend
- **Backend**: Django + DRF, serves REST API
- **Database**: Postgres 16, persisted in Docker volume

## Configuration

Service configuration: [docker-compose.yml](../docker-compose.yml)

Environment variables: [.env](../.env)

## Data Flow

1. User interacts with React UI
2. React calls `/api/*` endpoints
3. Vite proxies to Django backend
4. Django queries Postgres via ORM
5. Response flows back through the chain

## Backend Structure

See [backend/config/settings.py](../backend/config/settings.py) for Django configuration.

Main app: [backend/providers/](../backend/providers/)

## Frontend Structure

Entry point: [frontend/src/main.jsx](../frontend/src/main.jsx)

Vite config with proxy: [frontend/vite.config.js](../frontend/vite.config.js)
