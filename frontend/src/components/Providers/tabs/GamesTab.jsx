import { useState, useMemo, useCallback, useSyncExternalStore } from 'react'
import { useProviderGames } from '../../../hooks/useProviderGames'
import { GameCard } from '../GameCard'
import { ExportButton, downloadCSV, arrayToCSV } from '../../shared'
import { api } from '../../../api/client'
import { GameListModal } from '../../Modals'

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

const PREVIEW_LIMIT_DESKTOP = 8
const PREVIEW_LIMIT_MOBILE = 4

const mdQuery = typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)') : null

function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => { mdQuery?.addEventListener('change', cb); return () => mdQuery?.removeEventListener('change', cb) },
    () => mdQuery?.matches ?? true,
    () => true,
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
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchTerm(value)

    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleVolatilityChange = useCallback((e) => {
    setVolatilityFilter(e.target.value)
  }, [])

  const filters = useMemo(() => ({
    search: debouncedSearch,
    volatility: volatilityFilter,
  }), [debouncedSearch, volatilityFilter])

  const isDesktop = useIsDesktop()
  const previewLimit = isDesktop ? PREVIEW_LIMIT_DESKTOP : PREVIEW_LIMIT_MOBILE

  const {
    games,
    totalCount,
    isLoading,
    isFetching,
  } = useProviderGames(provider?.id, filters, 1, { enabled: !!provider?.id })

  const previewGames = games.slice(0, previewLimit)
  const hasMore = totalCount > previewLimit

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (volatilityFilter) params.set('volatility', volatilityFilter)
    params.set('page_size', '10000')

    const data = await api.get(`/providers/${provider.id}/games/?${params.toString()}`)
    const allGames = data.results ?? []

    const headers = ['Title', 'Type', 'Platform', 'RTP', 'Volatility', 'Enabled']
    const rows = allGames.map(g => ({
      'Title': g.game_title,
      'Type': g.game_type,
      'Platform': g.platform,
      'RTP': g.rtp,
      'Volatility': g.volatility,
      'Enabled': g.enabled,
    }))
    const csv = arrayToCSV(headers, rows)
    downloadCSV(csv, `${provider.provider_name}_games`)
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
              className="w-full pl-10 pr-4 py-2 bg-surface border border-input-border rounded-lg text-sm
                         text-text placeholder-text-muted
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={volatilityFilter}
            onChange={handleVolatilityChange}
            className="px-3 py-2 bg-surface border border-input-border rounded-lg text-text text-sm
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {VOLATILITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

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

        {/* Games preview grid — max 8 */}
        {isLoading ? (
          <LoadingSpinner />
        ) : previewGames.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p>No games found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {previewGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}

        {/* View All link */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2.5 text-sm font-medium text-primary hover:text-primary-hover
                       hover:bg-primary/5 rounded-lg transition-colors"
          >
            View All ({totalCount} games)
          </button>
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
