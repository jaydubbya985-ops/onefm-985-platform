import { useEffect, useState } from 'react'
import {
  emailStatusFromPayload,
  type EmailServiceStatus,
} from '@/lib/emailStatus'
import { readFunctionJson } from '@/lib/readFunctionJson'

export type { EmailServiceStatus }

/**
 * Checks whether the invoice email pipeline (Resend, via the Netlify
 * `send-invoice` function) can actually deliver mail.
 *
 * - 'live'       → key is set, Resend accepts it, fm985.com.au is verified.
 * - 'pending'    → DNS matches; Resend has not finished verifying yet.
 * - 'unverified' → key is set but fm985.com.au DNS does not match Resend.
 * - 'off'        → function reachable and resendConfigured is explicitly false.
 * - 'unknown'    → SPA HTML, parse failure, or JSON without resendConfigured.
 *
 * Never guesses or invents a key. Requires fromDomainVerified before live.
 * A missing resendConfigured field is unknown — never 'off' / 'pending'.
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
        setStatus(emailStatusFromPayload(data))
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
