import { useState } from 'react'
import { ExportButton, downloadCSV, arrayToCSV } from '../../shared'
import { CurrencyModal } from '../../Modals'

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
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-full ${
        type === 'fiat' ? 'badge-fiat' : 'badge-crypto'
      }`}
      title={name || undefined}
    >
      {symbol && symbol !== code && <span className="opacity-50 font-mono text-xs">{symbol}</span>}
      {code}
    </span>
  )
}

const PREVIEW_LIMIT = 20

export function CurrenciesTab({ provider }) {
  const [activeSubTab, setActiveSubTab] = useState('fiat')
  const [modalTab, setModalTab] = useState(null)

  if (!provider) return null

  const fiatCurrencies = provider.fiat_currencies ?? []
  const cryptoCurrencies = provider.crypto_currencies ?? []

  const hasFiat = fiatCurrencies.length > 0
  const hasCrypto = cryptoCurrencies.length > 0
  const hasBoth = hasFiat && hasCrypto
  const effectiveTab = hasBoth ? activeSubTab : (hasFiat ? 'fiat' : hasCrypto ? 'crypto' : null)

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
    downloadCSV(csv, `${provider.provider_name}_currencies`)
  }

  const totalCount = fiatCurrencies.length + cryptoCurrencies.length
  const showViewAll = fiatCurrencies.length > PREVIEW_LIMIT || cryptoCurrencies.length > PREVIEW_LIMIT

  // Preview only first N currencies
  const previewFiat = fiatCurrencies.slice(0, PREVIEW_LIMIT)
  const previewCrypto = cryptoCurrencies.slice(0, PREVIEW_LIMIT)

  return (
    <>
      <div className="space-y-4">
        {/* Header with count and export */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            {totalCount} {totalCount === 1 ? 'currency' : 'currencies'}
          </span>
          <div className="flex items-center gap-2">
            {showViewAll && (
              <button
                type="button"
                onClick={() => setModalTab(effectiveTab)}
                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                View All
              </button>
            )}
            {totalCount > 0 && (
              <ExportButton onClick={handleExport} />
            )}
          </div>
        </div>

        {/* Sub-tabs — only show toggle when both types exist */}
        {hasBoth ? (
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveSubTab('fiat')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                activeSubTab === 'fiat'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <FiatIcon />
              Fiat ({fiatCurrencies.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('crypto')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                activeSubTab === 'crypto'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <CryptoIcon />
              Crypto ({cryptoCurrencies.length})
            </button>
          </div>
        ) : effectiveTab && (
          <h4 className="text-sm font-medium text-text-muted flex items-center gap-2">
            {effectiveTab === 'fiat'
              ? <><FiatIcon /> Supported Fiat Currencies</>
              : <><CryptoIcon /> Supported Crypto Currencies</>}
          </h4>
        )}

        {/* Content */}
        <div className="min-h-[100px]">
          {effectiveTab === 'fiat' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {previewFiat.map(c => (
                  <CurrencyBadge key={c.currency_code} code={c.currency_code} type="fiat" />
                ))}
              </div>
              {fiatCurrencies.length > PREVIEW_LIMIT && (
                <button
                  type="button"
                  onClick={() => setModalTab('fiat')}
                  className="text-sm text-primary hover:text-primary-hover transition-colors"
                >
                  +{fiatCurrencies.length - PREVIEW_LIMIT} more fiat currencies
                </button>
              )}
            </div>
          )}

          {effectiveTab === 'crypto' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {previewCrypto.map(c => (
                  <CurrencyBadge key={c.currency_code} code={c.currency_code} type="crypto" />
                ))}
              </div>
              {cryptoCurrencies.length > PREVIEW_LIMIT && (
                <button
                  type="button"
                  onClick={() => setModalTab('crypto')}
                  className="text-sm text-primary hover:text-primary-hover transition-colors"
                >
                  +{cryptoCurrencies.length - PREVIEW_LIMIT} more cryptocurrencies
                </button>
              )}
            </div>
          )}

          {!effectiveTab && (
            <p className="text-text-muted text-sm py-4 text-center">No currencies</p>
          )}
        </div>
      </div>

      {/* Modal */}
      <CurrencyModal
        isOpen={!!modalTab}
        onClose={() => setModalTab(null)}
        provider={provider}
        initialTab={modalTab}
      />
    </>
  )
}
