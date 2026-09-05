/**
 * Fail if an incomplete Open-Meteo body is dressed as a town reading.
 * Run: npx vite-node scripts/verify-weather-payload.ts
 */
import { readFileSync } from 'node:fs'
import { formatTempC, readOpenMeteoWeather } from '../src/lib/weather'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-weather-payload FAIL: ${message}`)
    process.exit(1)
  }
}

function throws(fn: () => unknown, message: string) {
  try {
    fn()
  } catch {
    return
  }
  console.error(`verify-weather-payload FAIL: expected throw — ${message}`)
  process.exit(1)
}

const shepparton = readOpenMeteoWeather({
  current: {
    temperature_2m: 14.2,
    apparent_temperature: 12.8,
    weather_code: 3,
    wind_speed_10m: 18,
    relative_humidity_2m: 61,
    is_day: 1,
  },
  daily: {
    temperature_2m_max: [19.1],
    temperature_2m_min: [8.4],
  },
})
assert(shepparton.tempC === 14.2, 'keep the real current temp')
assert(shepparton.tempMaxC === 19.1 && shepparton.tempMinC === 8.4, 'keep Melbourne daily high/low')
assert(shepparton.isDay === true, 'is_day 1 is daytime')
assert(formatTempC(shepparton.tempC) === '14°', `format ${formatTempC(shepparton.tempC)}`)

const frost = readOpenMeteoWeather({
  current: {
    temperature_2m: 0,
    apparent_temperature: -2,
    weather_code: 71,
    wind_speed_10m: 5,
    relative_humidity_2m: 90,
    is_day: 0,
  },
  daily: { temperature_2m_max: [4], temperature_2m_min: [0] },
})
assert(frost.tempC === 0, '0°C is a real reading, not missing data')
assert(frost.isDay === false, 'is_day 0 is night')

throws(() => readOpenMeteoWeather(null), 'null body')
throws(() => readOpenMeteoWeather({}), 'empty object')
throws(
  () =>
    readOpenMeteoWeather({
      current: { temperature_2m: null, weather_code: 0 },
      daily: { temperature_2m_max: [20], temperature_2m_min: [10] },
    }),
  'null current temp',
)
throws(
  () =>
    readOpenMeteoWeather({
      current: {
        temperature_2m: 16,
        apparent_temperature: 15,
        weather_code: 1,
        wind_speed_10m: 10,
        relative_humidity_2m: 50,
        is_day: 1,
      },
      daily: { temperature_2m_max: [], temperature_2m_min: [8] },
    }),
  'empty daily high',
)
throws(
  () =>
    readOpenMeteoWeather({
      current: {
        temperature_2m: Number.NaN,
        apparent_temperature: 15,
        weather_code: 1,
        wind_speed_10m: 10,
        relative_humidity_2m: 50,
        is_day: 1,
      },
      daily: { temperature_2m_max: [20], temperature_2m_min: [8] },
    }),
  'NaN current temp',
)

const src = readFileSync(new URL('../src/lib/weather.ts', import.meta.url), 'utf8')
assert(src.includes('readOpenMeteoWeather'), 'fetchWeather must parse through the guard')
assert(src.includes('Australia%2FMelbourne'), 'keep Melbourne civil days on the forecast')
assert(!src.includes('BOM.gov.au/forecast'), 'do not label Open-Meteo as BOM')

console.log('verify-weather-payload OK')
console.log('shepparton sample:', formatTempC(shepparton.tempC), 'max', formatTempC(shepparton.tempMaxC))
