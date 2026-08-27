/**
 * Probe Resend without sending mail. Used by email-status (GET) and
 * send-invoice dry-run. Never returns the API key or a domain list.
 */

export const INVOICE_FROM = 'ONE FM 98.5 <accounts@fm985.com.au>'
export const INVOICE_FROM_DOMAIN = 'fm985.com.au'

export type ResendProbe = {
  configured: boolean
  reachable: boolean
  fromDomainVerified: boolean
  domainStatus: string
}

export async function probeResend(apiKey: string | undefined): Promise<ResendProbe> {
  if (!apiKey) {
    return {
      configured: false,
      reachable: false,
      fromDomainVerified: false,
      domainStatus: 'missing_key',
    }
  }

  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (res.status === 401 || res.status === 403) {
      return {
        configured: true,
        reachable: false,
        fromDomainVerified: false,
        domainStatus: `http_${res.status}`,
      }
    }
    if (!res.ok) {
      return {
        configured: true,
        reachable: false,
        fromDomainVerified: false,
        domainStatus: `http_${res.status}`,
      }
    }

    const data = (await res.json()) as {
      data?: Array<{ name?: string; status?: string }>
    }
    const match = (data.data ?? []).find(
      (d) => d.name === INVOICE_FROM_DOMAIN || d.name?.endsWith(`.${INVOICE_FROM_DOMAIN}`),
    )
    const status = match?.status ?? 'missing'
    return {
      configured: true,
      reachable: true,
      fromDomainVerified: status === 'verified',
      domainStatus: status,
    }
  } catch {
    return {
      configured: true,
      reachable: false,
      fromDomainVerified: false,
      domainStatus: 'unreachable',
    }
  }
}
