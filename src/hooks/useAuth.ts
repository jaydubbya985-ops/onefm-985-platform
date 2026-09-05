import { useState, useEffect, useCallback } from 'react'
import { AUTH_UNAVAILABLE } from '@/lib/authCopy'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

function requireLiveAuth() {
  if (!isSupabaseConfigured()) {
    throw new Error(AUTH_UNAVAILABLE)
  }
}

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setState({
        user: session?.user ?? null,
        loading: false,
        isAuthenticated: !!session?.user,
      })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        setState({
          user: session?.user ?? null,
          loading: false,
          isAuthenticated: !!session?.user,
        })
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    requireLiveAuth()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }, [])

  const signup = useCallback(
    async (email: string, password: string, metadata?: Record<string, unknown>) => {
      requireLiveAuth()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })
      if (error) throw error
      return data
    },
    []
  )

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    requireLiveAuth()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }, [])

  return {
    user: state.user,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    login,
    signup,
    logout,
    resetPassword,
  }
}
