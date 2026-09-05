/**
 * Lock: Social Hub marquee counts TEMPLATES.length,
 * not leftover invented "24 CONTENT TEMPLATES".
 * Run: npx vite-node scripts/verify-hub-not-24.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SocialHub.tsx', import.meta.url), 'utf8')

if (/24 CONTENT TEMPLATES/.test(src)) {
  throw new Error('SocialHub.tsx: leftover 24 CONTENT TEMPLATES is back')
}

if (!src.includes('{TEMPLATES.length} CONTENT TEMPLATES')) {
  throw new Error('SocialHub.tsx: marquee must print TEMPLATES.length, not a leftover invented 24')
}

const listed = [...src.matchAll(/name: '([^']+)', platform:/g)]
if (listed.length < 1) {
  throw new Error('SocialHub.tsx: TEMPLATES rows must stay')
}

// Stay: leftover Content Tools / amplify / Campaign Calendar are other desks
if (!src.includes('campaign tools')) {
  throw new Error('SocialHub.tsx: leftover campaign tools must stay (do not steal #409)')
}
if (!src.includes('amplify ONE FM')) {
  throw new Error('SocialHub.tsx: leftover amplify must stay (leftover Content Tools)')
}
if (!src.includes('CAMPAIGN CALENDAR TOOLS')) {
  throw new Error('SocialHub.tsx: leftover CAMPAIGN CALENDAR TOOLS must stay (do not steal #413)')
}

console.log(`verify-hub-not-24: ok (${listed.length} TEMPLATES rows)`)
