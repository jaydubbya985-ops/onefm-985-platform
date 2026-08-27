import { useEffect, useState } from 'react'
import { readFunctionJson } from '@/lib/readFunctionJson'

export type EmailServiceStatus = 'checking' | 'live' | 'off' | 'unknown'

/**
 * Checks whether the invoice email pipeline (Resend, via the Netlify
 * `send-invoice` function) is actually live in this environment.
 *
 * - 'live'    → RESEND_API_KEY is set on Netlify, real sends will go out.
 * - 'off'     → function reachable but RESEND_API_KEY missing — PDF+mailto fallback only.
 * - 'unknown' → function unreachable (SPA HTML fallback or local `npm run dev`).
 *
 * Never guesses or invents a key — this only reports presence/absence.
 */
export function useEmailServiceStatus(): EmailServiceStatus {
  const [status, setStatus] = useState<EmailServiceStatus>('checking')

  useEffect(() => {
    let cancelled = false

    fetch('/.netlify/functions/email-status', { headers: { Accept: 'application/json' } })
      .then((res) => readFunctionJson<{ resendConfigured?: boolean }>(res))
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setStatus('unknown')
          return
        }
        setStatus(data.resendConfigured ? 'live' : 'off')
      })
      .catch(() => {
        if (!cancelled) setStatus('unknown')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return status
}
