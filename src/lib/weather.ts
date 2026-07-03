// Open-Meteo integration — free, no API key, no signup, CORS-friendly.
// Docs: https://open-meteo.com/en/docs
// (BOM.gov.au blocks automated/scraping access outright — confirmed 403 — so this
// is the practical free source for real AU weather data in the browser.)

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

export async function fetchWeather(lat: number, lng: number): Promise<WeatherNow> {
  const key = cacheKey(lat, lng)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=Australia%2FMelbourne&forecast_days=1`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo request failed: ${res.status}`)
  const json = await res.json()

  const data: WeatherNow = {
    tempC: json.current.temperature_2m,
    feelsLikeC: json.current.apparent_temperature,
    tempMaxC: json.daily.temperature_2m_max[0],
    tempMinC: json.daily.temperature_2m_min[0],
    weatherCode: json.current.weather_code,
    windKmh: json.current.wind_speed_10m,
    humidity: json.current.relative_humidity_2m,
    isDay: json.current.is_day === 1,
  }

  cache.set(key, { data, fetchedAt: Date.now() })
  return data
}
