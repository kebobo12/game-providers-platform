import { useState } from 'react'
import { useProviderDetail } from '../../hooks/useProviderDetail'
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

// Generate consistent color from string
function getColorFromString(str) {
  const colors = [
    'bg-primary/20 text-primary',
    'bg-success/20 text-success',
    'bg-warning/20 text-warning',
    'bg-error/20 text-error',
    'bg-blue-500/20 text-blue-500',
    'bg-purple-500/20 text-purple-500',
    'bg-pink-500/20 text-pink-500',
    'bg-teal-500/20 text-teal-500',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const currencyModeLabels = {
  'ALL_FIAT': 'All Fiat',
  'LIST': 'Custom List',
  'ALL_CRYPTO': 'All Crypto',
}

export function ProviderCard({ provider }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGamesModalOpen, setIsGamesModalOpen] = useState(false)

  // Only fetch detail when expanded (and not already cached)
  const { provider: providerDetail, isLoading } = useProviderDetail(
    provider.id,
    { enabled: isExpanded }
  )

  const initials = getInitials(provider.provider_name)
  const colorClass = getColorFromString(provider.provider_name)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleGameCountClick = (e) => {
    e.stopPropagation()
    setIsGamesModalOpen(true)
  }

  const gameCount = provider.game_count ?? 0

  return (
    <>
      <div className={`bg-surface border rounded-lg overflow-hidden transition-all ${
        isExpanded ? 'border-primary col-span-full' : 'border-border hover:border-primary'
      }`}>
        {/* Collapsed header - always visible */}
        <button
          type="button"
          onClick={handleToggle}
          className="w-full text-left p-4 flex items-center gap-4 cursor-pointer hover:bg-bg/50 transition-colors"
        >
          {/* Provider logo/initials */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${colorClass}`}>
            {initials}
          </div>

          {/* Provider info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-text truncate">{provider.provider_name}</h4>
              <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full ${
                provider.status === 'ACTIVE'
                  ? 'bg-success/10 text-success'
                  : 'bg-text-muted/10 text-text-muted'
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
                      className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded"
                    >
                      {type}
                    </span>
                  ))}
                  {provider.supported_game_types.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-text-muted/10 text-text-muted rounded">
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
              <span className="text-xs px-2.5 py-1 bg-surface border border-border rounded-full text-text-muted">
                {currencyModeLabels[provider.currency_mode] || provider.currency_mode}
              </span>
            )}
          </div>

          {/* Expand/collapse icon */}
          <div className="flex-shrink-0 text-text-muted">
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-border">
            <ProviderTabs
              provider={providerDetail || provider}
              isLoading={isLoading}
            />
          </div>
        )}
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
