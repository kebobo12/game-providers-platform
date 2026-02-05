# Architecture Overview

## Services

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  Postgres   │
│  (React)    │     │  (Django)   │     │   (DB)      │
│  :5173      │     │  :9000      │     │  :5432      │
└─────────────┘     └─────────────┘     └─────────────┘
     Local              Docker              Docker
```

### Development Setup

- **Database**: PostgreSQL 16 in Docker, persisted in `pgdata` volume
- **Backend**: Django 5.x + DRF in Docker, port 9000, hot-reload via volume mount
- **Frontend**: Vite dev server running locally (not in Docker), port 5173, proxies `/api/` to backend

```bash
docker compose up -d db backend    # Start database + backend
cd frontend && npm run dev         # Start frontend locally
```

### Full Docker Setup (alternative)

All three services run in Docker on the `app-network` bridge:

```bash
docker compose up -d               # Start all services
```

## Configuration

Service configuration: [docker-compose.yml](../docker-compose.yml)

Environment variables: [.env](../.env)

| Variable | Purpose |
|----------|---------|
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `DJANGO_SECRET_KEY` | Django secret key |
| `DJANGO_DEBUG` | Debug mode flag |
| `DATABASE_URL` | Full database connection string |

## Data Flow

### Public Dashboard

1. User opens React app at `:5173`
2. React fetches stats, filter options, and providers via `/api/*`
3. Vite dev server proxies API calls to Django backend at `:9000`
4. Django queries Postgres via ORM (with annotations like `game_count`)
5. DRF serializes response, flows back through proxy to browser
6. React Query caches responses (2 min stale time)

### Admin Operations

1. Superuser logs in via `/api/auth/login/` (session-based)
2. Admin page fetches DB stats, provider list
3. CRUD operations go through `/api/admin/*` endpoints
4. Sync triggers `sync_providers` management command
5. Import accepts CSV/Excel file uploads

### Authentication

- Session-based authentication (Django sessions)
- CSRF token required for POST/PUT/DELETE requests
- Frontend `api/client.js` handles CSRF token fetching automatically
- Protected routes in React check auth state via `useAuth` hook

## Backend Structure

```
backend/
├── config/
│   ├── settings.py          # Django settings, DRF config, CORS
│   ├── urls.py              # Root URL config: /api/ → providers.urls
│   └── wsgi.py
├── providers/
│   ├── models.py            # 6 models: Provider, Game, FiatCurrency, CryptoCurrency, Restriction, Country
│   ├── serializers.py       # List/Detail/Stats/Filter serializers
│   ├── views.py             # Public ViewSets + standalone views
│   ├── admin_views.py       # Superuser-only function-based views
│   ├── filters.py           # DRF FilterSet classes
│   ├── urls.py              # All route definitions
│   ├── admin.py             # Django admin site
│   ├── exceptions.py        # Custom exception classes
│   └── management/commands/
│       ├── sync_providers.py       # External API sync
│       ├── migrate_from_sqlite.py  # Legacy data import
│       └── create_default_admin.py # Initial admin user
└── manage.py
```

## Frontend Structure

```
frontend/src/
├── main.jsx                 # React entry, renders App
├── App.jsx                  # Routes, QueryClientProvider, AuthProvider
├── index.css                # CSS variables (dark/light themes), custom utilities
├── api/
│   └── client.js            # Fetch wrapper: CSRF, auth, error handling
├── hooks/
│   ├── useAuth.jsx          # Auth context + AuthProvider
│   ├── useTheme.js          # Theme toggle, localStorage
│   ├── useFilters.js        # Filter state + URL param sync
│   ├── useFilterOptions.js  # Fetch filter options
│   ├── useProviders.js      # Fetch provider list
│   ├── useProviderDetail.js # Fetch provider detail (lazy)
│   ├── useProviderGames.js  # Fetch provider games
│   └── useStats.js          # Fetch dashboard stats
├── pages/
│   ├── HomePage.jsx         # Stats + Filters + ProviderGrid
│   └── AdminPage.jsx        # Admin CRUD + Sync + Import + Stats
└── components/
    ├── Admin/               # CRUD tables, form modals, sync/import cards
    ├── Auth/                # Login page
    ├── Filters/             # Search, dropdowns, active filter badges
    ├── Layout/              # Header, footer, theme toggle
    ├── Modals/              # Base modal, specific modals
    ├── Providers/           # Provider cards, grid, tabs
    ├── Stats/               # Dashboard stat cards
    └── shared/              # Export button, pagination
```

## Key Architectural Decisions

- **Fat models, thin views**: Business logic in models/managers, views just orchestrate
- **Session auth over JWT**: Simpler for single-domain B2B tool
- **React Query for server state**: Caching, deduplication, background refetching
- **CSS variables for theming**: Single source of truth, dark/light toggle
- **URL param sync for filters**: Shareable/bookmarkable filter states
- **No raw SQL**: Django ORM exclusively, custom manager methods for complex queries
