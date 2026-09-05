import { towns } from '@/data/townData'

export interface WeatherLocation {
  name: string
  lat: number
  lng: number
}

/**
 * Weather cycle from townData — not a second invented list.
 * Hub + major always. Medium towns closer than the next major after Mooroopna
 * (Benalla, via distanceFromSheppartonKm) join so Tatura at 16 km is not
 * skipped for Echuca at 65 km. Villages and small towns stay off.
 */
const nextMajorAfterTwinKm = Math.min(
  ...towns
    .filter((t) => t.sizeCategory === 'major' && t.name !== 'Mooroopna')
    .map((t) => t.distanceFromSheppartonKm),
)

export const gvWeatherTowns: WeatherLocation[] = towns
  .filter((t) => {
    if (t.sizeCategory === 'village' || t.sizeCategory === 'small') return false
    if (t.sizeCategory === 'hub' || t.sizeCategory === 'major') return true
    return t.sizeCategory === 'medium' && t.distanceFromSheppartonKm < nextMajorAfterTwinKm
  })
  .sort((a, b) => a.distanceFromSheppartonKm - b.distanceFromSheppartonKm)
  .map((t) => ({
    name: t.name.replace(/\s*\(NSW\)$/, ''),
    lat: t.lat,
    lng: t.lng,
  }))
