import { useState } from 'react'
import { ExportButton, downloadCSV, arrayToCSV } from '../../shared'

function CoinIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function CurrencyBadge({ code, type }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-full ${
      type === 'fiat'
        ? 'bg-success/10 text-success'
        : 'bg-warning/10 text-warning'
    }`}>
      {code}
    </span>
  )
}

export function CurrenciesTab({ provider }) {
  const [activeSubTab, setActiveSubTab] = useState('fiat')

  if (!provider) return null

  const fiatCurrencies = provider.fiat_currencies ?? []
  const cryptoCurrencies = provider.crypto_currencies ?? []

  const handleExport = () => {
    const rows = [
      ...fiatCurrencies.map(c => ({
        'Currency Code': c.currency_code,
        'Type': 'Fiat',
        'Display': c.display ? 'Yes' : 'No',
        'Source': c.source ?? '',
      })),
      ...cryptoCurrencies.map(c => ({
        'Currency Code': c.currency_code,
        'Type': 'Crypto',
        'Display': c.display ? 'Yes' : 'No',
        'Source': c.source ?? '',
      })),
    ]

    const csv = arrayToCSV(['Currency Code', 'Type', 'Display', 'Source'], rows)
    downloadCSV(csv, `${provider.provider_name}_currencies`)
  }

  const totalCount = fiatCurrencies.length + cryptoCurrencies.length

  return (
    <div className="space-y-4">
      {/* Header with count and export */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">
          {totalCount} {totalCount === 1 ? 'currency' : 'currencies'}
        </span>
        {totalCount > 0 && (
          <ExportButton onClick={handleExport} />
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveSubTab('fiat')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeSubTab === 'fiat'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <span className="flex items-center gap-2">
            <CoinIcon />
            Fiat ({fiatCurrencies.length})
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('crypto')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeSubTab === 'crypto'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <span className="flex items-center gap-2">
            <CoinIcon />
            Crypto ({cryptoCurrencies.length})
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[100px]">
        {activeSubTab === 'fiat' && (
          <div className="space-y-3">
            {fiatCurrencies.length === 0 ? (
              <p className="text-text-muted text-sm py-4 text-center">No fiat currencies</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {fiatCurrencies.map(c => (
                  <CurrencyBadge key={c.currency_code} code={c.currency_code} type="fiat" />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'crypto' && (
          <div className="space-y-3">
            {cryptoCurrencies.length === 0 ? (
              <p className="text-text-muted text-sm py-4 text-center">No cryptocurrencies</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cryptoCurrencies.map(c => (
                  <CurrencyBadge key={c.currency_code} code={c.currency_code} type="crypto" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
