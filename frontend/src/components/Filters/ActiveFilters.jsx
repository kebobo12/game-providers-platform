function XIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const FILTER_LABELS = {
  search: 'Search',
  game_type: 'Game Type',
  currency_mode: 'Currency',
  supported_currency: 'Currency',
  restricted_country: 'Restricted',
  regulated_country: 'Regulated',
}

export function ActiveFilters({ filters, onRemove, onClearAll }) {
  const activeFilters = []

  if (filters.search) {
    activeFilters.push({ key: 'search', value: filters.search, label: FILTER_LABELS.search })
  }

  if (filters.currency_mode) {
    activeFilters.push({ key: 'currency_mode', value: filters.currency_mode, label: FILTER_LABELS.currency_mode })
  }

  filters.game_type.forEach(value => {
    activeFilters.push({ key: 'game_type', value, label: FILTER_LABELS.game_type })
  })

  filters.supported_currency.forEach(value => {
    activeFilters.push({ key: 'supported_currency', value, label: FILTER_LABELS.supported_currency })
  })

  filters.restricted_country.forEach(value => {
    activeFilters.push({ key: 'restricted_country', value, label: FILTER_LABELS.restricted_country })
  })

  filters.regulated_country.forEach(value => {
    activeFilters.push({ key: 'regulated_country', value, label: FILTER_LABELS.regulated_country })
  })

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-muted">Active filters:</span>
      {activeFilters.map(({ key, value, label }) => (
        <span
          key={`${key}-${value}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-sm rounded-full"
        >
          <span className="text-text-muted">{label}:</span>
          <span className="text-primary font-medium truncate max-w-[150px]">{value}</span>
          <button
            type="button"
            onClick={() => onRemove(key, value)}
            className="hover:bg-primary/20 rounded-full p-0.5 text-primary transition-colors"
          >
            <XIcon />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-sm text-text-muted hover:text-error transition-colors"
      >
        Clear all
      </button>
    </div>
  )
}
