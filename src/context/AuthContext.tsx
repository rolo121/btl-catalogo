'use client'

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authApi } from '@/lib/authApi'
import { emitCustomerSessionChanged } from '@/lib/customerSessionEvents'
import type {
  AuthSession,
  CustomerProfile,
  CustomerUser,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/types/AuthTypes'

type AuthContextValue = {
  user: CustomerUser | null
  profile: CustomerProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  refreshSession: () => Promise<AuthSession | null>
  login: (payload: LoginPayload) => Promise<AuthSession>
  register: (payload: RegisterPayload) => Promise<AuthSession>
  logout: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthSession>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const nextSession = await authApi.current()
      setSession(nextSession)
      emitCustomerSessionChanged(nextSession?.user?.id ?? null)
      return nextSession
    } catch {
      /*
       * Un fallo real de red o servidor no debe simular una sesión válida.
       * El endpoint de estado responde 200 cuando simplemente no hay sesión.
       */
      setSession(null)
      emitCustomerSessionChanged(null)
      return null
    }
  }, [])

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false))
  }, [refreshSession])

  const login = useCallback(async (payload: LoginPayload) => {
    const nextSession = await authApi.login(payload)
    setSession(nextSession)
    emitCustomerSessionChanged(nextSession.user.id)
    return nextSession
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const nextSession = await authApi.register(payload)
    setSession(nextSession)
    emitCustomerSessionChanged(nextSession.user.id)
    return nextSession
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setSession(null)
      emitCustomerSessionChanged(null)
    }
  }, [])

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const nextSession = await authApi.updateProfile(payload)
    setSession(nextSession)
    return nextSession
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user || null,
      profile: session?.profile || null,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      refreshSession,
      login,
      register,
      logout,
      updateProfile,
    }),
    [session, isLoading, refreshSession, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}