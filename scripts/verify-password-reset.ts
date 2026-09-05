/**
 * Fail the build if password reset still uses leftover HashRouter-blind /reset-password
 * without a hoist, or claims the mail was sent.
 * Run: npx vite-node scripts/verify-password-reset.ts
 */
import { readFileSync } from 'node:fs'
import { passwordResetRedirectUrl, hoistPasswordResetPath, PASSWORD_RESET_PATH, PASSWORD_RESET_HASH } from '../src/lib/authUrls'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-password-reset FAIL: ${message}`)
    process.exit(1)
  }
}

assert(passwordResetRedirectUrl({ origin: 'https://onefmops.netlify.app' }) === 'https://onefmops.netlify.app/reset-password', 'redirectTo must be a path so ?code= stays on the origin')

const calls: string[] = []
const hoisted = hoistPasswordResetPath({
  pathname: PASSWORD_RESET_PATH,
  search: '?code=abc',
  origin: 'https://onefmops.netlify.app',
  replace: (url) => {
    calls.push(url)
  },
})
assert(hoisted === true, 'reset path must hoist')
assert(calls[0] === `https://onefmops.netlify.app/?code=abc${PASSWORD_RESET_HASH}`, `hoist URL: ${calls[0]}`)
assert(hoistPasswordResetPath({
  pathname: '/',
  search: '',
  origin: 'https://onefmops.netlify.app',
  replace: () => {
    throw new Error('must not replace Home')
  },
}) === false, 'Home must not hoist')

const auth = readFileSync('src/hooks/useAuth.ts', 'utf8')
assert(auth.includes('passwordResetRedirectUrl'), 'useAuth must use passwordResetRedirectUrl')
assert(!auth.includes("origin}/reset-password`"), 'leftover origin+/reset-password without helper')

const modal = readFileSync('src/components/AuthModal.tsx', 'utf8')
assert(!/Password reset link sent/i.test(modal), 'AuthModal must not claim the link was sent')

const gate = readFileSync('src/components/OpsRouteGuard.tsx', 'utf8')
assert(gate.includes('cannot confirm the mail was sent'), 'ops gate must not invent a sent state')

const main = readFileSync('src/main.tsx', 'utf8')
assert(main.includes('hoistPasswordResetPath'), 'main must hoist /reset-password onto the hash route')

console.log('verify-password-reset OK')
