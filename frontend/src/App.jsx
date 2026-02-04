import { useState, useEffect } from 'react'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health/')
      .then(res => res.json())
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Game Providers Platform
        </h1>

        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          {loading ? (
            <p className="text-gray-400">Checking API connection...</p>
          ) : health ? (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-green-400">
                Backend connected: {JSON.stringify(health)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-red-400">Backend not reachable</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
