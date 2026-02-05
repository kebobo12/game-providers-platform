import { useState, useMemo } from 'react'
import { Modal } from './Modal'
import { ExportButton, downloadCSV, arrayToCSV } from '../shared'

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${
      type === 'fiat'
        ? 'bg-success/10 text-success'
        : 'bg-warning/10 text-warning'
    }`}>
      {code}
    </span>
  )
}

export function CurrencyModal({ isOpen, onClose, provider }) {
  const [activeTab, setActiveTab] = useState('fiat')
  const [searchTerm, setSearchTerm] = useState('')

  const fiatCurrencies = provider?.fiat_currencies ?? []
  const cryptoCurrencies = provider?.crypto_currencies ?? []

  // Filter currencies by search term
  const filteredFiat = useMemo(() => {
    if (!searchTerm) return fiatCurrencies
    const term = searchTerm.toLowerCase()
    return fiatCurrencies.filter(c => c.currency_code.toLowerCase().includes(term))
  }, [fiatCurrencies, searchTerm])

  const filteredCrypto = useMemo(() => {
    if (!searchTerm) return cryptoCurrencies
    const term = searchTerm.toLowerCase()
    return cryptoCurrencies.filter(c => c.currency_code.toLowerCase().includes(term))
  }, [cryptoCurrencies, searchTerm])

  const handleExport = () => {
    const rows = [
      ...fiatCurrencies.map(c => ({
        'Currency Code': c.currency_code,
        'Type': 'Fiat',
      })),
      ...cryptoCurrencies.map(c => ({
        'Currency Code': c.currency_code,
        'Type': 'Crypto',
      })),
    ]

    const csv = arrayToCSV(['Currency Code', 'Type'], rows)
    downloadCSV(csv, `${provider?.provider_name}_currencies`)
  }

  const totalCount = fiatCurrencies.length + cryptoCurrencies.length

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Currencies — ${provider?.provider_name}`}
      subtitle={`${totalCount} ${totalCount === 1 ? 'currency' : 'currencies'}`}
      size="lg"
      footer={
        totalCount > 0 && <ExportButton onClick={handleExport} label="Export CSV" />
      }
    >
      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search currencies..."
          className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg
                     text-text placeholder-text-muted
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('fiat')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'fiat'
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
          type="button"
          onClick={() => setActiveTab('crypto')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'crypto'
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
      <div className="min-h-[200px]">
        {activeTab === 'fiat' && (
          <div>
            {filteredFiat.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">
                {searchTerm ? 'No fiat currencies match your search' : 'No fiat currencies'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredFiat.map(c => (
                  <CurrencyBadge key={c.currency_code} code={c.currency_code} type="fiat" />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'crypto' && (
          <div>
            {filteredCrypto.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">
                {searchTerm ? 'No cryptocurrencies match your search' : 'No cryptocurrencies'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredCrypto.map(c => (
                  <CurrencyBadge key={c.currency_code} code={c.currency_code} type="crypto" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
