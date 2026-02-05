import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { isAuthenticated, isSuperuser, logout, loading } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen, closeMenu])

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen, closeMenu])

  // Close menu on route change
  useEffect(() => {
    closeMenu()
  }, [location.pathname, closeMenu])

  const handleLogout = async () => {
    closeMenu()
    await logout()
  }

  const navLinkClass = (path) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      location.pathname === path
        ? 'text-primary bg-primary/10'
        : 'text-text-muted hover:text-text'
    }`

  const mobileNavLinkClass = (path) =>
    `flex items-center min-h-[44px] px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      location.pathname === path
        ? 'text-primary bg-primary/10'
        : 'text-text-muted hover:text-text hover:bg-muted-bg'
    }`

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && (
            <Link to="/" className={navLinkClass('/')}>
              Dashboard
            </Link>
          )}
          {isSuperuser && (
            <Link to="/admin" className={navLinkClass('/admin')}>
              Admin
            </Link>
          )}
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

        {/* Hamburger button (mobile only) */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="md:hidden relative w-11 h-11 flex items-center justify-center rounded-lg hover:bg-muted-bg transition-colors"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 w-5 bg-text rounded-full transition-all duration-300 origin-center ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-text rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-text rounded-full transition-all duration-300 origin-center ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="border-t border-border px-4 py-3 space-y-1">
          {isAuthenticated && (
            <Link to="/" className={mobileNavLinkClass('/')}>
              Dashboard
            </Link>
          )}
          {isSuperuser && (
            <Link to="/admin" className={mobileNavLinkClass('/admin')}>
              Admin
            </Link>
          )}
          <div className="flex items-center min-h-[44px] px-4 py-3">
            <span className="text-sm font-medium text-text-muted mr-3">Theme</span>
            <ThemeToggle />
          </div>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center min-h-[44px] px-4 py-3 text-sm font-medium text-text-muted hover:text-text hover:bg-muted-bg rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
