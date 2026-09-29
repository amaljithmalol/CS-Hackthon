import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.readSession())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const token = authService.readToken()
    if (!token) {
      setLoading(false)
      return undefined
    }
    authService
      .fetchCurrentUser()
      .then((fresh) => {
        if (!cancelled) setUser(authService.writeSession(fresh))
      })
      .catch(() => {
        if (!cancelled) {
          authService.clearSession()
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials)
    setUser(session)
    return session
  }, [])

  const register = useCallback(async (payload) => authService.register(payload), [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const updated = await authService.updateProfile(payload)
    setUser(updated)
    return updated
  }, [])

  const changePassword = useCallback((payload) => authService.changePassword(payload), [])

  const refresh = useCallback(async () => {
    const fresh = await authService.fetchCurrentUser()
    setUser(authService.writeSession(fresh))
    return fresh
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      refresh,
    }),
    [user, loading, login, register, logout, updateProfile, changePassword, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.')
  return context
}
