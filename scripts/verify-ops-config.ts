/**
 * Prove LIVE vs DEMO credential resolution (baked env + Netlify ops-config).
 * Run: node --experimental-strip-types scripts/verify-ops-config.ts
 */
import { readFileSync } from 'node:fs'
import { resolveOpsConfig } from '../src/lib/opsConfigResolve.ts'
import { readFunctionJson } from '../src/lib/readFunctionJson.ts'
import { realBatchInvoices } from '../src/components/ops/data/invoices.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const empty = resolveOpsConfig({})
assert(empty.configured === false, 'empty env must be DEMO')

const placeholder = resolveOpsConfig({
  VITE_SUPABASE_URL: 'https://your-project-id.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'your-anon-key-here',
})
assert(placeholder.configured === false, 'placeholder Vite env must be DEMO')

const inert = resolveOpsConfig({
  VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
  VITE_SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.placeholder',
})
assert(inert.configured === false, 'inert placeholder client must be DEMO')

const secretKey = resolveOpsConfig({
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'sb_secret_not_for_the_browser',
})
assert(secretKey.configured === false, 'sb_secret_ must stay DEMO — never bake the secret key')

const liveVite = resolveOpsConfig({
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.testhash',
})
assert(liveVite.configured === true, 'real Vite env must be LIVE')
if (liveVite.configured) {
  assert(
    liveVite.url === 'https://example.supabase.co',
    'LIVE url must match',
  )
}

const liveServer = resolveOpsConfig({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_testkey_not_real',
})
assert(liveServer.configured === true, 'server-side SUPABASE_* env must be LIVE')

const fnSource = readFileSync(
  new URL('../netlify/functions/ops-config.ts', import.meta.url),
  'utf8',
)
assert(fnSource.includes('resolveOpsConfig'), 'ops-config function uses resolveOpsConfig')
assert(fnSource.includes("httpMethod !== 'GET'"), 'ops-config only serves GET')

const bootSource = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
assert(
  bootSource.includes('initSupabaseFromRuntime'),
  'app boot waits for runtime ops-config before render',
)

const supabaseSource = readFileSync(new URL('../src/lib/supabase.ts', import.meta.url), 'utf8')
assert(
  supabaseSource.includes('/.netlify/functions/ops-config'),
  'supabase client fetches ops-config when Vite env is empty',
)
assert(
  supabaseSource.includes('readFunctionJson'),
  'runtime fetch must ignore SPA HTML fallback via readFunctionJson',
)
assert(
  supabaseSource.includes('__ONEFM_OPS__'),
  'runtime init must read Netlify snippet window.__ONEFM_OPS__',
)
assert(
  supabaseSource.includes("credentialSource = 'snippet'"),
  'runtime init must record snippet as the LIVE credential source',
)

const readFnSource = readFileSync(
  new URL('../src/lib/readFunctionJson.ts', import.meta.url),
  'utf8',
)
assert(
  readFnSource.includes("startsWith('<')"),
  'readFunctionJson must reject SPA HTML fallback',
)

const generatorSource = readFileSync(
  new URL('../src/components/ops/InvoiceGenerator.tsx', import.meta.url),
  'utf8',
)
assert(
  generatorSource.includes('invoices.find((i) => i.id === id)'),
  'Invoice Generator send must look up FOOTT from merged store invoices',
)
assert(
  !generatorSource.includes('localInvoices.find((i) => i.id === id)'),
  'Invoice Generator send must not ignore store invoices',
)

const invoiceSendSource = readFileSync(
  new URL('../src/lib/invoiceSend.ts', import.meta.url),
  'utf8',
)
assert(
  invoiceSendSource.includes('readFunctionJson'),
  'invoice send must not treat SPA HTML as a successful Resend response',
)

const htmlJson = await readFunctionJson(new Response('<!doctype html><html></html>', { status: 200 }))
assert(htmlJson === null, 'HTML 200 must not parse as JSON success')

const okJson = await readFunctionJson<{ success?: boolean }>(
  new Response(JSON.stringify({ success: true }), { status: 200 }),
)
assert(okJson?.success === true, 'JSON success must parse')

