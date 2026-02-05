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

// Map game type to color-coded pill class
function getGameTypePillClass(type) {
  const t = type.toLowerCase()
  if (t.includes('slot')) return 'bg-pill-slots/15 text-pill-slots'
  if (t.includes('crash')) return 'bg-pill-crash/15 text-pill-crash'
  if (t.includes('table')) return 'bg-pill-table/15 text-pill-table'
  if (t.includes('live')) return 'bg-pill-live/15 text-pill-live'
  if (t.includes('bingo')) return 'bg-pill-bingo/15 text-pill-bingo'
  if (t.includes('lottery') || t.includes('keno')) return 'bg-pill-lottery/15 text-pill-lottery'
  if (t.includes('poker')) return 'bg-pill-poker/15 text-pill-poker'
  return 'bg-pill-default/15 text-pill-default'
}

// Map currency mode to color-coded badge class
function getCurrencyModeClass(mode) {
  switch (mode) {
    case 'ALL_FIAT': return 'bg-currency-fiat/15 text-currency-fiat border-currency-fiat/30'
    case 'ALL_CRYPTO': return 'bg-currency-crypto/15 text-currency-crypto border-currency-crypto/30'
    case 'BOTH': return 'bg-currency-both/15 text-currency-both border-currency-both/30'
    case 'LIST': return 'bg-currency-custom/15 text-currency-custom border-currency-custom/30'
    default: return 'bg-text-muted/10 text-text-muted border-border'
  }
}

const currencyModeLabels = {
  'ALL_FIAT': 'All Fiat',
  'LIST': 'Custom List',
  'ALL_CRYPTO': 'All Crypto',
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
      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
        <img
          src={logoUrl}
          alt={provider.provider_name}
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  return (
    <div className={`flex-shrink-0 w-12 h-12 rounded-lg border border-border flex items-center justify-center font-bold text-lg ${colorClass}`}>
      {initials}
    </div>
  )
}

export function ProviderCard({ provider }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasExpanded, setHasExpanded] = useState(false)
  const [isGamesModalOpen, setIsGamesModalOpen] = useState(false)

  // Only fetch detail when expanded (and not already cached)
  const { provider: providerDetail, isLoading } = useProviderDetail(
    provider.id,
    { enabled: isExpanded }
  )

  const handleToggle = () => {
    const next = !isExpanded
    if (next) setHasExpanded(true)
    setIsExpanded(next)
  }

  const handleGameCountClick = (e) => {
    e.stopPropagation()
    setIsGamesModalOpen(true)
  }

  const gameCount = provider.game_count ?? 0

  return (
    <>
      <div className={`bg-surface border rounded-lg overflow-hidden transition-all duration-200 ${
        isExpanded
          ? 'border-primary col-span-full shadow-lg'
          : 'border-border hover:border-primary/50 hover:-translate-y-px hover:shadow-md'
      }`}>
        {/* Collapsed header - always visible */}
        <button
          type="button"
          onClick={handleToggle}
          className="w-full text-left p-4 flex items-center gap-4 cursor-pointer hover:bg-bg/50 transition-colors"
        >
          {/* Provider logo/initials */}
          <ProviderLogo provider={provider} />

          {/* Provider info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-lg text-text truncate">{provider.provider_name}</h4>
              <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${
                provider.status === 'ACTIVE'
                  ? 'bg-status-active/10 text-status-active'
                  : 'bg-status-inactive/10 text-status-inactive'
              }`}>
                {provider.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {/* Clickable game count */}
              <span
                role="button"
                tabIndex={0}
                onClick={handleGameCountClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleGameCountClick(e)
                  }
                }}
                className="text-sm text-primary hover:text-primary-hover hover:underline cursor-pointer transition-colors"
              >
                {gameCount} games
              </span>
              {provider.supported_game_types?.length > 0 && (
                <div className="hidden sm:flex flex-wrap gap-1">
                  {provider.supported_game_types.slice(0, 3).map(type => (
                    <span
                      key={type}
                      className={`text-xs px-2 py-0.5 rounded ${getGameTypePillClass(type)}`}
                    >
                      {type}
                    </span>
                  ))}
                  {provider.supported_game_types.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-pill-default/10 text-pill-default rounded">
                      +{provider.supported_game_types.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Currency mode badge */}
          <div className="hidden md:flex items-center gap-3">
            {provider.currency_mode && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getCurrencyModeClass(provider.currency_mode)}`}>
                {currencyModeLabels[provider.currency_mode] || provider.currency_mode}
              </span>
            )}
          </div>

          {/* Expand/collapse icon */}
          <div className="flex-shrink-0 text-text-muted transition-transform duration-200">
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </button>

        {/* Expanded content with smooth open/close animation */}
        <div className={`expand-grid ${isExpanded ? 'expanded' : ''}`}>
          <div>
            {hasExpanded && (
              <div className="border-t border-border">
                <ProviderTabs
                  provider={providerDetail || provider}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
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
