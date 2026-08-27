/**
 * Prove LIVE vs DEMO credential resolution (baked env + Netlify ops-config).
 * Run: node --experimental-strip-types scripts/verify-ops-config.ts
 */
import { readFileSync } from 'node:fs'
import { resolveOpsConfig } from '../src/lib/opsConfigResolve.ts'
import { readFunctionJson } from '../src/lib/readFunctionJson.ts'

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

const liveVite = resolveOpsConfig({
  VITE_SUPABASE_URL: 'https://myarjdatdtchmkgdpsab.supabase.co',
  VITE_SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.testhash',
})
assert(liveVite.configured === true, 'real Vite env must be LIVE')
if (liveVite.configured) {
  assert(
    liveVite.url === 'https://myarjdatdtchmkgdpsab.supabase.co',
    'LIVE url must match',
  )
}

const liveServer = resolveOpsConfig({
  SUPABASE_URL: 'https://myarjdatdtchmkgdpsab.supabase.co',
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

if (fail.length) {
  console.error('verify-ops-config failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-ops-config: ok — empty env is DEMO; Netlify env flips LIVE')
