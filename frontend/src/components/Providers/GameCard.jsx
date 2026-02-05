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

export function GameCard({ game }) {
  return (
    <div className="bg-bg border border-border rounded-lg p-4 hover:border-primary transition-colors">
      <div className="flex gap-4">
        {/* Thumbnail or placeholder */}
        <div className="flex-shrink-0 w-16 h-16 bg-surface rounded-lg flex items-center justify-center overflow-hidden">
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
        </div>

        {/* Game info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text truncate">{game.game_title}</h4>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {game.game_type && (
              <span className={`text-xs px-2 py-0.5 rounded ${getGameTypePillClass(game.game_type)}`}>
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
