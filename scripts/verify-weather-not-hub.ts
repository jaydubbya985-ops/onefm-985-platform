/**
 * Fail if the weather strip still invents leftover hub & major towns.
 * Run: npx vite-node scripts/verify-weather-not-hub.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-weather-not-hub FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/WeatherWidget.tsx', import.meta.url), 'utf8')

assert(!/hub & major towns/.test(src), 'leftover invented hub-towns still in WeatherWidget')
assert(
  /named towns from townData/.test(src),
  'sourced townData line missing from weather caption',
)
assert(/formatCoverageShort\(\)/.test(src), 'do not restamp leftover coverage by dropping formatCoverageShort')
assert(/WEATHER_SOURCE_LABEL/.test(src), 'Open-Meteo source label missing')

console.log('verify-weather-not-hub: leftover hub-towns gone; caption names townData')
