import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/archive/ContributePortal.tsx', import.meta.url), 'utf8')

if (/active preservation project/i.test(src)) {
  throw new Error('leftover active-preservation-project still in ContributePortal')
}
if (/finished monument/i.test(src)) {
  throw new Error('leftover finished-monument still in ContributePortal')
}
if (!/names sourced station history/.test(src)) {
  throw new Error('sourced Living Archive line missing')
}
if (!src.includes('/contact?subject=Living%20Archive%20contribution')) {
  throw new Error('Contact contribution path missing')
}

console.log('verify-archive-not-monument: leftover monument gone; archive names sourced history')
