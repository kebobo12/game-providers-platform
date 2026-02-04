import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function HomePage() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/health/')
      .then(data => {
        setHealth(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch health:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-text mb-6">Dashboard</h2>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">API Status</h3>
        {loading ? (
          <p className="text-text-muted">Checking API connection...</p>
        ) : health ? (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-success rounded-full"></span>
            <span className="text-success">
              Backend connected: {JSON.stringify(health)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-error rounded-full"></span>
            <span className="text-error">Backend not reachable</span>
          </div>
        )}
      </div>
    </div>
  )
}
