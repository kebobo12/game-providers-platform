function InfoIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

export function OverviewTab({ provider }) {
  if (!provider) return null

  const currencyModeLabel = {
    'ALL_FIAT': 'All Fiat Currencies',
    'LIST': 'Selected Currencies',
    'ALL_CRYPTO': 'All Cryptocurrencies',
  }

  return (
    <div className="space-y-4">
      {/* Provider Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-bg rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <InfoIcon />
            <span className="text-sm font-medium">Provider Name</span>
          </div>
          <p className="text-lg font-semibold text-text">{provider.provider_name}</p>
        </div>

        <div className="bg-bg rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <InfoIcon />
            <span className="text-sm font-medium">Currency Mode</span>
          </div>
          <p className="text-lg font-semibold text-text">
            {currencyModeLabel[provider.currency_mode] || provider.currency_mode}
          </p>
        </div>

        <div className="bg-bg rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <InfoIcon />
            <span className="text-sm font-medium">Total Games</span>
          </div>
          <p className="text-lg font-semibold text-text">{provider.game_count ?? 0}</p>
        </div>

        <div className="bg-bg rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <InfoIcon />
            <span className="text-sm font-medium">Status</span>
          </div>
          <span className={`inline-block px-2 py-1 text-sm rounded-full ${
            provider.status === 'ACTIVE'
              ? 'bg-success/10 text-success'
              : 'bg-text-muted/10 text-text-muted'
          }`}>
            {provider.status}
          </span>
        </div>
      </div>

      {/* Supported Game Types */}
      {provider.supported_game_types?.length > 0 && (
        <div className="bg-bg rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-text-muted mb-3">
            <InfoIcon />
            <span className="text-sm font-medium">Supported Game Types</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {provider.supported_game_types.map(type => (
              <span
                key={type}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {provider.notes && (
        <div className="bg-bg rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <InfoIcon />
            <span className="text-sm font-medium">Notes</span>
          </div>
          <p className="text-text whitespace-pre-wrap">{provider.notes}</p>
        </div>
      )}
    </div>
  )
}
