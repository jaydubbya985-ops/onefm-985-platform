/**
 * Fail if the SoundCloud panel still invents leftover interview archive.
 * Run: npx vite-node scripts/verify-soundcloud-not-archive.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-soundcloud-not-archive FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/social/SoundCloudPanel.tsx', import.meta.url), 'utf8')

assert(!/title="Interview Archive"/.test(src), 'leftover invented interview-archive still in SoundCloudPanel')
assert(/title="fm985\.com\.au interviews"/.test(src), 'sourced fm985 interviews title missing')
assert(/eyebrow="ON DEMAND"/.test(src), 'do not restamp leftover on-demand on the eyebrow')
assert(/check back after the next broadcast/.test(src), 'do not restamp leftover check-back on the empty state')

console.log('verify-soundcloud-not-archive: leftover interview-archive gone; title names fm985.com.au')
