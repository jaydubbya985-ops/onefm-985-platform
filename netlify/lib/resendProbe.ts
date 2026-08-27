/**
 * Probe Resend without sending mail. Used by email-status (GET) and
 * send-invoice dry-run. Never returns the API key or unrelated domains.
 *
 * FROM is accounts@fm985.com.au — only the apex domain counts as verified.
 * A verified send.fm985.com.au subdomain is not enough.
 *
 * Read-only: do not restart Resend domain verification from this probe. Resend
 * marks the domain pending on every restart, which is why status was stuck.
 */

export const INVOICE_FROM = 'ONE FM 98.5 <accounts@fm985.com.au>'
export const INVOICE_FROM_DOMAIN = 'fm985.com.au'

export type StationDomainRecord = {
  record: string
  name: string
  type: string
  status: string
  expected: string
  dns: string
  matches: boolean
  priority?: number
}

export type StationDomain = {
  name: string
  status: string
  records: StationDomainRecord[]
  sending?: string
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
  'NEED JAY: SiteGround DNS for fm985.com.au — paste the expected values from email-status stationDomains[0].records (TXT resend._domainkey, MX send, TXT send). Do not change the apex Outlook MX.'

function isStationDomain(name: string | undefined): boolean {
  if (!name) return false
  return name === INVOICE_FROM_DOMAIN || name.endsWith(`.${INVOICE_FROM_DOMAIN}`)
}

function fqdn(recordName: string, domain: string): string {
  if (recordName === domain || recordName.endsWith(`.${domain}`)) return recordName
  return `${recordName}.${domain}`
}

function stripDnsTxt(value: string): string {
  return value
    .replace(/^"|"$/g, '')
    .replace(/\\"/g, '"')
    .replace(/\s+/g, '')
    .trim()
}

function normalizeExpected(value: string, type: string): string {
  const raw = value.replace(/^"|"$/g, '').trim()
  if (type === 'TXT') return stripDnsTxt(raw)
  return raw.replace(/\.$/, '').toLowerCase()
}

async function lookupDns(name: string, type: 'TXT' | 'MX'): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/dns-json' } })
    if (!res.ok) return []
    const data = (await res.json()) as { Answer?: Array<{ data?: string }> }
    return (data.Answer ?? [])
      .map((a) => (a.data ?? '').trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

async function dnsForRecord(
  domain: string,
  rec: { name?: string; type?: string; value?: string; priority?: number },
): Promise<{ dns: string; matches: boolean }> {
  const host = fqdn(rec.name ?? '', domain)
  const type = rec.type === 'MX' ? 'MX' : 'TXT'
  const answers = await lookupDns(host, type)
  const expected = rec.value ?? ''
  const expectedNorm = normalizeExpected(expected, type)

  if (type === 'MX') {
    const hosts = answers.map((a) => {
      const parts = a.split(/\s+/)
      return (parts[parts.length - 1] ?? '').replace(/\.$/, '').toLowerCase()
    })
    const match = hosts.includes(expectedNorm)
    return { dns: hosts.join(' | ') || '(none)', matches: match }
  }

  const txts = answers.map(stripDnsTxt)
  const match = txts.some((t) => t === expectedNorm || t.includes(expectedNorm) || expectedNorm.includes(t))
  return { dns: answers.join(' | ') || '(none)', matches: match }
}

async function fetchDomainDetail(
  apiKey: string,
  id: string,
): Promise<{
  status: string
  sending: string
  records: Array<{ record?: string; name?: string; type?: string; status?: string; value?: string; priority?: number }>
}> {
  const res = await fetch(`https://api.resend.com/domains/${id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return { status: '', sending: '', records: [] }
  const data = (await res.json()) as {
    status?: string
    capabilities?: { sending?: string }
    records?: Array<{ record?: string; name?: string; type?: string; status?: string; value?: string; priority?: number }>
  }
  return {
    status: data.status ?? '',
    sending: data.capabilities?.sending ?? '',
    records: data.records ?? [],
  }
}

function needJayFrom(apex: StationDomain | undefined): string {
  if (!apex) return APEX_DNS_FIX
  const failed = apex.records.filter((r) => !r.matches)
  if (failed.length === 0) {
    return 'NEED JAY: DNS matches Resend — wait. Do not click Verify again (that restarts pending). Do not change Outlook MX.'
  }
  const lines = failed.map((r) => {
    const prio = r.type === 'MX' && r.priority != null ? ` priority ${r.priority}` : ''
    return `${r.type} ${r.name}${prio} → ${r.expected}`
  })
  return `NEED JAY: SiteGround DNS for fm985.com.au (do not change Outlook MX). Paste:\n${lines.join('\n')}`
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
      if (!d.id || !d.name) continue
      const detail = await fetchDomainDetail(apiKey, d.id)
      const records: StationDomainRecord[] = []
      for (const r of detail.records) {
        const seen = await dnsForRecord(d.name, r)
        records.push({
          record: r.record ?? '',
          name: r.name ?? '',
          type: r.type ?? '',
          status: r.status ?? '',
          expected: (r.value ?? '').replace(/^"|"$/g, ''),
          dns: seen.dns,
          matches: seen.matches,
          priority: r.priority,
        })
      }
      stationDomains.push({
        name: d.name,
        status: detail.status || d.status || '',
        sending: detail.sending,
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
      needJay: fromDomainVerified ? null : needJayFrom(apex),
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
