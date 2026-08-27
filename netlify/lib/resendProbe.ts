/**
 * Probe Resend without sending mail. Used by email-status (GET) and
 * send-invoice dry-run. Never returns the API key or unrelated domains.
 *
 * FROM is accounts@fm985.com.au — only the apex domain counts as verified.
 * A verified send.fm985.com.au subdomain is not enough.
 */

export const INVOICE_FROM = 'ONE FM 98.5 <accounts@fm985.com.au>'
export const INVOICE_FROM_DOMAIN = 'fm985.com.au'

export type StationDomainRecord = {
  record: string
  name: string
  type: string
  status: string
}

export type StationDomain = {
  name: string
  status: string
  records: StationDomainRecord[]
}

export type ResendProbe = {
  configured: boolean
  reachable: boolean
  fromDomainVerified: boolean
  domainStatus: string
  stationDomains: StationDomain[]
  needJay: string | null
}

const APEX_DNS_FIX =
  'NEED JAY: SiteGround DNS for fm985.com.au — open Resend → Domains → fm985.com.au and copy the three records over the existing ones (Resend marks them failed). TXT resend._domainkey (replace the old key), MX send (must match Resend’s feedback-smtp host), TXT send (SPF). Do not change the apex Outlook MX.'

function isStationDomain(name: string | undefined): boolean {
  if (!name) return false
  return name === INVOICE_FROM_DOMAIN || name.endsWith(`.${INVOICE_FROM_DOMAIN}`)
}

async function fetchDomainRecords(
  apiKey: string,
  id: string,
): Promise<StationDomainRecord[]> {
  try {
    const res = await fetch(`https://api.resend.com/domains/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      records?: Array<{ record?: string; name?: string; type?: string; status?: string }>
    }
    return (data.records ?? []).map((r) => ({
      record: r.record ?? '',
      name: r.name ?? '',
      type: r.type ?? '',
      status: r.status ?? '',
    }))
  } catch {
    return []
  }
}

export async function probeResend(apiKey: string | undefined): Promise<ResendProbe> {
  if (!apiKey) {
    return {
      configured: false,
      reachable: false,
      fromDomainVerified: false,
      domainStatus: 'missing_key',
      stationDomains: [],
      needJay: 'NEED JAY: add RESEND_API_KEY on Netlify (Site settings → Environment variables).',
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
        stationDomains: [],
        needJay: 'NEED JAY: Resend API key was rejected — paste a valid key on Netlify.',
      }
    }
    if (!res.ok) {
      return {
        configured: true,
        reachable: false,
        fromDomainVerified: false,
        domainStatus: `http_${res.status}`,
        stationDomains: [],
        needJay: APEX_DNS_FIX,
      }
    }

    const data = (await res.json()) as {
      data?: Array<{ id?: string; name?: string; status?: string }>
    }
    const listed = (data.data ?? []).filter((d) => isStationDomain(d.name))

    const stationDomains: StationDomain[] = []
    for (const d of listed) {
      const records = d.id ? await fetchDomainRecords(apiKey, d.id) : []
      stationDomains.push({
        name: d.name ?? '',
        status: d.status ?? '',
        records,
      })
    }

    const apex = stationDomains.find((d) => d.name === INVOICE_FROM_DOMAIN)
    const status = apex?.status ?? 'missing'
    const fromDomainVerified = status === 'verified'

    return {
      configured: true,
      reachable: true,
      fromDomainVerified,
      domainStatus: status,
      stationDomains,
      needJay: fromDomainVerified ? null : APEX_DNS_FIX,
    }
  } catch {
    return {
      configured: true,
      reachable: false,
      fromDomainVerified: false,
      domainStatus: 'unreachable',
      stationDomains: [],
      needJay: APEX_DNS_FIX,
    }
  }
}
