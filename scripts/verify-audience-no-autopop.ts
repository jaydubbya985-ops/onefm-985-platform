/**
 * Audience leftover promised Radio.co would auto-populate the dashboard.
 * Gov-truth: stream analytics stay data pending until they exist.
 *
 * Run: npx vite-node scripts/verify-audience-no-autopop.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/AudienceAnalytics.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/auto-populate/i.test(src), 'Audience must not invent leftover Radio.co auto-populate')
assert(
  src.includes('Live Radio.co stream analytics: data pending'),
  'Audience must name Radio.co analytics as data pending',
)

if (fail.length) {
  console.error('verify-audience-no-autopop failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-audience-no-autopop: ok')
