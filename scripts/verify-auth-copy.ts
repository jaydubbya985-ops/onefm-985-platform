/**
 * Fail the build if staff auth copy invents a delivered email.
 * Run: npx vite-node scripts/verify-auth-copy.ts
 */
import {
  AUTH_UNAVAILABLE,
  resetPendingCopy,
  resetRequestedToast,
  signupRequestedToast,
} from '../src/lib/authCopy'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-auth-copy FAIL: ${message}`)
    process.exit(1)
  }
}

function noSent(label: string, text: string) {
  assert(!/\bsent\b/i.test(text), `${label} must not say sent: ${text}`)
  assert(!/on its way/i.test(text), `${label} must not invent delivery: ${text}`)
}

noSent('AUTH_UNAVAILABLE', AUTH_UNAVAILABLE)
assert(AUTH_UNAVAILABLE.includes('DEMO'), AUTH_UNAVAILABLE)
assert(AUTH_UNAVAILABLE.includes('not emailed'), AUTH_UNAVAILABLE)

noSent('resetRequestedToast', resetRequestedToast())
assert(resetRequestedToast().includes('not a delivery receipt'), resetRequestedToast())

noSent('signupRequestedToast', signupRequestedToast())
assert(signupRequestedToast().includes('requested'), signupRequestedToast())

const pending = resetPendingCopy('jay@fm985.com.au')
noSent('resetPendingCopy', pending)
assert(pending.includes('jay@fm985.com.au'), pending)
assert(pending.includes('not proof'), pending)

console.log('verify-auth-copy OK')
console.log(
  JSON.stringify(
    {
      unavailable: AUTH_UNAVAILABLE,
      resetToast: resetRequestedToast(),
      signupToast: signupRequestedToast(),
      pending,
    },
    null,
    2,
  ),
)
