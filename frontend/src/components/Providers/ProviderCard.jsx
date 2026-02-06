import { useState, useEffect } from 'react'
import { useProviderDetail } from '../../hooks/useProviderDetail'
import { useTheme } from '../../hooks/useTheme'
import { ProviderTabs } from './ProviderTabs'
import { GameListModal } from '../Modals'

function ChevronDown() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ChevronUp() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

// Get initials from provider name for placeholder
function getInitials(name) {
  if (!name) return '??'
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Generate consistent color from string — uses CSS variable pill colors
function getColorFromString(str) {
  const colors = [
    'bg-pill-slots/20 text-pill-slots',
    'bg-pill-table/20 text-pill-table',
    'bg-pill-bingo/20 text-pill-bingo',
    'bg-pill-crash/20 text-pill-crash',
    'bg-pill-live/20 text-pill-live',
    'bg-pill-lottery/20 text-pill-lottery',
    'bg-pill-poker/20 text-pill-poker',
    'bg-currency-fiat/20 text-currency-fiat',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// Human-readable game type labels
const GAME_TYPE_LABELS = {
  'cards': 'Cards',
  'crashgame': 'Crash Games',
  'crash': 'Crash Games',
  'dice': 'Dice',
  'instantgame': 'Instant Games',
  'interactivegame': 'Interactive Games',
  'slots': 'Slots',
  'virtual': 'Virtual',
  'bingo': 'Bingo',
  'poker': 'Poker',
  'tablegame': 'Table Games',
  'table': 'Table Games',
  'livecasino': 'Live Casino',
  'live': 'Live Casino',
  'lottery': 'Lottery',
  'keno': 'Keno',
}

function formatGameType(type) {
  const lower = type.toLowerCase()
  if (GAME_TYPE_LABELS[lower]) return GAME_TYPE_LABELS[lower]
  // Fallback: insert space before uppercase letters, capitalize first
  return type
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase())
}

function getProviderLogoUrl(provider, isDark) {
  const dark = provider.logo_url_dark
  const light = provider.logo_url_light
  if (isDark) return dark || light || null
  return light || dark || null
}

function ProviderLogo({ provider }) {
  const [imgFailed, setImgFailed] = useState(false)
  const { isDark } = useTheme()
  const initials = getInitials(provider.provider_name)
  const colorClass = getColorFromString(provider.provider_name)
  const logoUrl = getProviderLogoUrl(provider, isDark)

  // Reset error state when URL changes (e.g., theme toggle)
  useEffect(() => {
    setImgFailed(false)
  }, [logoUrl])

  if (logoUrl && !imgFailed) {
    return (
      <div className="flex-shrink-0 w-[70px] sm:w-[170px] flex items-center justify-center">
        <img
          src={logoUrl}
          alt={provider.provider_name}
          className="max-w-[60px] sm:max-w-[155px] max-h-[40px] sm:max-h-[60px] object-contain"
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  return (
    <div className={`flex-shrink-0 w-[70px] sm:w-[170px] flex items-center justify-center`}>
      <div className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-muted-bg font-bold text-lg sm:text-2xl ${colorClass}`}>
        {initials}
      </div>
    </div>
  )
}

const PILL_LIMIT = 4

export function ProviderCard({ provider, isExpanded, onToggle }) {
  const [isGamesModalOpen, setIsGamesModalOpen] = useState(false)

  const handleGameCountClick = (e) => {
    e.stopPropagation()
    setIsGamesModalOpen(true)
  }

  const gameCount = provider.game_count ?? 0
  const gameTypes = provider.supported_game_types ?? []

  return (
    <>
      <div className={`bg-surface border rounded-xl overflow-hidden transition-all duration-200 ease-out cursor-pointer ${
        isExpanded
          ? 'border-primary ring-1 ring-primary'
          : 'border-border hover:border-primary/60 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg'
      }`}>
        {/* Collapsed header - always visible */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full text-left p-4 flex items-center gap-4 cursor-pointer"
        >
          {/* Provider logo */}
          <ProviderLogo provider={provider} />

          {/* Provider info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base sm:text-lg text-text line-clamp-2">{provider.provider_name}</h4>

            {/* Game count */}
            <div className="mt-1">
              <span
                role="button"
                tabIndex={0}
                onClick={handleGameCountClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleGameCountClick(e)
                  }
                }}
                className="text-sm font-medium text-primary hover:text-primary-hover hover:underline cursor-pointer transition-colors"
              >
                {gameCount} games
              </span>
            </div>

            {/* Game type pills */}
            {gameTypes.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1.5 mt-2">
                {gameTypes.slice(0, PILL_LIMIT).map(type => (
                  <span
                    key={type}
                    className="text-xs px-2.5 py-0.5 rounded-full border border-border text-text-muted"
                  >
                    {formatGameType(type)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Expand/collapse */}
          <div className="flex-shrink-0 flex items-center gap-1.5 text-text-muted transition-transform duration-200">
            {isExpanded ? (
              <>
                <span className="text-sm font-medium text-primary">Close</span>
                <ChevronUp />
              </>
            ) : (
              <ChevronDown />
            )}
          </div>
        </button>
      </div>

      {/* Games Modal */}
      <GameListModal
        isOpen={isGamesModalOpen}
        onClose={() => setIsGamesModalOpen(false)}
        provider={provider}
      />
    </>
  )
}

export function ExpandedPanel({ provider, isExpanded }) {
  const [hasExpanded, setHasExpanded] = useState(false)

  // Track if ever expanded (for lazy rendering during collapse animation)
  useEffect(() => {
    if (isExpanded) setHasExpanded(true)
  }, [isExpanded])

  // Only fetch detail when expanded
  const { provider: providerDetail, isLoading } = useProviderDetail(
    provider.id,
    { enabled: isExpanded }
  )

  return (
    <div className={`expand-grid ${isExpanded ? 'expanded' : ''}`}>
      <div>
        {hasExpanded && (
          <div className="pt-4">
            <div className="bg-surface border border-primary rounded-xl overflow-hidden">
              <ProviderTabs
                provider={providerDetail || provider}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
