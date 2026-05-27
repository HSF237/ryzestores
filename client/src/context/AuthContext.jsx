import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/firebaseService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const result = await authService.getMe()
          setUser(result.user)
        } catch (err) {
          console.error('Failed to get user profile:', err)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password)
    setUser(result.user)
    return result.user
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const result = await authService.signup(name, email, password)
    setUser(result.user)
    return result.user
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const googleSignIn = useCallback(async () => {
    const result = await authService.googleSignIn()
    setUser(result.user)
    return result.user
  }, [])

  const isStaff = user?.role === 'staff' || user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, isStaff, loading, login, signup, logout, googleSignIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
