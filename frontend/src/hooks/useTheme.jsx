import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const THEME_KEY = 'gp-theme'

function getInitialTheme() {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  // Default to dark
  return 'dark'
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Initialize and apply theme immediately to prevent flicker
    const initial = getInitialTheme()
    applyTheme(initial)
    return initial
  })

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
    applyTheme(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // Apply theme on mount (for cases where state is set before DOM is ready)
  useEffect(() => {
    applyTheme(theme)
  }, [])

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
