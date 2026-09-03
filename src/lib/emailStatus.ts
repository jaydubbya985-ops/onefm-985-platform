export type EmailServiceStatus = 'checking' | 'live' | 'pending' | 'unverified' | 'off' | 'unknown'

export type EmailStatusPayload = {
  resendConfigured?: boolean
  resendReachable?: boolean
  fromDomainVerified?: boolean
  domainStatus?: string
}

/**
 * Classify email-status JSON.
 * A missing resendConfigured field is unknown — never invent "key is off".
 */
export function emailStatusFromPayload(data: EmailStatusPayload | null): EmailServiceStatus {
  if (!data) return 'unknown'
  if (data.resendConfigured === false) return 'off'
  if (data.resendConfigured !== true) return 'unknown'
  if (data.fromDomainVerified === true && data.resendReachable !== false) return 'live'
  if (data.domainStatus === 'pending') return 'pending'
  return 'unverified'
}
