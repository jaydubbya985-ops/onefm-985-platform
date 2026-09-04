/**
 * Lock: Social Hub names media-kit tokens, not leftover voice guidelines.
 * Run: npx vite-node scripts/verify-hub-not-voice.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SocialHub.tsx', import.meta.url), 'utf8')

if (/The ONE FM Voice/.test(src)) {
  throw new Error('SocialHub.tsx: leftover The ONE FM Voice title is back')
}
if (/personality guidelines for all social content/i.test(src)) {
  throw new Error('SocialHub.tsx: leftover personality-guidelines copy is back')
}
if (!src.includes('does not publish tone or personality guidelines')) {
  throw new Error('SocialHub.tsx: missing honest no-voice-guide line')
}
if (!src.includes("path: '/media-kit'")) {
  throw new Error('SocialHub.tsx: brand-tokens card must still open the media kit')
}

console.log('verify-hub-not-voice: ok')
