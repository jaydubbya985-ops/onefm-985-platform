/**
 * Prove a failed DNS lookup is not dressed as SiteGround DNS being wrong.
 * Run: npx vite-node scripts/verify-dns-check.ts
 */
import { readFileSync } from 'node:fs'
import { probeResend } from '../netlify/lib/resendProbe.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const APEX = 'fm985.com.au'
const EXPECTED_TXT = 'v=spf1 include:amazonses.com ~all'
const EXPECTED_MX = 'feedback-smtp.ap-southeast-2.amazonses.com'

function jsonRes(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function installFetch(impl: (url: string) => Promise<Response> | Response): () => void {
  const prior = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    return impl(url)
  }) as typeof fetch
  return () => {
    globalThis.fetch = prior
  }
}

const source = readFileSync(new URL('../netlify/lib/resendProbe.ts', import.meta.url), 'utf8')
assert(source.includes('dnsOk'), 'records must mark whether the DNS lookup finished')
assert(source.includes('lookup failed'), 'failed DoH must not look like an empty zone')
assert(source.includes('Cloudflare DNS lookup failed'), 'needJay must name the failed check')
assert(source.includes('Resend API did not answer'), 'Resend outage must not ask for SiteGround paste')
assert(!source.includes("needJay: APEX_DNS_FIX"), 'Resend/network failure must not reuse the SiteGround paste line')

const missing = await probeResend(undefined)
assert(missing.configured === false, 'missing key stays not configured')
assert(missing.needJay?.includes('RESEND_API_KEY') === true, 'missing key asks for the Netlify secret')

{
  const restore = installFetch((url) => {
    if (url.includes('api.resend.com/domains')) return jsonRes(502, { message: 'bad gateway' })
    throw new Error(`unexpected fetch ${url}`)
  })
  const probe = await probeResend('re_test_key')
  restore()
  assert(probe.reachable === false, 'Resend 502 is not reachable')
  assert(probe.needJay?.includes('Resend API did not answer') === true, 'Resend 502 must not ask to paste DNS')
  assert(!probe.needJay?.includes('Paste'), 'Resend 502 needJay must not say Paste')
}

{
  const restore = installFetch((url) => {
    if (url.includes('api.resend.com/domains/') && !url.endsWith('/domains')) {
      return jsonRes(200, {
        status: 'pending',
        capabilities: { sending: 'disabled' },
        records: [
          { record: 'SPF', name: APEX, type: 'TXT', status: 'pending', value: EXPECTED_TXT },
          { record: 'MX', name: 'send', type: 'MX', status: 'pending', value: EXPECTED_MX, priority: 10 },
        ],
      })
    }
    if (url.includes('api.resend.com/domains')) {
      return jsonRes(200, { data: [{ id: 'dom_1', name: APEX, status: 'pending' }] })
    }
    if (url.includes('cloudflare-dns.com')) {
      return jsonRes(502, { error: 'doh down' })
    }
    throw new Error(`unexpected fetch ${url}`)
  })
  const probe = await probeResend('re_test_key')
  restore()
  assert(probe.reachable === true, 'Resend list succeeded — reachable')
  assert(probe.fromDomainVerified === false, 'pending apex is not verified')
  assert(probe.stationDomains[0]?.records.every((r) => r.dnsOk === false) === true, 'DoH 502 marks dnsOk false')
  assert(probe.needJay?.includes('Cloudflare DNS lookup failed') === true, 'DoH 502 must not ask to paste SiteGround')
  assert(!probe.needJay?.includes('Paste'), 'DoH 502 needJay must not say Paste')
  assert(!probe.needJay?.includes('SiteGround DNS for fm985.com.au'), 'DoH 502 must not use the paste-SiteGround line')
}

{
  const restore = installFetch((url) => {
    if (url.includes('api.resend.com/domains/') && !url.endsWith('/domains')) {
      return jsonRes(200, {
        status: 'pending',
        capabilities: { sending: 'disabled' },
        records: [{ record: 'SPF', name: APEX, type: 'TXT', status: 'pending', value: EXPECTED_TXT }],
      })
    }
    if (url.includes('api.resend.com/domains')) {
      return jsonRes(200, { data: [{ id: 'dom_1', name: APEX, status: 'pending' }] })
    }
    if (url.includes('cloudflare-dns.com')) {
      return jsonRes(200, { Status: 3, Answer: [] })
    }
    throw new Error(`unexpected fetch ${url}`)
  })
  const probe = await probeResend('re_test_key')
  restore()
  assert(probe.stationDomains[0]?.records[0]?.dnsOk === true, 'NXDOMAIN is a finished lookup')
  assert(probe.stationDomains[0]?.records[0]?.matches === false, 'empty NXDOMAIN does not match')
  assert(probe.needJay?.includes('Paste') === true, 'finished miss still asks Jay to paste SiteGround')
}

{
  const restore = installFetch((url) => {
    if (url.includes('api.resend.com/domains/') && !url.endsWith('/domains')) {
      return jsonRes(200, {
        status: 'verified',
        capabilities: { sending: 'enabled' },
        records: [{ record: 'SPF', name: APEX, type: 'TXT', status: 'verified', value: EXPECTED_TXT }],
      })
    }
    if (url.includes('api.resend.com/domains')) {
      return jsonRes(200, { data: [{ id: 'dom_1', name: APEX, status: 'verified' }] })
    }
    if (url.includes('cloudflare-dns.com')) {
      return jsonRes(200, { Status: 0, Answer: [{ data: `"${EXPECTED_TXT}"` }] })
    }
    throw new Error(`unexpected fetch ${url}`)
  })
  const probe = await probeResend('re_test_key')
  restore()
  assert(probe.fromDomainVerified === true, 'verified apex stays verified')
  assert(probe.needJay === null, 'verified apex has no NEED JAY')
  assert(probe.stationDomains[0]?.records[0]?.matches === true, 'matching TXT is a hit')
  assert(probe.stationDomains[0]?.records[0]?.dnsOk === true, 'matching TXT finished the lookup')
}

{
  const restore = installFetch(() => {
    throw new Error('network down')
  })
  const probe = await probeResend('re_test_key')
  restore()
  assert(probe.reachable === false, 'thrown fetch is unreachable')
  assert(probe.needJay?.includes('Resend API did not answer') === true, 'thrown fetch must not ask to paste DNS')
  assert(!probe.needJay?.includes('Paste'), 'thrown fetch needJay must not say Paste')
}

if (fail.length) {
  console.error('verify-dns-check FAILED')
  for (const msg of fail) console.error(' -', msg)
  process.exit(1)
}

console.log('verify-dns-check OK')
console.log('  Resend 502 → retry, not paste SiteGround')
console.log('  DoH 502 → lookup failed, not paste SiteGround')
console.log('  NXDOMAIN → finished miss, still paste')
console.log('  verified + matching TXT → no NEED JAY')
console.log('  thrown fetch → Resend unreachable, not paste')
