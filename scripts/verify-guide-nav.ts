/**
 * Fail the build if Listen nav still bounces Program Guide to /listen.
 * Run: npx vite-node scripts/verify-guide-nav.ts
 */
import { HOME_JOBS, NAV_GROUPS, FOOTER_LISTEN, FOOTER_RESOURCES } from '../src/lib/siteNav'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-guide-nav FAIL: ${message}`)
    process.exit(1)
  }
}

const listenGroup = NAV_GROUPS.find((g) => g.label === 'Listen')
const guide = listenGroup?.items.find((i) => i.label === 'Program Guide')
assert(guide?.path === '/programs', `Listen dropdown Program Guide must be /programs, got ${guide?.path}`)

const listenLive = listenGroup?.items.find((i) => i.label === 'Listen Live')
assert(listenLive?.path === '/listen', 'Listen Live must stay /listen')

const programsJob = HOME_JOBS.find((j) => j.label === 'Programs')
assert(programsJob?.path === '/programs', `HOME_JOBS Programs must be /programs, got ${programsJob?.path}`)

const footerGuide = FOOTER_LISTEN.find((i) => i.label === 'Program Guide')
assert(footerGuide?.path === '/programs', `Footer Listen Program Guide must be /programs, got ${footerGuide?.path}`)

const resourcesGuide = FOOTER_RESOURCES.find((i) => i.label === 'Program Guide')
assert(resourcesGuide?.path === '/programs', 'Footer resources Program Guide must stay /programs')

console.log('verify-guide-nav OK')
