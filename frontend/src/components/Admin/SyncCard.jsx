import { useState } from 'react'
import { api } from '../../api/client'

function SyncIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

export function SyncCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSync = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const data = await api.post('/admin/sync/')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Sync failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <SyncIcon />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text">Sync from API</h3>
          <p className="text-sm text-text-muted mt-0.5">
            Sync providers and games from external API
          </p>
        </div>
      </div>

      <button
        onClick={handleSync}
        disabled={isLoading}
        className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium
                   hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <SpinnerIcon />
            Syncing...
          </>
        ) : (
          'Start Sync'
        )}
      </button>

      {result && (
        <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg text-sm">
          <div className="font-medium text-success">Sync Complete</div>
          <div className="text-text-muted mt-1">
            Providers: {result.providers_processed} | Games: {result.games_synced}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-error/10 border border-error/30 rounded-lg text-sm">
          <div className="font-medium text-error">Sync Failed</div>
          <div className="text-text-muted mt-1">{error}</div>
        </div>
      )}
    </div>
  )
}
