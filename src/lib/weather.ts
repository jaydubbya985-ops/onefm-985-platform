// Open-Meteo integration — free, no API key, no signup, CORS-friendly.
// Docs: https://open-meteo.com/en/docs
// (BOM.gov.au blocks automated/scraping access outright — confirmed 403 — so this
// is the practical free source for real AU weather data in the browser.)

/** Public attribution. Do not label this as BOM. */
export const WEATHER_SOURCE_LABEL = 'Open-Meteo'

export interface WeatherNow {
  tempC: number
  feelsLikeC: number
  tempMaxC: number
  tempMinC: number
  weatherCode: number
  windKmh: number
  humidity: number
  isDay: boolean
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Freezing fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Light freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Light snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm, light hail',
  99: 'Thunderstorm, heavy hail',
}

export type WeatherIconKey = 'sun' | 'cloud-sun' | 'cloud' | 'cloud-rain' | 'cloud-lightning' | 'cloud-fog' | 'snowflake'

const WMO_ICONS: Record<number, WeatherIconKey> = {
  0: 'sun', 1: 'sun', 2: 'cloud-sun', 3: 'cloud',
  45: 'cloud-fog', 48: 'cloud-fog',
  51: 'cloud-rain', 53: 'cloud-rain', 55: 'cloud-rain',
  56: 'cloud-rain', 57: 'cloud-rain',
  61: 'cloud-rain', 63: 'cloud-rain', 65: 'cloud-rain',
  66: 'cloud-rain', 67: 'cloud-rain',
  71: 'snowflake', 73: 'snowflake', 75: 'snowflake', 77: 'snowflake',
  80: 'cloud-rain', 81: 'cloud-rain', 82: 'cloud-rain',
  85: 'snowflake', 86: 'snowflake',
  95: 'cloud-lightning', 96: 'cloud-lightning', 99: 'cloud-lightning',
}

export function getWeatherDescription(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? 'Unsettled'
}

export function getWeatherIconKey(code: number): WeatherIconKey {
  return WMO_ICONS[code] ?? 'cloud'
}

export function formatTempC(temp: number | null | undefined): string {
  if (temp === null || temp === undefined || Number.isNaN(temp)) return '--'
  return `${Math.round(temp)}°`
}

const CACHE_TTL_MS = 10 * 60 * 1000 // BOM/Open-Meteo data doesn't change faster than this is useful
const cache = new Map<string, { data: WeatherNow; fetchedAt: number }>()

function cacheKey(lat: number, lng: number) {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Open-Meteo missing ${field}`)
  }
  return value
}

/** Reject incomplete payloads so a town is never labelled with a missing reading. */
export function readOpenMeteoWeather(json: unknown): WeatherNow {
  if (!json || typeof json !== 'object') {
    throw new Error('Open-Meteo body is not an object')
  }
  const row = json as {
    current?: Record<string, unknown>
    daily?: Record<string, unknown>
  }
  const current = row.current
  const daily = row.daily
  if (!current || typeof current !== 'object') {
    throw new Error('Open-Meteo missing current block')
  }
  if (!daily || typeof daily !== 'object') {
    throw new Error('Open-Meteo missing daily block')
  }
  const maxes = daily.temperature_2m_max
  const mins = daily.temperature_2m_min
  if (!Array.isArray(maxes) || !Array.isArray(mins)) {
    throw new Error('Open-Meteo missing daily highs or lows')
  }
  return {
    tempC: requireNumber(current.temperature_2m, 'temperature_2m'),
    feelsLikeC: requireNumber(current.apparent_temperature, 'apparent_temperature'),
    tempMaxC: requireNumber(maxes[0], 'temperature_2m_max'),
    tempMinC: requireNumber(mins[0], 'temperature_2m_min'),
    weatherCode: requireNumber(current.weather_code, 'weather_code'),
    windKmh: requireNumber(current.wind_speed_10m, 'wind_speed_10m'),
    humidity: requireNumber(current.relative_humidity_2m, 'relative_humidity_2m'),
    isDay: requireNumber(current.is_day, 'is_day') === 1,
  }
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherNow> {
  const key = cacheKey(lat, lng)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=Australia%2FMelbourne&forecast_days=1`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo request failed: ${res.status}`)
  const data = readOpenMeteoWeather(await res.json())

  cache.set(key, { data, fetchedAt: Date.now() })
  return data
}
