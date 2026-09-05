/**
 * Fail if the mini-player weather chip hides Open-Meteo in a tooltip.
 * Run: npx vite-node scripts/verify-weather-source.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-weather-source FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync('src/components/WeatherWidget.tsx', 'utf8')
const miniStart = src.indexOf('export function WeatherMini')
assert(miniStart >= 0, 'WeatherMini must exist')
const mini = src.slice(miniStart)

assert(
  mini.includes('{WEATHER_SOURCE_LABEL}'),
  'WeatherMini must use WEATHER_SOURCE_LABEL — do not hard-code BOM or invent a bureau',
)
assert(
  /\{WEATHER_SOURCE_LABEL\}\s*<\/span>/.test(mini),
  'Open-Meteo must be a visible child on the chip, not only title / aria-label',
)
assert(
  !mini.includes('formatCoverageShort'),
  'WeatherMini must not stamp coverage onto the temperature',
)
assert(
  !/\bBOM\b/.test(mini),
  'Do not label Open-Meteo as BOM',
)

console.log('verify-weather-source OK — mini chip names Open-Meteo in the chrome')
