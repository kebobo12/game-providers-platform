import { useState } from 'react'
import { OverviewTab, CurrenciesTab, CountriesTab, GamesTab } from './tabs'

function InfoIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function CurrencyIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function GamepadIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <rect x="2" y="6" width="20" height="12" rx="2" />
    </svg>
  )
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: InfoIcon },
  { id: 'currencies', label: 'Currencies', icon: CurrencyIcon },
  { id: 'countries', label: 'Countries', icon: GlobeIcon },
  { id: 'games', label: 'Games', icon: GamepadIcon },
]

export function ProviderTabs({ provider, isLoading }) {
  const [activeTab, setActiveTab] = useState('overview')
  // Track if games tab has been visited (for lazy loading)
  const [gamesTabVisited, setGamesTabVisited] = useState(false)

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'games' && !gamesTabVisited) {
      setGamesTabVisited(true)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex gap-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-border rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-border rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1 px-4 pt-3 pb-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === id
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text hover:bg-muted-bg'
            }`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'overview' && <OverviewTab provider={provider} />}
        {activeTab === 'currencies' && <CurrenciesTab provider={provider} />}
        {activeTab === 'countries' && <CountriesTab provider={provider} />}
        {/* Games tab only renders content if it's been visited (lazy loading) */}
        {activeTab === 'games' && (
          gamesTabVisited ? (
            <GamesTab provider={provider} />
          ) : null
        )}
      </div>
    </div>
  )
}
