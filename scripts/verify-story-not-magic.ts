/**
 * Fail if the public story page still sells leftover “magic happens” / live-on-air
 * theatre over a station archive still.
 * Run: npx vite-node scripts/verify-story-not-magic.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Story.tsx', import.meta.url), 'utf8')

if (/Where the magic happens/i.test(src)) {
  console.error('verify-story-not-magic FAIL: leftover magic-happens copy on Story')
  process.exit(1)
}
if (/Live On Air/.test(src)) {
  console.error('verify-story-not-magic FAIL: leftover Live On Air heading on Story studio still')
  process.exit(1)
}
if (!src.includes('Shepparton studio')) {
  console.error('verify-story-not-magic FAIL: missing honest Shepparton studio heading')
  process.exit(1)
}
if (!src.includes('Archive still of the presenter desk')) {
  console.error('verify-story-not-magic FAIL: missing honest archive-still line')
  process.exit(1)
}

console.log('verify-story-not-magic: ok')
