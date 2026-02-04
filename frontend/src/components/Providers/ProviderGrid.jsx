import { ProviderCard } from './ProviderCard'
import { Pagination, ExportButton } from '../shared'

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-border rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-border rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-border rounded w-1/3 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProviderGrid({
  providers,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  isFetching,
  filters,
}) {
  const handleExport = () => {
    // Build query params from filters
    const params = new URLSearchParams()
    if (filters?.search) params.set('search', filters.search)
    if (filters?.currency_mode) params.set('currency_mode', filters.currency_mode)
    filters?.game_type?.forEach(v => params.append('game_type', v))
    filters?.supported_currency?.forEach(v => params.append('supported_currency', v))
    filters?.restricted_country?.forEach(v => params.append('restricted_country', v))
    filters?.regulated_country?.forEach(v => params.append('regulated_country', v))

    const queryString = params.toString()
    const url = queryString ? `/api/providers/export/?${queryString}` : '/api/providers/export/'
    window.open(url, '_blank')
  }

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-border rounded w-40 animate-pulse" />
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-text">
          Providers
          <span className="text-text-muted font-normal ml-2">
            ({totalCount} results)
          </span>
        </h3>
        <div className="flex items-center gap-3">
          {isFetching && !isLoading && (
            <span className="text-sm text-text-muted">Updating...</span>
          )}
          {totalCount > 0 && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
                         bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <DownloadIcon />
              Export to Excel
            </button>
          )}
        </div>
      </div>

      {/* Provider cards grid */}
      {providers.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <p>No providers found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {providers.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={24}
        onPageChange={onPageChange}
        className="mt-6"
      />
    </div>
  )
}
