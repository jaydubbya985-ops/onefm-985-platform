/**
 * Heritage contribute CTA must open an email draft — leftover /contact?subject=
 * was never read by Contact.tsx, and that form cannot take attachments.
 * Run: npx vite-node scripts/verify-archive-mail.ts
 */
import { readFileSync } from 'node:fs'
import { livingArchiveMailto } from '../src/lib/archiveMail'
import { BRAND } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-archive-mail FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync('src/components/archive/ContributePortal.tsx', 'utf8')
assert(!src.includes('/contact?subject='), 'leftover Contact subject query must be gone')
assert(!src.includes('Living%20Archive%20contribution'), 'leftover encoded subject query must be gone')
assert(src.includes('livingArchiveMailto'), 'contribute CTA must use the mailto helper')
assert(src.includes('Nothing reaches the station until you hit send'), 'must say the draft is unsent')
assert(!src.includes('formatCoverageShort'), 'do not stamp coverage onto the contribute portal')
assert(!src.includes('BREAKFAST'), 'do not stamp breakfast onto the contribute portal')
assert(!src.includes('GVL hours'), 'do not stamp GVL hours onto the contribute portal')

const href = livingArchiveMailto()
assert(href.startsWith(`mailto:${BRAND.email}?`), `mailto must target ${BRAND.email}, got ${href}`)
assert(href.includes(encodeURIComponent('Living Archive contribution')), 'subject must name Living Archive')
assert(href.includes(encodeURIComponent('photo')), 'body must mention a photo attachment')

console.log('verify-archive-mail OK')
