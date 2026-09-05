/**
 * Fail if the valley weather cycle still slides towns under reduced motion.
 * Run: npx vite-node scripts/verify-weather-still.ts
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { shouldCycleWeather } from '../src/hooks/useWeatherCycle'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-weather-still FAIL: ${message}`)
    process.exit(1)
  }
}

assert(shouldCycleWeather(6, false) === true, 'motion allowed: cycle the hub/major towns')
assert(shouldCycleWeather(6, true) === false, 'prefers-reduced-motion: stay on the studio town')
assert(shouldCycleWeather(6, null) === false, 'unknown motion preference: do not start a slideshow')
assert(shouldCycleWeather(1, false) === false, 'single town (nav Shepparton) never cycles')
assert(shouldCycleWeather(0, false) === false, 'empty list never cycles')

const here = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(here, '../src/hooks/useWeatherCycle.ts'), 'utf8')
assert(src.includes("matchMedia('(prefers-reduced-motion: reduce)')"), 'hook must read prefers-reduced-motion')
assert(src.includes('shouldCycleWeather(locations.length, reducedMotion)'), 'interval must go through shouldCycleWeather')
assert(!src.includes('useReducedMotion'), 'use native matchMedia — do not depend on framer-motion for this gate')

console.log('verify-weather-still OK')
