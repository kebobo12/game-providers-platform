---
name: react-component
description: Creating or modifying React components. Use when building UI features, pages, or shared components.
---

# React Component Development

## Component Structure

- Functional components with hooks
- Tailwind for all styling — no inline styles, no custom CSS
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

## State Management

- Server state: React Query (to be set up)
- Local state: `useState` for simple, `useReducer` for complex
- Co-locate hooks with components that use them

## API Calls

Use the client wrapper at `frontend/src/api/client.js` (to be created).

## Styling

- Mobile-first: start with base styles, add breakpoints
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Dark theme: use CSS variables defined in `frontend/src/index.css`

## Export Pattern

- Named exports for reusable components
- Default export for page components

## Testing Breakpoints

Test responsive design at: 375px, 768px, 1280px
