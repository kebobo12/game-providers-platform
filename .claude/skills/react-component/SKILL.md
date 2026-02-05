---
name: react-component
description: Creating or modifying React components. Use when building UI features, pages, or shared components.
---

# React Component Development

## Component Structure

- Functional components with hooks
- Tailwind for all styling — no inline styles, no custom CSS (except CSS variables in `index.css`)
- One component per file

## File Structure

Simple component: `ComponentName.jsx`
Complex component with sub-components:
```
ComponentName/
  index.jsx
  SubComponent.jsx
  useComponentHook.js
```

## Component Directory

```
frontend/src/components/
├── Admin/          # ProvidersTable, GamesTable, SyncCard, ImportCard, DbStatsCard,
│                   # FormModal, ConfirmDialog, LogoPreview, ProviderDetail, CurrencyManager, CountryManager
├── Auth/           # LoginPage
├── Filters/        # SearchInput, FilterDropdown, ActiveFilters, FilterPanel
├── Layout/         # Header, Footer, Layout, ThemeToggle
├── Modals/         # Modal (base), GameListModal, CurrencyModal, CountryModal, Lightbox
├── Providers/      # ProviderCard, ProviderGrid, ProviderTabs, GameCard
│   └── tabs/       # OverviewTab, GamesTab, CurrenciesTab, CountriesTab
├── Stats/          # StatsCards
└── shared/         # ExportButton, Pagination
```

## State Management

- Server state: TanStack React Query v5 (`@tanstack/react-query`)
- Local state: `useState` for simple, `useReducer` for complex
- Auth state: Context API (`useAuth` hook with `AuthProvider`)
- Filter state: Custom hook with URL param sync (`useFilters`)
- Theme state: Custom hook with localStorage (`useTheme`)

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `hooks/useAuth.jsx` | Auth state, login/logout, superuser check |
| `useTheme` | `hooks/useTheme.js` | Dark/light theme toggle, `isDark` flag |
| `useFilters` | `hooks/useFilters.js` | Filter state with URL param sync |
| `useFilterOptions` | `hooks/useFilterOptions.js` | Fetch filter dropdown options from API |
| `useProviders` | `hooks/useProviders.js` | Fetch paginated providers with filters |
| `useProviderDetail` | `hooks/useProviderDetail.js` | Fetch single provider with nested data |
| `useProviderGames` | `hooks/useProviderGames.js` | Fetch games for a provider |
| `useStats` | `hooks/useStats.js` | Fetch dashboard statistics |

## API Calls

Use the client wrapper at `frontend/src/api/client.js`:

```javascript
import { api } from '../api/client'

// Methods: api.get(), api.post(), api.put(), api.delete()
// Auth: api.auth.login(), api.auth.logout(), api.auth.me(), api.auth.getCsrf()
```

CSRF tokens are handled automatically. Session-based auth via cookies.

## Patterns

### Modal Pattern

Base modal in `components/Modals/Modal.jsx`. Specific modals extend it:

```jsx
// FormModal for admin CRUD forms
<FormModal isOpen={} onClose={} onSubmit={} title="" size="lg">
  <FormField label="" required><TextInput ... /></FormField>
</FormModal>

// ConfirmDialog for destructive actions
<ConfirmDialog isOpen={} onConfirm={} title="" message="" variant="danger" />
```

### Admin CRUD Table Pattern

See `ProvidersTable.jsx` and `GamesTable.jsx`:
- State: list data, search, loading, error, form modal, delete dialog
- Fetch with `api.get()`, debounced search
- Create/Edit via `FormModal`
- Delete via `ConfirmDialog`
- Inline actions: edit, delete buttons per row

### Theme-Aware Components

Use CSS variables from `index.css`, not hardcoded colors:

```jsx
// Good: uses theme variables via Tailwind
className="bg-surface text-text border-border"

// For theme-dependent logic:
const { isDark } = useTheme()
const logoUrl = isDark ? provider.logo_url_dark : provider.logo_url_light
```

### Export Button Pattern

See `shared/ExportButton.jsx`:

```jsx
<ExportButton endpoint="/api/providers/export/" filename="providers.csv" />
```

### Filter State Pattern

```jsx
const { filters, updateFilter, clearFilters } = useFilters()
// filters: { search, game_type[], currency_mode, supported_currency[], ... }
// URL params stay in sync automatically
```

## Styling

- Mobile-first: start with base styles, add breakpoints
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Dark theme: use CSS variables defined in `frontend/src/index.css`
- Custom utilities: `.bg-checkerboard` for transparent image backgrounds

## Export Pattern

- Named exports for reusable components
- Default export for page components
- Barrel exports via `index.js` in component directories

## Testing Breakpoints

Test responsive design at: 375px, 768px, 1280px
