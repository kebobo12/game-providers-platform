import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { isAuthenticated, logout, loading } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-xl font-semibold text-text">
            Game Providers Platform
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
