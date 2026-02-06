import { useState } from 'react'
import { Lightbox } from '../Modals'

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

const VOLATILITY_MAP = {
  '1': { label: 'Low', style: 'bg-success/10 text-success' },
  '2': { label: 'Medium Low', style: 'bg-success/10 text-success' },
  '3': { label: 'Medium', style: 'bg-warning/10 text-warning' },
  '4': { label: 'Medium High', style: 'bg-warning/10 text-warning' },
  '5': { label: 'High', style: 'bg-error/10 text-error' },
}

function getVolatilityInfo(volatility) {
  if (!volatility) return null
  const key = String(volatility)
  return VOLATILITY_MAP[key] || { label: volatility, style: 'bg-text-muted/10 text-text-muted' }
}

// Parse features/themes from text field (comma-separated or JSON array)
function parseList(value) {
  if (!value) return []
  const trimmed = value.trim()
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed)
      return arr.map(String).filter(Boolean)
    } catch {
      // fall through to comma split
    }
  }
  return trimmed.split(',').map(s => s.trim()).filter(Boolean)
}

export function GameCard({ game }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const features = parseList(game.features)
  const themes = parseList(game.themes)
  const hasRtp = game.rtp != null
  const hasVolatility = !!game.volatility
  const hasThemes = themes.length > 0
  const hasFeatures = features.length > 0

  return (
    <>
      <div className="bg-bg border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
        <div className="flex gap-4">
          {/* Clickable thumbnail */}
          <button
            type="button"
            onClick={() => game.thumbnail && setLightboxOpen(true)}
            className={`flex-shrink-0 w-20 h-20 bg-muted-bg rounded-lg flex items-center justify-center overflow-hidden ${
              game.thumbnail ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'
            }`}
          >
            {game.thumbnail ? (
              <img
                src={game.thumbnail}
                alt={game.game_title}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            ) : (
              <GamepadIcon />
            )}
          </button>

          {/* Game info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-text truncate">{game.game_title}</h4>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              {hasRtp && (
                <div>
                  <span className="text-xs text-text-muted">RTP </span>
                  <span className="text-sm font-semibold text-text">{game.rtp}%</span>
                </div>
              )}
              {hasVolatility && (() => {
                const vol = getVolatilityInfo(game.volatility)
                return vol && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-muted">Volatility</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${vol.style}`}>
                      {vol.label}
                    </span>
                  </div>
                )
              })()}
              {hasThemes && (
                <div>
                  <span className="text-xs text-text-muted">Theme </span>
                  <span className="text-sm text-text">{themes[0]}</span>
                  {themes.length > 1 && (
                    <span className="text-xs text-text-muted"> +{themes.length - 1}</span>
                  )}
                </div>
              )}
              {hasFeatures && (
                <span className="text-xs text-text-muted">
                  {features.length} {features.length === 1 ? 'feature' : 'features'}
                </span>
              )}
            </div>

            {/* Feature pills */}
            {hasFeatures && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {features.slice(0, 3).map(f => (
                  <span
                    key={f}
                    className="text-xs px-2 py-0.5 rounded-full border border-success/30 text-success"
                  >
                    {f}
                  </span>
                ))}
                {features.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-border text-text-muted">
                    +{features.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={game.thumbnail}
        title={game.game_title}
      />
    </>
  )
}
