---
description: Frontend development agent for React UI work. Specializes in components, hooks, styling, and API integration.
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Frontend Development Agent

You are a React/Tailwind specialist working on the Game Providers Platform frontend.

## Before Creating Anything

1. Check existing components in `frontend/src/components/`
2. Check existing pages in `frontend/src/pages/`
3. Check existing hooks in `frontend/src/hooks/`
4. Reuse patterns, don't reinvent

## Component Directory

```
frontend/src/components/
├── Admin/
│   ├── ConfirmDialog.jsx    # Confirmation modal for destructive actions
│   ├── CountryManager.jsx   # Manage country restrictions
│   ├── CurrencyManager.jsx  # Manage fiat/crypto currencies
│   ├── DbStatsCard.jsx      # Database statistics display
│   ├── FormModal.jsx        # Generic form modal + FormField, TextInput, TextArea, Select
│   ├── GamesTable.jsx       # CRUD table for games
│   ├── ImportCard.jsx       # CSV/Excel file import UI
│   ├── LogoPreview.jsx      # Logo URL input with preview, drag-and-drop swap
│   ├── ProviderDetail.jsx   # Full provider detail with tabs
│   ├── ProvidersTable.jsx   # CRUD table for providers
│   └── SyncCard.jsx         # Trigger API sync
├── Auth/
│   └── LoginPage.jsx        # Login form
├── Filters/
│   ├── ActiveFilters.jsx    # Applied filter badges with remove
│   ├── FilterDropdown.jsx   # Reusable dropdown (single/multi-select)
│   ├── FilterPanel.jsx      # Container composing search + dropdowns
│   ├── SearchInput.jsx      # Debounced search input
│   └── index.js
├── Layout/
│   ├── Footer.jsx
│   ├── Header.jsx           # Nav with auth, admin link, theme toggle
│   ├── Layout.jsx           # Main layout wrapper
│   ├── ThemeToggle.jsx      # Dark/light mode toggle
│   └── index.jsx
├── Modals/
│   ├── CountryModal.jsx     # Country restrictions modal
│   ├── CurrencyModal.jsx    # Currency management modal
│   ├── GameListModal.jsx    # Games list modal
│   ├── Lightbox.jsx         # Image viewer
│   ├── Modal.jsx            # Base modal component
│   └── index.js
├── Providers/
│   ├── GameCard.jsx         # Individual game display
│   ├── ProviderCard.jsx     # Expandable provider card
│   ├── ProviderGrid.jsx     # Grid layout for cards
│   ├── ProviderTabs.jsx     # Tab container for provider detail
│   ├── index.js
│   └── tabs/
│       ├── CountriesTab.jsx
│       ├── CurrenciesTab.jsx
│       ├── GamesTab.jsx
│       ├── OverviewTab.jsx
│       └── index.js
├── Stats/
│   └── StatsCards.jsx       # Dashboard stat cards
└── shared/
    ├── ExportButton.jsx     # CSV export trigger
    ├── Pagination.jsx       # Page navigation
    └── index.js
```

## Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Auth state, login/logout, superuser check. Context-based (AuthProvider) |
| `useTheme` | Dark/light toggle. Returns `{ theme, isDark, toggleTheme, setTheme }`. localStorage key: `gp-theme` |
| `useFilters` | Filter state with URL param sync. Debounced search. `{ filters, updateFilter, clearFilters }` |
| `useFilterOptions` | Fetch dropdown options from `/api/filters/` |
| `useProviders` | Fetch paginated providers with filter params |
| `useProviderDetail` | Fetch single provider, supports `{ enabled }` option for lazy loading |
| `useProviderGames` | Fetch games for a provider |
| `useStats` | Fetch dashboard stats from `/api/stats/` |

## Key Patterns

### Modal Workflow

1. Base: `Modals/Modal.jsx` for portal + backdrop + escape key
2. Admin forms: `Admin/FormModal.jsx` wraps Modal with form, submit/cancel buttons
3. Confirmations: `Admin/ConfirmDialog.jsx` for delete/destructive actions
4. State pattern: `const [isOpen, setIsOpen] = useState(false)`

### Admin Page Pattern

`AdminPage.jsx` composes:
- `DbStatsCard` — database statistics
- `SyncCard` — trigger API sync
- `ImportCard` — file import
- `ProvidersTable` — provider CRUD (with nested `GamesTable` via `ProviderDetail`)

### Server State

TanStack React Query v5 for all API data:
- `QueryClientProvider` wraps app in `App.jsx`
- `staleTime: 2 * 60 * 1000` (2 min default)
- `refetchOnWindowFocus: false`
- Hooks return `{ data, isLoading, error }` pattern

### API Client

```javascript
import { api } from '../api/client'
// api.get(endpoint), api.post(endpoint, body), api.put(endpoint, body), api.delete(endpoint)
// api.auth.login(username, password), api.auth.logout(), api.auth.me(), api.auth.getCsrf()
```

CSRF handled automatically. Session auth via cookies with `credentials: 'include'`.

## Styling Rules

- Use Tailwind utility classes exclusively
- No custom CSS unless absolutely necessary
- No inline styles (exception: dynamic `backgroundColor` for logo previews)
- No `!important`
- Theme colors via CSS variables: `text-text`, `bg-surface`, `border-border`, `text-primary`, etc.
- Custom utility: `.bg-checkerboard` for transparent image backgrounds

## Testing Changes

View at http://localhost:5173 after changes.

Test responsive design at:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px

## API Integration

- API base URL: `/api/` (proxied to backend via Vite config)
- Use `api` wrapper from `frontend/src/api/client.js`
- Handle loading and error states in every component

## Key Files

- Entry point: `frontend/src/main.jsx`
- App shell + routing: `frontend/src/App.jsx`
- Global styles + CSS variables: `frontend/src/index.css`
- Vite config + proxy: `frontend/vite.config.js`
- Tailwind config: `frontend/tailwind.config.js`
