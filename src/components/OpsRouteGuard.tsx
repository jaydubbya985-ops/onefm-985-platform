import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Lock, Loader2, Mail } from 'lucide-react'
import { useOpsAccess } from '@/hooks/useOpsAccess'
import { useAuth } from '@/hooks/useAuth'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { isSupabaseConfigured } from '@/lib/supabase'

interface OpsRouteGuardProps {
  children: ReactNode
}

/** Unused station archive photo — valley sunrise, not a presenter portrait. */
function OpsGatePhoto() {
  return (
    <>
      <img
        src={STATION_PHOTOS.ecoTractorSunrise}
        alt=""
        aria-hidden
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#101010]/70 via-[#101010]/82 to-[#101010]"
      />
    </>
  )
}

export function OpsRouteGuard({ children }: OpsRouteGuardProps) {
  const useAuthGate = isSupabaseConfigured()
  const { authLoading, submitPassword, submitLogin } = useOpsAccess()
  const { isAuthenticated, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const unlocked = useAuthGate ? isAuthenticated : sessionStorage.getItem('ops_unlocked') === 'true'
  const checking = useAuthGate && (loading || authLoading)

  useEffect(() => {
    if (checking || unlocked) return
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [checking, unlocked])

  const handleDemoSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitPassword(password)) {
      setError('')
      window.location.reload()
    } else {
      setError('Incorrect password. Try again.')
    }
  }

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await submitLogin(email, password)
    if (!result.ok) setError(result.error ?? 'Invalid email or password.')
    setSubmitting(false)
  }

  if (checking) {
    return (
      <div className="relative min-h-screen bg-[#101010] flex items-center justify-center overflow-hidden">
        <OpsGatePhoto />
        <div className="relative z-10 text-one-gold font-label text-sm animate-pulse">Checking access...</div>
      </div>
    )
  }

  if (unlocked || (useAuthGate && isAuthenticated)) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen bg-[#101010] flex items-center justify-center px-4 overflow-hidden">
      <OpsGatePhoto />
      <div className="relative z-10 bg-[#161616]/92 backdrop-blur-sm border border-[#2A2A2A]/40 rounded-xl max-w-sm w-full shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-one-gold/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-one-gold" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-one-white">Operations Portal</h2>
            <p className="text-xs text-one-muted">
              {useAuthGate ? 'Staff sign in required' : 'Authorised access only'}
            </p>
            {useAuthGate ? (
              <p className="text-xs text-emerald-400 font-semibold mt-1">LIVE — not DEMO</p>
            ) : (
              <p className="text-xs text-one-gold font-semibold mt-1">DEMO MODE</p>
            )}
          </div>
        </div>

        {useAuthGate ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block font-label text-xs text-one-muted uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-one-muted" />
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  placeholder="you@fm985.com.au"
                  required
                  className="w-full bg-one-navy border border-one-border rounded-lg pl-10 pr-4 py-3 text-sm text-one-white placeholder-one-muted focus:border-one-gold focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-label text-xs text-one-muted uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter password"
                required
                className="w-full bg-one-navy border border-one-border rounded-lg px-4 py-3 text-sm text-one-white placeholder-one-muted focus:border-one-gold focus:outline-none"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-lg bg-one-gold text-one-navy text-sm font-label font-bold hover:bg-[#F4F1EA] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
            <p className="text-center text-xs text-one-muted">
              Staff logins are created in Supabase Authentication. This is not the DEMO password gate.
            </p>
          </form>
        ) : (
          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <div>
              <label className="block font-label text-xs text-one-muted uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter password"
                className="w-full bg-one-navy border border-one-border rounded-lg px-4 py-3 text-sm text-one-white placeholder-one-muted focus:border-one-gold focus:outline-none"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-one-gold text-one-navy text-sm font-label font-bold hover:bg-[#F4F1EA] transition-colors"
            >
              Unlock Portal
            </button>
            <p className="text-center text-xs text-one-muted">Hint: Ask Jason for the password</p>
          </form>
        )}
        <p className="text-center text-[11px] text-one-muted/80 mt-6">
          {formatCoverageShort()} — ABS 2021 via townData
        </p>
      </div>
    </div>
  )
}
