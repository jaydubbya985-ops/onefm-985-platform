import { useCallback, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { opsLoginFailureNote } from '@/lib/opsLoginError'

export interface OpsLoginResult {
  ok: boolean
  error?: string
}

export const OPS_PASSWORD = 'onefm2026'
export const OPS_SESSION_KEY = 'ops_unlocked'

/**
 * Ops access control.
 * - Supabase configured → requires authenticated staff session
 * - Demo mode (no Supabase) → sessionStorage password gate
 */
export function useOpsAccess() {
  const { isAuthenticated, login, loading: authLoading } = useAuth()
  const useAuthGate = isSupabaseConfigured()

  const [demoUnlocked, setDemoUnlocked] = useState(
    () => !useAuthGate && sessionStorage.getItem(OPS_SESSION_KEY) === 'true',
  )
  const [showGate, setShowGate] = useState(false)

  const unlocked = useAuthGate ? isAuthenticated : demoUnlocked

  const tryAccess = useCallback(() => {
    if (unlocked) return true
    setShowGate(true)
    return false
  }, [unlocked])

  const submitPassword = useCallback((password: string) => {
    if (password === OPS_PASSWORD) {
      sessionStorage.setItem(OPS_SESSION_KEY, 'true')
      setDemoUnlocked(true)
      setShowGate(false)
      return true
    }
    return false
  }, [])

  const submitLogin = useCallback(
    async (email: string, password: string): Promise<OpsLoginResult> => {
      try {
        await login(email, password)
        setShowGate(false)
        return { ok: true }
      } catch (err) {
        return { ok: false, error: opsLoginFailureNote(err) }
      }
    },
    [login],
  )

  const close = useCallback(() => setShowGate(false), [])

  return {
    unlocked,
    showGate,
    authLoading,
    useAuthGate,
    tryAccess,
    submitPassword,
    submitLogin,
    close,
  }
}
