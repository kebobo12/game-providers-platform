# Game Providers Platform

B2B tool for managing iGaming provider data — browse providers, filter by game types/currencies/countries, manage provider details, import/sync data. Django 5.x backend (DRF) + React 18 frontend (Vite + Tailwind + React Query) + Postgres 16. Docker Compose for local dev, Railway-ready for production.

## Commands

```bash
# Dev setup
docker compose up -d db backend                          # start database + backend
cd frontend && npm install && npm run dev                 # frontend dev (local, with hot reload)

# Full Docker (alternative)
docker compose up -d                                      # start all services in Docker

# Backend
docker compose logs backend                               # check backend logs
docker compose exec backend python manage.py migrate      # run migrations
docker compose exec backend python manage.py test         # run tests

# Management commands
docker compose exec backend python manage.py sync_providers        # sync from external API
docker compose exec backend python manage.py migrate_from_sqlite   # import from legacy SQLite
docker compose exec backend python manage.py create_default_admin  # create admin user

# Frontend
cd frontend && npm run build                              # production build
cd frontend && npm run lint                               # lint check
```

## Code Style

**Backend:** Python 3.12, Django conventions, type hints on function signatures. Fat models, thin views — business logic in models/managers.

**Frontend:** ES modules, functional React with hooks, Tailwind for styling. No inline styles, no `!important`. One component per file.

**API:** RESTful naming, DRF serializers only (never raw dicts), consistent errors `{"detail": "message"}`.

**Database:** Django ORM only, never raw SQL. All secrets in `.env`.

## Architecture

```
Frontend (React 18 + Vite)  →  Backend (Django 5 + DRF)  →  Postgres 16
    :5173 (local dev)              :9000 (Docker)              :5432 (Docker)
```

### Backend Structure

```
backend/
├── config/              # Django project settings, URLs, WSGI
├── providers/
│   ├── models.py        # Provider, Game, FiatCurrency, CryptoCurrency, Restriction, Country
│   ├── serializers.py   # List/Detail serializers, StatsSerializer, FilterOptionsSerializer
│   ├── views.py         # Public ViewSets (providers, countries, stats, filters, exports)
│   ├── admin_views.py   # Superuser-only CRUD, sync, import endpoints
│   ├── filters.py       # DRF filter backends
│   ├── urls.py          # All API route definitions
│   └── management/commands/
│       ├── sync_providers.py
│       ├── migrate_from_sqlite.py
│       └── create_default_admin.py
└── manage.py
```

### Frontend Structure

```
frontend/src/
├── api/client.js            # API wrapper with CSRF, auth, error handling
├── hooks/                   # useAuth, useTheme, useFilters, useProviders, useStats, etc.
├── pages/
│   ├── HomePage.jsx         # Public dashboard: stats, filters, provider grid
│   └── AdminPage.jsx        # Admin: CRUD tables, sync, import, stats
├── components/
│   ├── Admin/               # ProvidersTable, GamesTable, SyncCard, ImportCard, LogoPreview, etc.
│   ├── Auth/                # LoginPage
│   ├── Filters/             # SearchInput, FilterDropdown, ActiveFilters, FilterPanel
│   ├── Layout/              # Header, Footer, ThemeToggle
│   ├── Modals/              # Modal, GameListModal, CurrencyModal, CountryModal, Lightbox
│   ├── Providers/           # ProviderCard, ProviderGrid, ProviderTabs, tabs/
│   ├── Stats/               # StatsCards
│   └── shared/              # ExportButton, Pagination
└── index.css                # CSS variables for dark/light themes
```

## API Routes

### Public

- `GET /api/health/` — Health check
- `GET /api/stats/` — Provider & game counts
- `GET /api/filters/` — Filter dropdown options
- `GET /api/providers/` — Paginated provider list (filterable, sortable)
- `GET /api/providers/{id}/` — Provider detail with nested currencies/restrictions
- `GET /api/providers/{id}/games/` — Provider's games (paginated, filterable)
- `GET /api/providers/export/` — Providers CSV export
- `GET /api/providers/{id}/games/export/` — Games CSV export
- `GET /api/countries/` — Country reference list

### Auth

- `GET /api/auth/csrf/` — Get CSRF token
- `POST /api/auth/login/` — Session login
- `POST /api/auth/logout/` — Logout
- `GET /api/auth/me/` — Current user info

### Admin (superuser only)

- `GET /api/admin/stats/` — Detailed DB stats
- `POST /api/admin/sync/` — Trigger external API sync
- `POST /api/admin/import/` — CSV/Excel file import
- CRUD: `/api/admin/providers/`, `/api/admin/games/`
- Nested: `/api/admin/providers/{id}/currencies/`, `/api/admin/providers/{id}/restrictions/`

## Environment Variables

```
POSTGRES_DB=game_providers
POSTGRES_USER=gpuser
POSTGRES_PASSWORD=changeme
DJANGO_SECRET_KEY=django-insecure-change-this-in-production-abc123xyz
DJANGO_DEBUG=True
DATABASE_URL=postgres://gpuser:changeme@db:5432/game_providers
```

## Testing

- Backend: pytest + Django test client
- Frontend: Vitest + React Testing Library
- Write tests for API endpoints, not internal functions

## Git

- Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Branches: `feature/`, `fix/`, `refactor/`

## Key Paths

- Backend models/views: `backend/providers/`
- Admin endpoints: `backend/providers/admin_views.py`
- Frontend components: `frontend/src/components/`
- Frontend hooks: `frontend/src/hooks/`
- API routes: `backend/providers/urls.py`
- API client: `frontend/src/api/client.js`
- Docker config: `docker-compose.yml`
- Legacy reference: `C:/Users/PC/projects/game_provider_app/`

## Context Files

Read these before starting specific types of work:

- **Django API work:** `.claude/skills/django-api/SKILL.md`
- **React components:** `.claude/skills/react-component/SKILL.md`
- **Data migrations:** `.claude/skills/data-migration/SKILL.md`
- **Backend dev guidelines:** `.claude/agents/backend-dev.md`
- **Frontend dev guidelines:** `.claude/agents/frontend-dev.md`
- **Codebase exploration:** `.claude/agents/explore.md`
