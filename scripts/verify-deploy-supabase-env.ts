/**
 * Prove production deploy no longer feeds leftover Cloud-shaped Supabase
 * secrets into Vite. Run: npx vite-node scripts/verify-deploy-supabase-env.ts
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const workflow = readFileSync(resolve('.github/workflows/deploy.yml'), 'utf8')
const sanitizer = readFileSync(resolve('scripts/sanitize-vite-supabase-env.mjs'), 'utf8')

assert(
  !workflow.includes('VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}'),
  'deploy.yml leftover: secrets.VITE_SUPABASE_URL must not map straight onto the Vite build',
)
assert(
  !workflow.includes('VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}'),
  'deploy.yml leftover: secrets.VITE_SUPABASE_ANON_KEY must not map straight onto the Vite build',
)
assert(
  workflow.includes('CANDIDATE_SUPABASE_URL'),
  'deploy.yml must park GitHub secrets on CANDIDATE_SUPABASE_URL',
)
assert(
  workflow.includes('CANDIDATE_SUPABASE_ANON_KEY'),
  'deploy.yml must park GitHub secrets on CANDIDATE_SUPABASE_ANON_KEY',
)
assert(
  workflow.includes('scripts/sanitize-vite-supabase-env.mjs'),
  'deploy.yml must run sanitize-vite-supabase-env.mjs before npm run build',
)
assert(
  sanitizer.includes('sb_secret_') && sanitizer.includes('sb_publishable_'),
  'sanitizer must reject sb_secret_ and accept sb_publishable_',
)
assert(
  !sanitizer.includes('console.log(url)') && !sanitizer.includes('console.log(key)'),
  'sanitizer must not print credential values to the log',
)

function sanitize(env: Record<string, string>): { url: string; key: string; notice: string } {
  const out = execFileSync('node', ['scripts/sanitize-vite-supabase-env.mjs'], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  })
  const lines = out.split('\n')
  const url = (lines.find((l) => l.startsWith('VITE_SUPABASE_URL=')) || '').slice('VITE_SUPABASE_URL='.length)
  const key = (lines.find((l) => l.startsWith('VITE_SUPABASE_ANON_KEY=')) || '').slice(
    'VITE_SUPABASE_ANON_KEY='.length,
  )
  return { url, key, notice: out }
}

const leftover = sanitize({
  CANDIDATE_SUPABASE_URL: 'leftoverrefonly123456',
  CANDIDATE_SUPABASE_ANON_KEY: 'sb_secret_not_for_the_browser',
})
assert(leftover.url === '', 'leftover project-ref-only URL must be unset for Vite')
assert(leftover.key === '', 'leftover sb_secret_ must be unset for Vite')

const leftoverViteNamed = sanitize({
  VITE_SUPABASE_URL: 'leftoverrefonly123456',
  VITE_SUPABASE_ANON_KEY: 'sb_secret_not_for_the_browser',
})
assert(leftoverViteNamed.url === '', 'leftover VITE_SUPABASE_URL project-ref must be unset')
assert(leftoverViteNamed.key === '', 'leftover VITE_SUPABASE_ANON_KEY sb_secret_ must be unset')

const liveUrl = 'https://exampleref1234567890.supabase.co'
const liveKey = 'sb_publishable_testkey_not_real'
const live = sanitize({
  CANDIDATE_SUPABASE_URL: liveUrl,
  CANDIDATE_SUPABASE_ANON_KEY: liveKey,
})
assert(live.url === liveUrl, 'LIVE Project URL must pass through')
assert(live.key === liveKey, 'LIVE publishable key must pass through')

const jwt = sanitize({
  CANDIDATE_SUPABASE_URL: liveUrl,
  CANDIDATE_SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.testhash',
})
assert(jwt.url === liveUrl, 'LIVE eyJ anon JWT must keep the URL')
assert(jwt.key.startsWith('eyJ'), 'LIVE eyJ anon JWT must pass through')

if (fail.length) {
  console.error(fail.map((m) => `FAIL ${m}`).join('\n'))
  process.exit(1)
}
console.log('verify-deploy-supabase-env: leftover Cloud shapes stay out of the Vite bundle')
