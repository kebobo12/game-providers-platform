# Game Providers Platform

B2B tool for managing iGaming provider data. Django 5.x backend (DRF) + React 18 frontend (Vite + Tailwind) + Postgres 16. Docker Compose for local dev, Railway-ready for production.

## Commands

```bash
docker compose up -d                                      # start all services
docker compose logs backend                               # check backend logs
docker compose exec backend python manage.py migrate      # run migrations
docker compose exec backend python manage.py test         # run tests
cd frontend && npm run dev                                # frontend dev (outside Docker)
cd frontend && npm run build                              # production build
```

## Code Style

**Backend:** Python 3.12, Django conventions, type hints on function signatures. Fat models, thin views — business logic in models/managers.

**Frontend:** ES modules, functional React with hooks, Tailwind for styling. No inline styles, no `!important`. One component per file.

**API:** RESTful naming, DRF serializers only (never raw dicts), consistent errors `{"detail": "message"}`.

**Database:** Django ORM only, never raw SQL. All secrets in `.env`.

## Testing

- Backend: pytest + Django test client
- Frontend: Vitest + React Testing Library
- Write tests for API endpoints, not internal functions

## Git

- Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Branches: `feature/`, `fix/`, `refactor/`

## Key Paths

- Backend models/views: `backend/providers/`
- Frontend components: `frontend/src/components/`
- API routes: `backend/providers/urls.py`
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
