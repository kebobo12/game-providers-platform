import { useState, useMemo, useCallback } from 'react'
import { useProviderGames } from '../../../hooks/useProviderGames'
import { GameCard } from '../GameCard'
import { Pagination, ExportButton } from '../../shared'
import { GameListModal } from '../../Modals'

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      </svg>
    </div>
  )
}

const VOLATILITY_OPTIONS = [
  { value: '', label: 'All Volatility' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function GamesTab({ provider }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [volatilityFilter, setVolatilityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Debounce search
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchTerm(value)
    setPage(1)

    // Simple debounce
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleVolatilityChange = useCallback((e) => {
    setVolatilityFilter(e.target.value)
    setPage(1)
  }, [])

  const filters = useMemo(() => ({
    search: debouncedSearch,
    volatility: volatilityFilter,
  }), [debouncedSearch, volatilityFilter])

  const {
    games,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    isFetching,
  } = useProviderGames(provider?.id, filters, page, { enabled: !!provider?.id })

  const handleExport = async () => {
    // Direct download from API
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (volatilityFilter) params.set('volatility', volatilityFilter)

    const url = `/api/providers/${provider.id}/games/export/?${params.toString()}`
    window.open(url, '_blank')
  }

  if (!provider) return null

  return (
    <>
      <div className="space-y-4">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search games..."
              className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg
                         text-text placeholder-text-muted
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={volatilityFilter}
            onChange={handleVolatilityChange}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-text
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {VOLATILITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {totalCount > 0 && (
            <>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                           bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <ExpandIcon />
                View All
              </button>
              <ExportButton onClick={handleExport} />
            </>
          )}
        </div>

        {/* Count and loading indicator */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            {totalCount} {totalCount === 1 ? 'game' : 'games'}
          </span>
          {isFetching && !isLoading && (
            <span className="text-sm text-text-muted">Updating...</span>
          )}
        </div>

        {/* Games list */}
        {isLoading ? (
          <LoadingSpinner />
        ) : games.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p>No games found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            className="pt-4"
          />
        )}
      </div>

      {/* Modal */}
      <GameListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={provider}
      />
    </>
  )
}
