import { useState } from 'react'
import { CurrenciesTab, CountriesTab, GamesTab } from './tabs'

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

function FolderIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

const TABS = [
  { id: 'currencies', label: 'Currencies', icon: CurrencyIcon },
  { id: 'countries', label: 'Countries', icon: GlobeIcon },
  { id: 'games', label: 'Games', icon: GamepadIcon },
  { id: 'assets', label: 'Assets', icon: FolderIcon },
]

export function ProviderTabs({ provider, isLoading }) {
  const [activeTab, setActiveTab] = useState('currencies')
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
            <div key={i} className="h-8 flex-1 bg-border rounded-lg animate-pulse" />
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
      <div className="flex px-4 pt-3 pb-2 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium rounded-full border transition-colors ${
              activeTab === id
                ? 'bg-primary text-white border-primary'
                : 'text-text-muted border-border hover:text-text hover:bg-muted-bg'
            }`}
          >
            <Icon />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'currencies' && <CurrenciesTab provider={provider} />}
        {activeTab === 'countries' && <CountriesTab provider={provider} />}
        {activeTab === 'games' && (
          gamesTabVisited ? (
            <GamesTab provider={provider} />
          ) : null
        )}
        {activeTab === 'assets' && (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <svg className="w-10 h-10 mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm font-medium">Assets</p>
            <p className="text-xs mt-1">Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
