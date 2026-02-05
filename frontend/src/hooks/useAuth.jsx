import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { api, ApiError } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const userData = await api.auth.me()
      setUser(userData)
    } catch (err) {
      // 401 is expected when not logged in
      if (err instanceof ApiError && err.status === 401) {
        setUser(null)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const userData = await api.auth.login(username, password)
      setUser(userData)
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await api.auth.logout()
      setUser(null)
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Logout failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isSuperuser: !!user?.is_superuser,
    login,
    logout,
    checkSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