const packSource = readFileSync(
  new URL('./pack-drop-zip.mjs', import.meta.url),
  'utf8',
)
assert(packSource.includes('kdl'), 'drop zip must omit unused KDL club logos')
assert(packSource.includes('189,680'), 'drop zip must refuse stale OG HTML')
assert(packSource.includes('netlify.toml'), 'drop zip must include netlify.toml so index.html is not long-cached')

const viteSource = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')
assert(
  viteSource.includes('omitUnusedClubLogos'),
  'production build must omit unused club logo dumps from dist',
)

const emailStatusHook = readFileSync(
  new URL('../src/hooks/useEmailServiceStatus.ts', import.meta.url),
  'utf8',
)
assert(
  emailStatusHook.includes('fromDomainVerified'),
  'email-status hook must not treat an unverified fm985.com.au domain as live send',
)
assert(
  emailStatusHook.includes("'pending'"),
  'email-status hook must not tell Jay to edit DNS while Resend is pending',
)

const gateSource = readFileSync(
  new URL('../public/gov-ready-gate.txt', import.meta.url),
  'utf8',
)
assert(gateSource.includes('og=189680'), 'gov-ready-gate.txt must stamp OG 189680')

const sendInvoiceSource = readFileSync(
  new URL('../netlify/functions/send-invoice.ts', import.meta.url),
  'utf8',
)
assert(sendInvoiceSource.includes('dryRun'), 'send-invoice must support dry-run')
assert(sendInvoiceSource.includes('sent: false'), 'dry-run must report sent:false')
assert(
  sendInvoiceSource.includes("body.dryRun === true"),
  'send-invoice must not email when dryRun is true',
)

const emailStatusSource = readFileSync(
  new URL('../netlify/functions/email-status.ts', import.meta.url),
  'utf8',
)
assert(emailStatusSource.includes('dryRunSupported'), 'email-status must advertise dry-run support')
assert(emailStatusSource.includes('probeResend'), 'email-status must probe Resend without sending')

const probeSource = readFileSync(
  new URL('../netlify/lib/resendProbe.ts', import.meta.url),
  'utf8',
)
assert(
  probeSource.includes('name === INVOICE_FROM_DOMAIN'),
  'Resend LIVE requires apex fm985.com.au — a send. subdomain is not enough for accounts@',
)
assert(
  probeSource.includes('expected'),
  'Resend probe must expose the DNS values Jay has to paste',
)
assert(
  probeSource.includes('cloudflare-dns.com'),
  'Resend probe must compare Resend expected records to live DNS',
)
assert(
  !probeSource.includes("method: 'POST'"),
  'probe must not POST to Resend — that restarts pending and blocks send',
)
assert(
  probeSource.includes('Read-only'),
  'Resend probe must stay read-only so verification can finish',
)

assert(
  invoiceSendSource.includes('readSendResult'),
  'invoice send must ignore dry-run success payloads',
)
assert(
  invoiceSendSource.includes('data.dryRun'),
  'invoice send must not mark dry-run as emailed',
)

assert(
  generatorSource.includes('This will email'),
  'Invoice Generator Send must confirm before emailing FOOTT',
)

const bannerSource = readFileSync(
  new URL('../src/components/ops/EmailServiceBanner.tsx', import.meta.url),
  'utf8',
)
assert(
  bannerSource.includes("status === 'pending'"),
  'ops banner must not ask Jay to change DNS while Resend verification is pending',
)
assert(
  bannerSource.includes('Do not click Verify'),
  'ops banner must not tell Jay to restart Resend verification while pending',
)
assert(
  bannerSource.includes('resend._domainkey'),
  'ops banner must tell Jay to replace the old resend._domainkey TXT',
)
assert(
  bannerSource.includes('Outlook MX'),
  'ops banner must tell Jay not to change the Outlook MX',
)

const foott = realBatchInvoices().find((i) => i.number === 'ONEFM-2026-011')
assert(!!foott, 'FOOTT ONEFM-2026-011 must exist in realBatchInvoices')
assert(foott?.email === 'peter@foott.com.au', 'FOOTT must have peter@foott.com.au')
assert(foott?.total === 5500, 'FOOTT total must be 5500')
assert(foott?.status === 'draft', 'FOOTT must be sendable draft')

if (fail.length) {
  console.error('verify-ops-config failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-ops-config: ok — empty env is DEMO; Netlify env flips LIVE')
