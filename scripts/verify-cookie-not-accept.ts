/**
 * CookieConsent leftover invented Accept — lock.
 * Run: npx vite-node scripts/verify-cookie-not-accept.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/CookieConsent.tsx', import.meta.url), 'utf8')

const leftoverAccept = /data-cursor-label="ACCEPT"/.test(src) || />\s*Accept\s*</.test(src)
const honest = src.includes('Got it') && src.includes('not a tracking opt-in')

if (leftoverAccept || !honest) {
  console.error(
    'verify-cookie-not-accept: leftover Accept invents a tracking opt-in — name a local preference',
  )
  process.exit(1)
}

console.log('verify-cookie-not-accept: ok')
