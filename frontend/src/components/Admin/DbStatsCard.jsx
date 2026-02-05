import { useState, useEffect, useCallback } from 'react'
import { api } from '../../api/client'

function DatabaseIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  )
}

export function DbStatsCard() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get('/admin/stats/')
      setStats(data)
    } catch (err) {
      setError(err.message || 'Failed to load stats')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-info/10 rounded-lg text-info">
            <DatabaseIcon />
          </div>
          <div>
            <h3 className="font-medium text-text">Database Stats</h3>
            <p className="text-sm text-text-muted mt-0.5">
              Current entity counts
            </p>
          </div>
        </div>
        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="p-2 text-text-muted hover:text-text hover:bg-muted-bg rounded-lg transition-colors disabled:opacity-50"
          title="Refresh stats"
        >
          <RefreshIcon />
        </button>
      </div>

      {error ? (
        <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
          {error}
        </div>
      ) : isLoading ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-bg rounded animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <StatItem label="Providers" value={stats.providers} />
            <StatItem label="Games" value={stats.games} />
            <StatItem label="Fiat Currencies" value={stats.fiat_currencies} />
            <StatItem label="Crypto Currencies" value={stats.crypto_currencies} />
            <StatItem label="Restrictions" value={stats.restrictions} />
            <StatItem label="Countries" value={stats.countries} />
          </div>
          <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted">
            Last sync: {formatDate(stats.last_sync)}
          </div>
        </>
      ) : null}
    </div>
  )
}

function StatItem({ label, value }) {
  return (
    <div className="px-3 py-2 bg-bg rounded-lg">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="text-lg font-semibold text-text">{value?.toLocaleString() ?? '-'}</div>
    </div>
  )
}
