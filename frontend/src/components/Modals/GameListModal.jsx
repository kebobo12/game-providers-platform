import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useProviderGames } from '../../hooks/useProviderGames'
import { Modal } from './Modal'
import { Pagination, ExportButton, downloadCSV, arrayToCSV } from '../shared'
import { api } from '../../api/client'
import { GameCard } from '../Providers/GameCard'

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
    <div className="flex items-center justify-center py-12">
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

const RTP_RANGES = [
  { value: '', label: 'All RTP' },
  { value: '<90', label: '< 90%', min: null, max: '89.99' },
  { value: '90-94', label: '90% – 94%', min: '90', max: '93.99' },
  { value: '94-96', label: '94% – 96%', min: '94', max: '95.99' },
  { value: '96-98', label: '96% – 98%', min: '96', max: '97.99' },
  { value: '>98', label: '> 98%', min: '98', max: null },
]

function parseThemes(raw) {
  if (!raw) return []
  const trimmed = raw.trim()
  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed).map(String).filter(Boolean)
    } catch { /* fall through */ }
  }
  return trimmed.split(',').map(s => s.trim()).filter(Boolean)
}

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="px-3 py-2 bg-surface border border-input-border rounded-lg text-text text-sm
                 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
    >
      {children}
    </select>
  )
}

function ChevronDownSmall() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SearchableSelect({ value, options, placeholder, onSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const filtered = useMemo(() => {
    if (!search) return options
    const lower = search.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(lower))
  }, [options, search])

  const selectedLabel = value
    ? (options.find(o => o.value === value)?.label ?? value)
    : placeholder

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  const handleSelect = (val) => {
    onSelect(val)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 bg-surface border rounded-lg text-sm cursor-pointer
                   transition-colors ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-input-border'}
                   ${value ? 'text-text' : 'text-text-muted'}`}
      >
        <span className="truncate max-w-[150px]">{selectedLabel}</span>
        <ChevronDownSmall />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 w-64 max-h-80 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 bg-bg border border-input-border rounded text-sm text-text placeholder-text-muted
                         focus:outline-none focus:border-primary"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`w-full px-4 py-2 text-left text-sm cursor-pointer transition-colors
                         ${!value ? 'text-primary font-medium bg-primary/5' : 'text-text hover:bg-muted-bg'}`}
            >
              {placeholder}
            </button>
            {filtered.map(opt => (
              <button
                type="button"
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-4 py-2 text-left text-sm cursor-pointer transition-colors
                           ${value === opt.value ? 'text-primary font-medium bg-primary/5' : 'text-text hover:bg-muted-bg'}`}
              >
                {opt.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-sm text-text-muted text-center">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function GameListModal({ isOpen, onClose, provider }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [volatilityFilter, setVolatilityFilter] = useState('')
  const [rtpRange, setRtpRange] = useState('')
  const [themeFilter, setThemeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [distinctThemes, setDistinctThemes] = useState([])
  const debounceRef = useRef(null)

  // Fetch distinct themes once when modal opens
  useEffect(() => {
    if (!isOpen || !provider?.id) return
    let cancelled = false
    api.get(`/providers/${provider.id}/games/?page_size=10000`).then(data => {
      if (cancelled) return
      const themeSet = new Set()
      for (const game of data.results ?? []) {
        for (const t of parseThemes(game.themes)) themeSet.add(t)
      }
      setDistinctThemes(Array.from(themeSet).sort())
    }).catch(() => {})
    return () => { cancelled = true }
  }, [isOpen, provider?.id])

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchTerm(value)
    setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300)
  }, [])

  const selectedRtp = RTP_RANGES.find(r => r.value === rtpRange)

  const filters = useMemo(() => ({
    search: debouncedSearch,
    volatility: volatilityFilter,
    rtp_min: selectedRtp?.min || '',
    rtp_max: selectedRtp?.max || '',
    theme: themeFilter,
  }), [debouncedSearch, volatilityFilter, selectedRtp, themeFilter])

  const hasActiveFilters = debouncedSearch || volatilityFilter || rtpRange || themeFilter

  const {
    games,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    isFetching,
  } = useProviderGames(provider?.id, filters, page, { enabled: isOpen && !!provider?.id })

  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearch('')
    setVolatilityFilter('')
    setRtpRange('')
    setThemeFilter('')
    setPage(1)
  }, [])

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (volatilityFilter) params.set('volatility', volatilityFilter)
    if (selectedRtp?.min) params.set('rtp_min', selectedRtp.min)
    if (selectedRtp?.max) params.set('rtp_max', selectedRtp.max)
    if (themeFilter) params.set('theme', themeFilter)
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

  const handleClose = () => {
    handleClearFilters()
    setDistinctThemes([])
    onClose()
  }

  const gameCountLabel = provider?.game_count ?? totalCount
  const subtitle = hasActiveFilters
    ? `${totalCount} of ${gameCountLabel} games`
    : `${totalCount} ${totalCount === 1 ? 'game' : 'games'}`

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Games — ${provider?.provider_name}`}
      subtitle={subtitle}
      size="xl"
      footer={
        totalCount > 0 && <ExportButton onClick={handleExport} label="Export CSV" />
      }
    >
      {/* Search */}
      <div className="mb-3">
        <div className="relative">
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
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterSelect
          value={volatilityFilter}
          onChange={(e) => { setVolatilityFilter(e.target.value); setPage(1) }}
        >
          {VOLATILITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={rtpRange}
          onChange={(e) => { setRtpRange(e.target.value); setPage(1) }}
        >
          {RTP_RANGES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </FilterSelect>

        {distinctThemes.length > 0 && (
          <SearchableSelect
            value={themeFilter}
            options={distinctThemes.map(t => ({ value: t, label: t }))}
            placeholder="All Themes"
            onSelect={(val) => { setThemeFilter(val); setPage(1) }}
          />
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-2 text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}
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
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={20}
              onPageChange={setPage}
              className="mt-4"
            />
          )}
        </>
      )}
    </Modal>
  )
}
