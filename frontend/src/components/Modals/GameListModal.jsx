import { useState, useMemo, useCallback } from 'react'
import { useProviderGames } from '../../hooks/useProviderGames'
import { Modal } from './Modal'
import { Pagination, ExportButton, downloadCSV, arrayToCSV } from '../shared'
import { api } from '../../api/client'
import { Lightbox } from './Lightbox'

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function GamepadIcon() {
  return (
    <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="17" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function getVolatilityColor(volatility) {
  switch (volatility?.toLowerCase()) {
    case 'low':
      return 'bg-success/10 text-success'
    case 'medium':
    case 'med':
      return 'bg-warning/10 text-warning'
    case 'high':
      return 'bg-error/10 text-error'
    default:
      return 'bg-text-muted/10 text-text-muted'
  }
}

const VOLATILITY_OPTIONS = [
  { value: '', label: 'All Volatility' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function ModalGameCard({ game, onThumbnailClick }) {
  return (
    <div className="bg-bg border border-border rounded-lg p-4 hover:border-primary transition-colors">
      <div className="flex gap-4">
        {/* Thumbnail or placeholder - clickable */}
        <button
          type="button"
          onClick={() => game.thumbnail && onThumbnailClick(game)}
          className={`flex-shrink-0 w-16 h-16 bg-surface rounded-lg flex items-center justify-center overflow-hidden ${
            game.thumbnail ? 'cursor-pointer hover:ring-2 hover:ring-primary' : ''
          }`}
          disabled={!game.thumbnail}
        >
          {game.thumbnail ? (
            <img
              src={game.thumbnail}
              alt={game.game_title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <GamepadIcon />
          )}
        </button>

        {/* Game info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text truncate">{game.game_title}</h4>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {game.game_type && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                {game.game_type}
              </span>
            )}
            {game.rtp && (
              <span className="text-xs text-text-muted">
                RTP: {game.rtp}%
              </span>
            )}
            {game.volatility && (
              <span className={`text-xs px-2 py-0.5 rounded ${getVolatilityColor(game.volatility)}`}>
                {game.volatility}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function GameListModal({ isOpen, onClose, provider }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [volatilityFilter, setVolatilityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [lightboxGame, setLightboxGame] = useState(null)

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
  } = useProviderGames(provider?.id, filters, page, { enabled: isOpen && !!provider?.id })

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

  const handleThumbnailClick = (game) => {
    setLightboxGame(game)
  }

  const handleCloseLightbox = () => {
    setLightboxGame(null)
  }

  // Reset state when modal closes
  const handleClose = () => {
    setSearchTerm('')
    setDebouncedSearch('')
    setVolatilityFilter('')
    setPage(1)
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`Games — ${provider?.provider_name}`}
        subtitle={`${totalCount} ${totalCount === 1 ? 'game' : 'games'}`}
        size="xl"
        footer={
          totalCount > 0 && <ExportButton onClick={handleExport} label="Export CSV" />
        }
      >
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search games..."
              className="w-full pl-10 pr-4 py-2 bg-surface border border-input-border rounded-lg
                         text-text placeholder-text-muted
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={volatilityFilter}
            onChange={handleVolatilityChange}
            className="px-3 py-2 bg-surface border border-input-border rounded-lg text-text
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {VOLATILITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Loading indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center justify-end mb-2">
            <span className="text-sm text-text-muted">Updating...</span>
          </div>
        )}

        {/* Games list */}
        {isLoading ? (
          <LoadingSpinner />
        ) : games.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>No games found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {games.map(game => (
                <ModalGameCard
                  key={game.id}
                  game={game}
                  onThumbnailClick={handleThumbnailClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={24}
                onPageChange={setPage}
                className="mt-4"
              />
            )}
          </>
        )}
      </Modal>

      {/* Lightbox for thumbnails */}
      <Lightbox
        isOpen={!!lightboxGame}
        onClose={handleCloseLightbox}
        imageSrc={lightboxGame?.thumbnail}
        title={lightboxGame?.game_title}
      />
    </>
  )
}
