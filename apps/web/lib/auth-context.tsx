'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from './api'
import { supabase } from './supabase'

interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'admin'
  avatarUrl?: string
  phone?: string
  address?: string
  city?: string
  country?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  register: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Store token for API calls
          localStorage.setItem('auth-token', session.access_token)

          // Fetch profile from our API
          try {
            const profile = await api.auth.me()
              setUser({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                role: profile.role as User['role'],
                avatarUrl: profile.avatarUrl,
                phone: profile.phone,
                address: profile.address,
                city: profile.city,
                country: profile.country,
              })
          } catch {
            // Fallback to Supabase metadata
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || '',
              role: (session.user.user_metadata?.role as User['role']) || 'customer',
            })
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        localStorage.setItem('auth-token', session.access_token)

        try {
          const profile = await api.auth.me()
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as User['role'],
            avatarUrl: profile.avatarUrl,
            phone: profile.phone,
            address: profile.address,
            city: profile.city,
            country: profile.country,
          })
        } catch {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            role: (session.user.user_metadata?.role as User['role']) || 'customer',
          })
        }
      } else {
        setUser(null)
        localStorage.removeItem('auth-token')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Register via API, then auto-login via Supabase client
  const register = async (email: string, password: string, name: string) => {
    await api.auth.register({ email, password, name })

    // Auto-login after registration
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  // Login via Supabase client directly (creates real browser session)
  const login = async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Store token
    localStorage.setItem('auth-token', data.session.access_token)

    // Fetch full profile from API
    try {
      const profile = await api.auth.me()
      const u: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as User['role'],
        avatarUrl: profile.avatarUrl,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        country: profile.country,
      }
      setUser(u)
      return u
    } catch {
      // Fallback
      const u: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
        role: (data.user.user_metadata?.role as User['role']) || 'customer',
      }
      setUser(u)
      return u
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('auth-token')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const profile = await api.auth.me()
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as User['role'],
        avatarUrl: profile.avatarUrl,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        country: profile.country,
      })
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
