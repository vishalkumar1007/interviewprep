import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { Account, Profile, User } from '../types'

type AuthState = {
  user: User | null
  profile: Profile | null
  loading: boolean
  refresh: () => Promise<void>
  setAccount: (account: Account | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const setAccount = (account: Account | null) => {
    setUser(account?.user ?? null)
    setProfile(account?.profile ?? null)
  }

  const refresh = async () => {
    try {
      const account = await api.me()
      setAccount(account)
    } catch {
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const logout = async () => {
    await api.logout()
    setAccount(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refresh, setAccount, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth requires AuthProvider')
  return ctx
}
