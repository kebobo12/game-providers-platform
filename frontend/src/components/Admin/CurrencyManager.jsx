import { useState, useEffect, useCallback } from 'react'
import { api } from '../../api/client'

function PlusIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function CurrencyManager({ providerId, providerName, onUpdate }) {
  const [currencies, setCurrencies] = useState({ fiat: [], crypto: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Add form state
  const [newCodes, setNewCodes] = useState('')
  const [currencyType, setCurrencyType] = useState('fiat')
  const [isAdding, setIsAdding] = useState(false)

  const fetchCurrencies = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get(`/admin/providers/${providerId}/currencies/`)
      setCurrencies(data)
    } catch (err) {
      setError(err.message || 'Failed to load currencies')
    } finally {
      setIsLoading(false)
    }
  }, [providerId])

  useEffect(() => {
    fetchCurrencies()
  }, [fetchCurrencies])

  const handleAdd = async () => {
    if (!newCodes.trim()) return

    setIsAdding(true)
    try {
      await api.post(`/admin/providers/${providerId}/currencies/`, {
        currency_codes: newCodes,
        type: currencyType,
      })
      setNewCodes('')
      fetchCurrencies()
      onUpdate?.()
    } catch (err) {
      alert(err.message || 'Failed to add currencies')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemove = async (code, type) => {
    try {
      await api.delete(`/admin/providers/${providerId}/currencies/${code}/?type=${type}`)
      fetchCurrencies()
      onUpdate?.()
    } catch (err) {
      alert(err.message || 'Failed to remove currency')
    }
  }

  if (error) {
    return (
      <div className="text-red-400">
        {error}
        <button onClick={fetchCurrencies} className="ml-2 text-primary hover:underline">
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-bg rounded animate-pulse" />
        <div className="h-20 bg-bg rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Currency Form */}
      <div className="p-4 bg-bg rounded-lg">
        <h4 className="text-sm font-medium text-text mb-3">Add Currencies</h4>
        <div className="flex flex-wrap gap-2">
          <select
            value={currencyType}
            onChange={(e) => setCurrencyType(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text"
          >
            <option value="fiat">Fiat</option>
            <option value="crypto">Crypto</option>
          </select>
          <input
            type="text"
            value={newCodes}
            onChange={(e) => setNewCodes(e.target.value.toUpperCase())}
            placeholder="USD, EUR, GBP (comma-separated)"
            className="flex-1 min-w-[200px] px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text placeholder-text-muted
                       focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={isAdding || !newCodes.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg
                       hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon />
            Add
          </button>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Enter multiple currency codes separated by commas for bulk add
        </p>
      </div>

      {/* Fiat Currencies */}
      <div>
        <h4 className="text-sm font-medium text-text mb-2">
          Fiat Currencies ({currencies.fiat.length})
        </h4>
        {currencies.fiat.length === 0 ? (
          <p className="text-sm text-text-muted">No fiat currencies configured</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currencies.fiat.map((c) => (
              <span
                key={c.currency_code}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full"
              >
                {c.currency_code}
                <button
                  onClick={() => handleRemove(c.currency_code, 'fiat')}
                  className="hover:bg-blue-500/20 rounded-full p-0.5 transition-colors"
                  title="Remove"
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Crypto Currencies */}
      <div>
        <h4 className="text-sm font-medium text-text mb-2">
          Crypto Currencies ({currencies.crypto.length})
        </h4>
        {currencies.crypto.length === 0 ? (
          <p className="text-sm text-text-muted">No crypto currencies configured</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currencies.crypto.map((c) => (
              <span
                key={c.currency_code}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-400 text-sm rounded-full"
              >
                {c.currency_code}
                <button
                  onClick={() => handleRemove(c.currency_code, 'crypto')}
                  className="hover:bg-orange-500/20 rounded-full p-0.5 transition-colors"
                  title="Remove"
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
