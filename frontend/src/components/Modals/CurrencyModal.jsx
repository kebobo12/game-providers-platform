import { useState, useEffect, useMemo } from 'react'
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

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', KRW: '₩', INR: '₹',
  CAD: 'C$', AUD: 'A$', CHF: 'CHF', BRL: 'R$', MXN: 'Mex$', SEK: 'kr',
  TRY: '₺', THB: '฿', RUB: '₽', ILS: '₪', PHP: '₱', VND: '₫',
  BTC: '₿', ETH: 'Ξ', USDT: '₮', LTC: 'Ł', ADA: '₳',
}

const CURRENCY_NAMES = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan', KRW: 'South Korean Won', INR: 'Indian Rupee',
  BRL: 'Brazilian Real', MXN: 'Mexican Peso', SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone', DKK: 'Danish Krone', PLN: 'Polish Zloty',
  CZK: 'Czech Koruna', HUF: 'Hungarian Forint', TRY: 'Turkish Lira',
  ZAR: 'South African Rand', SGD: 'Singapore Dollar', HKD: 'Hong Kong Dollar',
  NZD: 'New Zealand Dollar', THB: 'Thai Baht', RUB: 'Russian Ruble',
  ILS: 'Israeli Shekel', PHP: 'Philippine Peso', IDR: 'Indonesian Rupiah',
  MYR: 'Malaysian Ringgit', VND: 'Vietnamese Dong', TWD: 'Taiwan Dollar',
  RON: 'Romanian Leu', BGN: 'Bulgarian Lev', HRK: 'Croatian Kuna',
  BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Tether', USDC: 'USD Coin',
  LTC: 'Litecoin', XRP: 'Ripple', DOGE: 'Dogecoin', BNB: 'BNB',
  SOL: 'Solana', ADA: 'Cardano', DOT: 'Polkadot', TRX: 'TRON',
  MATIC: 'Polygon', AVAX: 'Avalanche', LINK: 'Chainlink',
  SHIB: 'Shiba Inu', UNI: 'Uniswap', ATOM: 'Cosmos', XLM: 'Stellar',
  ALGO: 'Algorand', NEAR: 'NEAR Protocol',
}

function FiatIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function CryptoIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function CurrencyBadge({ code, type }) {
  const symbol = CURRENCY_SYMBOLS[code]
  const name = CURRENCY_NAMES[code]
  return (
    <span
      className={`flex items-center justify-center gap-1 py-2 text-sm font-medium ${
        type === 'fiat' ? 'color-fiat' : 'color-crypto'
      }`}
      title={name || undefined}
    >
      {symbol && symbol !== code && <span className="opacity-50 font-mono text-xs">{symbol}</span>}
      {code}
    </span>
  )
}

export function CurrencyModal({ isOpen, onClose, provider, initialTab }) {
  const [activeTab, setActiveTab] = useState('fiat')
  const [searchTerm, setSearchTerm] = useState('')

  // Sync to the requested tab when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab)
      setSearchTerm('')
    }
  }, [isOpen, initialTab])

  const fiatCurrencies = provider?.fiat_currencies ?? []
  const cryptoCurrencies = provider?.crypto_currencies ?? []

  const hasFiat = fiatCurrencies.length > 0
  const hasCrypto = cryptoCurrencies.length > 0
  const hasBoth = hasFiat && hasCrypto
  const effectiveTab = hasBoth ? activeTab : (hasFiat ? 'fiat' : hasCrypto ? 'crypto' : null)

  // Filter currencies by search term (matches code or name)
  const filteredFiat = useMemo(() => {
    if (!searchTerm) return fiatCurrencies
    const term = searchTerm.toLowerCase()
    return fiatCurrencies.filter(c =>
      c.currency_code.toLowerCase().includes(term) ||
      (CURRENCY_NAMES[c.currency_code] || '').toLowerCase().includes(term)
    )
  }, [fiatCurrencies, searchTerm])

  const filteredCrypto = useMemo(() => {
    if (!searchTerm) return cryptoCurrencies
    const term = searchTerm.toLowerCase()
    return cryptoCurrencies.filter(c =>
      c.currency_code.toLowerCase().includes(term) ||
      (CURRENCY_NAMES[c.currency_code] || '').toLowerCase().includes(term)
    )
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
          className="w-full pl-10 pr-4 py-2 bg-surface border border-input-border rounded-lg
                     text-text placeholder-text-muted
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Tabs — only show toggle when both types exist */}
      {hasBoth ? (
        <div className="flex border border-border rounded-lg overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('fiat')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'fiat'
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <FiatIcon />
            Fiat ({fiatCurrencies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crypto')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'crypto'
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <CryptoIcon />
            Crypto ({cryptoCurrencies.length})
          </button>
        </div>
      ) : effectiveTab && (
        <h4 className="text-sm font-medium text-text-muted flex items-center gap-2 mb-4">
          {effectiveTab === 'fiat'
            ? <><FiatIcon /> Supported Fiat Currencies</>
            : <><CryptoIcon /> Supported Crypto Currencies</>}
        </h4>
      )}

      {/* Content */}
      <div className="min-h-[200px]">
        {effectiveTab === 'fiat' && (
          <div>
            {filteredFiat.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">
                No fiat currencies match your search
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-2">
                {filteredFiat.map(c => (
                  <CurrencyBadge key={c.currency_code} code={c.currency_code} type="fiat" />
                ))}
              </div>
            )}
          </div>
        )}

        {effectiveTab === 'crypto' && (
          <div>
            {filteredCrypto.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">
                No cryptocurrencies match your search
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-2">
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
