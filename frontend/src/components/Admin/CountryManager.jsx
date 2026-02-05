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

export function CountryManager({ providerId, providerName, onUpdate }) {
  const [restrictions, setRestrictions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Add form state
  const [newCodes, setNewCodes] = useState('')
  const [restrictionType, setRestrictionType] = useState('RESTRICTED')
  const [isAdding, setIsAdding] = useState(false)

  const fetchRestrictions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get(`/admin/providers/${providerId}/restrictions/`)
      setRestrictions(data)
    } catch (err) {
      setError(err.message || 'Failed to load restrictions')
    } finally {
      setIsLoading(false)
    }
  }, [providerId])

  useEffect(() => {
    fetchRestrictions()
  }, [fetchRestrictions])

  const handleAdd = async () => {
    if (!newCodes.trim()) return

    setIsAdding(true)
    try {
      await api.post(`/admin/providers/${providerId}/restrictions/`, {
        country_codes: newCodes,
        restriction_type: restrictionType,
      })
      setNewCodes('')
      fetchRestrictions()
      onUpdate?.()
    } catch (err) {
      alert(err.message || 'Failed to add restrictions')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemove = async (id) => {
    try {
      await api.delete(`/admin/providers/${providerId}/restrictions/${id}/`)
      fetchRestrictions()
      onUpdate?.()
    } catch (err) {
      alert(err.message || 'Failed to remove restriction')
    }
  }

  if (error) {
    return (
      <div className="text-red-400">
        {error}
        <button onClick={fetchRestrictions} className="ml-2 text-primary hover:underline">
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

  const restrictedCountries = restrictions.filter((r) => r.restriction_type === 'RESTRICTED')
  const regulatedCountries = restrictions.filter((r) => r.restriction_type === 'REGULATED')

  return (
    <div className="space-y-6">
      {/* Add Country Form */}
      <div className="p-4 bg-bg rounded-lg">
        <h4 className="text-sm font-medium text-text mb-3">Add Countries</h4>
        <div className="flex flex-wrap gap-2">
          <select
            value={restrictionType}
            onChange={(e) => setRestrictionType(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text"
          >
            <option value="RESTRICTED">Restricted</option>
            <option value="REGULATED">Regulated</option>
          </select>
          <input
            type="text"
            value={newCodes}
            onChange={(e) => setNewCodes(e.target.value.toUpperCase())}
            placeholder="US, GB, DE (comma-separated)"
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
          Enter multiple country codes separated by commas for bulk add
        </p>
      </div>

      {/* Restricted Countries */}
      <div>
        <h4 className="text-sm font-medium text-text mb-2">
          Restricted Countries ({restrictedCountries.length})
        </h4>
        {restrictedCountries.length === 0 ? (
          <p className="text-sm text-text-muted">No restricted countries configured</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {restrictedCountries.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 text-sm rounded-full"
              >
                {r.country_code}
                <button
                  onClick={() => handleRemove(r.id)}
                  className="hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                  title="Remove"
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Regulated Countries */}
      <div>
        <h4 className="text-sm font-medium text-text mb-2">
          Regulated Countries ({regulatedCountries.length})
        </h4>
        {regulatedCountries.length === 0 ? (
          <p className="text-sm text-text-muted">No regulated countries configured</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {regulatedCountries.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 text-sm rounded-full"
              >
                {r.country_code}
                <button
                  onClick={() => handleRemove(r.id)}
                  className="hover:bg-yellow-500/20 rounded-full p-0.5 transition-colors"
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
