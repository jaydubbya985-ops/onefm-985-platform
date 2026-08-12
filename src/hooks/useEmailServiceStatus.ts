import { useEffect, useState } from 'react'

export type EmailServiceStatus = 'checking' | 'live' | 'off' | 'unknown'

/**
 * Checks whether the invoice email pipeline (Resend, via the Netlify
 * `send-invoice` function) is actually live in this environment.
 *
 * - 'live'    → RESEND_API_KEY is set on Netlify, real sends will go out.
 * - 'off'     → function reachable but RESEND_API_KEY missing — dev/PDF+mailto fallback only.
 * - 'unknown' → function unreachable (e.g. `npm run dev` without `netlify dev`) — cannot tell.
 *
 * Never guesses or invents a key — this only reports presence/absence.
 */
export function useEmailServiceStatus(): EmailServiceStatus {
  const [status, setStatus] = useState<EmailServiceStatus>('checking')

  useEffect(() => {
    let cancelled = false

    fetch('/.netlify/functions/email-status')
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`)
        return res.json() as Promise<{ resendConfigured?: boolean }>
      })
      .then((data) => {
        if (cancelled) return
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
