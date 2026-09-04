/**
 * Programs breakfast card names rotating hosts from the weekly guide —
 * not leftover invented "essential morning companion".
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/pages/Programs.tsx'), 'utf8')

if (/essential morning companion/i.test(src)) {
  throw new Error(
    'Programs breakfast card still invents leftover essential morning companion',
  )
}

if (!src.includes('Rotating weekday hosts')) {
  throw new Error('Programs breakfast card must name rotating weekday hosts')
}

if (!src.includes('from the weekly guide')) {
  throw new Error('Programs breakfast card must source copy from the weekly guide')
}

console.log('verify-programs-not-essential: ok')
