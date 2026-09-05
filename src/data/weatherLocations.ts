import { towns } from '@/data/townData'

export interface WeatherLocation {
  name: string
  lat: number
  lng: number
}

// Shepparton first (station home base), then hub/major towns from townData —
// not a second invented list, and not all 25 coverage towns (villages stay off the cycle).
export const gvWeatherTowns: WeatherLocation[] = [
  ...towns.filter((t) => t.name === 'Shepparton'),
  ...towns.filter((t) => t.name !== 'Shepparton' && (t.sizeCategory === 'hub' || t.sizeCategory === 'major')),
].map((t) => ({ name: t.name.replace(/\s*\(NSW\)$/, ''), lat: t.lat, lng: t.lng }))
