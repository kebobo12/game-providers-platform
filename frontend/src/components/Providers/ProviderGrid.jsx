import { useState, useMemo } from 'react'
import { ProviderCard, ExpandedPanel } from './ProviderCard'
import { Pagination, EmptyState, ExportButton, downloadCSV, arrayToCSV } from '../shared'
import { api } from '../../api/client'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const COLS = 2

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
  onClearFilters,
}) {
  const [expandedId, setExpandedId] = useState(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Chunk providers into rows of COLS for desktop rendering
  const rows = useMemo(() => {
    const result = []
    for (let i = 0; i < providers.length; i += COLS) {
      result.push(providers.slice(i, i + COLS))
    }
    return result
  }, [providers])

  const handleExport = async () => {
    // Fetch all providers (not just current page) with active filters
    const params = new URLSearchParams()
    if (filters?.search) params.set('search', filters.search)
    if (filters?.currency_mode) params.set('currency_mode', filters.currency_mode)
    if (filters?.game_type?.length) params.set('game_type', filters.game_type.join(','))
    if (filters?.fiat_currency?.length) params.set('fiat_currency', filters.fiat_currency.join(','))
    if (filters?.crypto_currency?.length) params.set('crypto_currency', filters.crypto_currency.join(','))
    if (filters?.restricted_country?.length) params.set('restricted_country', filters.restricted_country.join(','))
    if (filters?.regulated_country?.length) params.set('regulated_country', filters.regulated_country.join(','))
    params.set('page_size', '10000')

    const data = await api.get(`/providers/?${params.toString()}`)
    const allProviders = data?.results ?? []

    const headers = ['ID', 'Provider Name', 'Status', 'Currency Mode', 'Game Count', 'Game Types']
    const rows = allProviders.map(p => ({
      'ID': p.id,
      'Provider Name': p.provider_name,
      'Status': p.status,
      'Currency Mode': p.currency_mode,
      'Game Count': p.game_count ?? 0,
      'Game Types': (p.supported_game_types ?? []).join(', '),
    }))
    const csv = arrayToCSV(headers, rows)
    downloadCSV(csv, 'providers')
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
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-text">
          Providers
          <span className="text-sm text-text-muted font-normal ml-2">
            ({totalCount} results)
          </span>
        </h3>
        <div className="flex items-center gap-3">
          {isFetching && !isLoading && (
            <span className="text-sm text-text-muted">Updating...</span>
          )}
          {totalCount > 0 && (
            <ExportButton onClick={handleExport} label="Export to Excel" />
          )}
        </div>
      </div>

      {/* Provider cards grid */}
      {providers.length === 0 ? (
        <EmptyState
          message="No providers match your filters"
          actionLabel={onClearFilters ? 'Clear filters' : undefined}
          onAction={onClearFilters}
        />
      ) : isDesktop ? (
        // Desktop: row chunking with panel spanning full width below each row
        <div className="space-y-4">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx}>
              <div className="grid grid-cols-2 gap-4">
                {row.map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isExpanded={expandedId === provider.id}
                    onToggle={() => setExpandedId(prev => prev === provider.id ? null : provider.id)}
                  />
                ))}
              </div>
              {row.map(provider => (
                <ExpandedPanel
                  key={provider.id}
                  provider={provider}
                  isExpanded={expandedId === provider.id}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        // Mobile: flat list with panel directly after each card
        <div className="space-y-4">
          {providers.map(provider => (
            <div key={provider.id}>
              <ProviderCard
                provider={provider}
                isExpanded={expandedId === provider.id}
                onToggle={() => setExpandedId(prev => prev === provider.id ? null : provider.id)}
              />
              <ExpandedPanel
                provider={provider}
                isExpanded={expandedId === provider.id}
              />
            </div>
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
