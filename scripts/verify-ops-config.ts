/**
 * Prove LIVE vs DEMO credential resolution (baked env + Netlify ops-config).
 * Run: node --experimental-strip-types scripts/verify-ops-config.ts
 */
import { readFileSync } from 'node:fs'
import { resolveOpsConfig } from '../src/lib/opsConfigResolve.ts'

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

if (fail.length) {
  console.error('verify-ops-config failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-ops-config: ok — empty env is DEMO; Netlify env flips LIVE')
