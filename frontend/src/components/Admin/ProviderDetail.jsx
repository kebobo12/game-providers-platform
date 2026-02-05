import { useState, useEffect, useCallback } from 'react'
import { api } from '../../api/client'
import { GamesTable } from './GamesTable'
import { CurrencyManager } from './CurrencyManager'
import { CountryManager } from './CountryManager'

function CloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const TABS = [
  { id: 'games', label: 'Games' },
  { id: 'currencies', label: 'Currencies' },
  { id: 'countries', label: 'Countries' },
]

export function ProviderDetail({ providerId, onClose }) {
  const [provider, setProvider] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('games')

  const fetchProvider = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get(`/admin/providers/${providerId}/`)
      setProvider(data)
    } catch (err) {
      setError(err.message || 'Failed to load provider')
    } finally {
      setIsLoading(false)
    }
  }, [providerId])

  useEffect(() => {
    fetchProvider()
  }, [fetchProvider])

  if (error) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="text-error">{error}</div>
        <button
          onClick={fetchProvider}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading || !provider) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-bg rounded" />
          <div className="h-4 w-32 bg-bg rounded" />
          <div className="h-10 w-full bg-bg rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-text">{provider.provider_name}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              provider.status === 'ACTIVE'
                ? 'bg-status-active/10 text-status-active'
                : 'bg-warning/10 text-warning'
            }`}>
              {provider.status}
            </span>
            <span>{provider.game_count} games</span>
            <span>{provider.currency_mode}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-text-muted hover:text-text rounded transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative
                       ${activeTab === tab.id
                         ? 'text-primary'
                         : 'text-text-muted hover:text-text'
                       }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'games' && (
          <GamesTable providerId={providerId} providerName={provider.provider_name} />
        )}
        {activeTab === 'currencies' && (
          <CurrencyManager
            providerId={providerId}
            providerName={provider.provider_name}
            onUpdate={fetchProvider}
          />
        )}
        {activeTab === 'countries' && (
          <CountryManager
            providerId={providerId}
            providerName={provider.provider_name}
            onUpdate={fetchProvider}
          />
        )}
      </div>
    </div>
  )
}
