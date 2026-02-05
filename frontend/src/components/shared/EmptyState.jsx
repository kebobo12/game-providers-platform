function SearchOffIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="8" x2="14" y2="14" />
      <line x1="14" y1="8" x2="8" y2="14" />
    </svg>
  )
}

export function EmptyState({ message = 'No results found', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <SearchOffIcon />
      <p className="mt-4 text-lg font-medium">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
