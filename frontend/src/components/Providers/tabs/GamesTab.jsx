import { useState, useMemo, useCallback } from 'react'
import { useProviderGames } from '../../../hooks/useProviderGames'
import { GameCard } from '../GameCard'
import { Pagination, ExportButton } from '../../shared'

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium Low' },
  { value: '3', label: 'Medium' },
  { value: '4', label: 'Medium High' },
  { value: '5', label: 'High' },
]

const RTP_OPTIONS = [
  { value: '', label: 'All RTP' },
  { value: '95', label: '95%+' },
  { value: '96', label: '96%+' },
  { value: '97', label: '97%+' },
]

const selectClass = `px-3 py-2 bg-surface border border-input-border rounded-lg text-text text-sm
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary`

export function GamesTab({ provider }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [volatilityFilter, setVolatilityFilter] = useState('')
  const [rtpFilter, setRtpFilter] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchTerm(value)
    setPage(1)

    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleFilterChange = useCallback((setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }, [])

  const filters = useMemo(() => ({
    search: debouncedSearch,
    volatility: volatilityFilter,
    rtp_min: rtpFilter,
  }), [debouncedSearch, volatilityFilter, rtpFilter])

  const {
    games,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    isFetching,
  } = useProviderGames(provider?.id, filters, page, { enabled: !!provider?.id })

  const hasActiveFilters = !!debouncedSearch || !!volatilityFilter || !!rtpFilter

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearch('')
    setVolatilityFilter('')
    setRtpFilter('')
    setPage(1)
  }, [])

  const handleExport = () => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (volatilityFilter) params.set('volatility', volatilityFilter)
    if (rtpFilter) params.set('rtp_min', rtpFilter)

    const url = `/api/providers/${provider.id}/games/export/?${params.toString()}`
    window.open(url, '_blank')
  }

  if (!provider) return null

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search games..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-input-border rounded-lg text-sm
                       text-text placeholder-text-muted
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={rtpFilter}
          onChange={handleFilterChange(setRtpFilter)}
          className={selectClass}
        >
          {RTP_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={volatilityFilter}
          onChange={handleFilterChange(setVolatilityFilter)}
          className={selectClass}
        >
          {VOLATILITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-text-muted hover:text-text transition-colors"
          >
            Clear
          </button>
        )}

        {totalCount > 0 && (
          <ExportButton onClick={handleExport} />
        )}
      </div>

      {/* Count */}
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
  )
}
