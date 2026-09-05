/**
 * Fail if the weather cycle would label town B with town A's degrees.
 * Run: npx vite-node scripts/verify-weather-cycle.ts
 */
import { weatherForLocation, weatherLocationKey } from '../src/hooks/useWeatherCycle'
import type { WeatherNow } from '../src/lib/weather'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-weather-cycle FAIL: ${message}`)
    process.exit(1)
  }
}

const shepparton = { name: 'Shepparton', lat: -36.38, lng: 145.399 }
const echuca = { name: 'Echuca', lat: -36.146, lng: 144.75 }

const shepReading: WeatherNow = {
  tempC: 18,
  feelsLikeC: 17,
  tempMaxC: 22,
  tempMinC: 9,
  weatherCode: 1,
  windKmh: 12,
  humidity: 55,
  isDay: true,
}

const readings = { [weatherLocationKey(shepparton)]: shepReading }

assert(weatherLocationKey(shepparton) !== weatherLocationKey(echuca), 'town keys must differ')
assert(
  weatherForLocation(shepparton, readings) === shepReading,
  'Shepparton must keep its own Open-Meteo reading',
)
assert(
  weatherForLocation(echuca, readings) === null,
  'Echuca must not inherit Shepparton 18°',
)
assert(weatherForLocation(undefined, readings) === null, 'missing town has no reading')

console.log('verify-weather-cycle OK')
