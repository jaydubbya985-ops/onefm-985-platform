import { towns } from '@/data/townData'

export interface WeatherLocation {
  name: string
  lat: number
  lng: number
}

// Shepparton first (station home base), then the other GV major towns —
// reuses the existing coverage-area town list rather than a separate one.
export const gvWeatherTowns: WeatherLocation[] = [
  ...towns.filter((t) => t.name === 'Shepparton'),
  ...towns.filter((t) => t.name !== 'Shepparton' && (t.sizeCategory === 'hub' || t.sizeCategory === 'major')),
].map((t) => ({ name: t.name.replace(/\s*\(NSW\)$/, ''), lat: t.lat, lng: t.lng }))
