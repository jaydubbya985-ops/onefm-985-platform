import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { fetchWeather, type WeatherNow } from '@/lib/weather'
import type { WeatherLocation } from '@/data/weatherLocations'

export interface WeatherCycleResult {
  location: WeatherLocation
  weather: WeatherNow | null
  loading: boolean
  index: number
}

/**
 * Advance the valley weather towns only when the listener asked for motion.
 * `null` (unknown) and `true` stay on index 0 — the studio town — so
 * prefers-reduced-motion is not a 7-second slideshow.
 */
export function shouldCycleWeather(
  locationCount: number,
  reducedMotion: boolean | null,
): boolean {
  if (locationCount <= 1) return false
  return reducedMotion === false
}

// Cycles through a list of locations, fetching (cached) real weather for
// whichever one is currently showing. Always starts at index 0.
export function useWeatherCycle(locations: WeatherLocation[], intervalMs = 7000): WeatherCycleResult {
  const reducedMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [weather, setWeather] = useState<WeatherNow | null>(null)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)
  const [prevIndex, setPrevIndex] = useState(index)

  // New location → show loading state (render-phase adjustment)
  if (prevIndex !== index) {
    setPrevIndex(index)
    setLoading(true)
  }

  useEffect(() => {
    if (!shouldCycleWeather(locations.length, reducedMotion)) return
    const id = setInterval(() => setIndex((i) => (i + 1) % locations.length), intervalMs)
    return () => clearInterval(id)
  }, [locations.length, intervalMs, reducedMotion])

  useEffect(() => {
    const location = locations[index]
    if (!location) return
    const thisRequest = ++requestId.current
    fetchWeather(location.lat, location.lng)
      .then((data) => {
        if (requestId.current === thisRequest) setWeather(data)
      })
      .catch(() => {
        if (requestId.current === thisRequest) setWeather(null)
      })
      .finally(() => {
        if (requestId.current === thisRequest) setLoading(false)
      })
  }, [index, locations])

  return { location: locations[index], weather, loading, index }
}
