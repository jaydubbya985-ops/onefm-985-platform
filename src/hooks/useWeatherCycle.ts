import { useEffect, useRef, useState } from 'react'
import { fetchWeather, type WeatherNow } from '@/lib/weather'
import type { WeatherLocation } from '@/data/weatherLocations'

export interface WeatherCycleResult {
  location: WeatherLocation
  weather: WeatherNow | null
  loading: boolean
  index: number
}

export function weatherLocationKey(location: WeatherLocation): string {
  return `${location.name}:${location.lat.toFixed(3)},${location.lng.toFixed(3)}`
}

/** Never pair town B's name with town A's last reading. */
export function weatherForLocation(
  location: WeatherLocation | undefined,
  readings: Record<string, WeatherNow>,
): WeatherNow | null {
  if (!location) return null
  return readings[weatherLocationKey(location)] ?? null
}

// Cycles through a list of locations, fetching (cached) real weather for
// whichever one is currently showing. Always starts at index 0.
export function useWeatherCycle(locations: WeatherLocation[], intervalMs = 7000): WeatherCycleResult {
  const [index, setIndex] = useState(0)
  const [readings, setReadings] = useState<Record<string, WeatherNow>>({})
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const requestId = useRef(0)

  const location = locations[index]
  const weather = weatherForLocation(location, readings)
  const loading = Boolean(location && loadingKey === weatherLocationKey(location) && !weather)

  useEffect(() => {
    if (locations.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % locations.length), intervalMs)
    return () => clearInterval(id)
  }, [locations.length, intervalMs])

  useEffect(() => {
    if (!location) return
    const key = weatherLocationKey(location)
    const thisRequest = ++requestId.current
    setLoadingKey(key)
    fetchWeather(location.lat, location.lng)
      .then((data) => {
        if (requestId.current !== thisRequest) return
        setReadings((prev) => ({ ...prev, [key]: data }))
      })
      .catch(() => {
        // Keep a prior reading for this town only. Do not invent a number.
      })
      .finally(() => {
        if (requestId.current === thisRequest) {
          setLoadingKey((current) => (current === key ? null : current))
        }
      })
  }, [index, location])

  return { location, weather, loading, index }
}
