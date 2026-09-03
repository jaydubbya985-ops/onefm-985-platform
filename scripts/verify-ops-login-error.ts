/**
 * Fail if a sign-in network miss is dressed as a wrong password.
 * Run: npx vite-node scripts/verify-ops-login-error.ts
 */
import { readFileSync } from 'node:fs'
import { opsLoginFailureNote } from '../src/lib/opsLoginError'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-ops-login-error FAIL: ${message}`)
    process.exit(1)
  }
}

const wrong = opsLoginFailureNote(new Error('Invalid login credentials'))
assert(wrong === 'Invalid email or password.', `bad password: ${wrong}`)

const fetchMiss = opsLoginFailureNote(new Error('Failed to fetch'))
assert(
  /not a wrong password/i.test(fetchMiss),
  `fetch miss must not look like a bad password: ${fetchMiss}`,
)
assert(/could not reach sign-in/i.test(fetchMiss), `fetch miss: ${fetchMiss}`)

const abort = opsLoginFailureNote(new Error('AbortError: The user aborted a request.'))
assert(/not a wrong password/i.test(abort), `abort: ${abort}`)

const timeout = opsLoginFailureNote(new Error('Timeout'))
assert(/not a wrong password/i.test(timeout), `timeout: ${timeout}`)

const offline = opsLoginFailureNote({ message: 'NetworkError when attempting to fetch resource.', status: 0 })
assert(/not a wrong password/i.test(offline), `status 0: ${offline}`)

const hook = readFileSync(new URL('../src/hooks/useOpsAccess.ts', import.meta.url), 'utf8')
assert(hook.includes('opsLoginFailureNote'), 'staff login must classify the error')
assert(!/catch \{\s*return false/.test(hook), 'do not swallow the sign-in error')

const gate = readFileSync(new URL('../src/components/OpsRouteGuard.tsx', import.meta.url), 'utf8')
assert(gate.includes('result.error'), 'LIVE gate must show the classified note')
assert(
  !/if \(!ok\) setError\('Invalid email or password\.'\)/.test(gate),
  'do not hard-code wrong-password on every failure',
)

console.log('verify-ops-login-error OK')
console.log('fetch miss:', fetchMiss)
console.log('bad password:', wrong)
