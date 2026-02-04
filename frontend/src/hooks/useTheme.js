import { useState, useEffect, useCallback } from 'react'

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

export function useTheme() {
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

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  }
}
