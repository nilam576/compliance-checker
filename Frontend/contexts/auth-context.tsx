'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface AuthContextType {
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const checkAuthStatus = () => {
    const token = Cookies.get('authToken')
    // Validate token before setting authentication state
    if (token && token !== 'undefined' && token !== 'null' && token.trim().length >= 15) {
      setIsAuthenticated(true)
      return true
    } else if (token) {
      // Clear invalid token
      Cookies.remove('authToken')
      setIsAuthenticated(false)
      return false
    }
    setIsAuthenticated(false)
    return false
  }

  useEffect(() => {
    setIsClient(true)
    checkAuthStatus()

    // Set up interval to check auth status periodically
    const interval = setInterval(checkAuthStatus, 1000) // Check every second

    return () => clearInterval(interval)
  }, [])

  const login = async (): Promise<void> => {
    // In a real app, this would be an API call
    // For demo purposes, we'll just set a dummy token
    Cookies.set('authToken', 'dummy-auth-token-for-demo-purposes', { expires: 7 }) // Expires in 7 days
    setIsAuthenticated(true)
  }

  const logout = (): void => {
    Cookies.remove('authToken')
    setIsAuthenticated(false)
  }

  // Render children immediately, but only show protected content after client initialization
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
