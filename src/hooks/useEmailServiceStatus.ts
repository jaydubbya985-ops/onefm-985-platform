import { useEffect, useState } from 'react'
import { readFunctionJson } from '@/lib/readFunctionJson'

export type EmailServiceStatus = 'checking' | 'live' | 'pending' | 'unverified' | 'off' | 'unknown'

/**
 * Checks whether the invoice email pipeline (Resend, via the Netlify
 * `send-invoice` function) can actually deliver mail.
 *
 * - 'live'       → key is set, Resend accepts it, fm985.com.au is verified.
 * - 'pending'    → DNS matches; Resend has not finished verifying yet.
 * - 'unverified' → key is set but fm985.com.au DNS does not match Resend.
 * - 'off'        → function reachable but RESEND_API_KEY missing — PDF+mailto fallback only.
 * - 'unknown'    → function unreachable (SPA HTML fallback or local `npm run dev`).
 *
 * Never guesses or invents a key.
 */
export function useEmailServiceStatus(): EmailServiceStatus {
  const [status, setStatus] = useState<EmailServiceStatus>('checking')

  useEffect(() => {
    let cancelled = false

    fetch('/.netlify/functions/email-status', { headers: { Accept: 'application/json' } })
      .then((res) =>
        readFunctionJson<{
          resendConfigured?: boolean
          resendReachable?: boolean
          fromDomainVerified?: boolean
          domainStatus?: string
        }>(res),
      )
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setStatus('unknown')
          return
        }
        if (!data.resendConfigured) {
          setStatus('off')
          return
        }
        if (data.fromDomainVerified === true && data.resendReachable !== false) {
          setStatus('live')
          return
        }
        if (data.domainStatus === 'pending') {
          setStatus('pending')
          return
        }
        setStatus('unverified')
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
