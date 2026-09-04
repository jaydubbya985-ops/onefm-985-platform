/**
 * Lock: Social Hub Posting Toolkit names Contact, not leftover crisis protocols.
 * Run: npx vite-node scripts/verify-hub-no-crisis.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'

const src = readFileSync(new URL('../src/pages/SocialHub.tsx', import.meta.url), 'utf8')
const honest = `This page does not publish a crisis protocol. Call \${BRAND.phone} or email \${BRAND.email}.`

if (/Crisis Communication/i.test(src)) {
  throw new Error('SocialHub.tsx: leftover Crisis Communication title is back')
}
if (/Protocols for sensitive situations/i.test(src)) {
  throw new Error('SocialHub.tsx: leftover crisis protocol copy is back')
}
if (!src.includes(honest)) {
  throw new Error(`SocialHub.tsx: missing honest Contact line (${BRAND.phone} / ${BRAND.email})`)
}

console.log('verify-hub-no-crisis: ok')
