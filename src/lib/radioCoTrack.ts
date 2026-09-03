/**
 * Radio.co current_track titles are not always songs.
 * The encoder parks the station ident here between tracks, and weather
 * forecasts are often the previous "song". Never show those as now-playing.
 */

const STATION_IDENT = /^(one\s*fm(\s*98\.?5)?|98\.?5(\s*one\s*fm)?|3one)$/i

const TECHNICAL_ID = /^[A-Z0-9@_-]{4,}$/

const WEATHER_LINE =
  /^forecast|\b\d+[°c]\b|partly cloudy|mostly cloudy|thunderstorm|shower|drizzle|overcast/i

export function normalizeTrackTitle(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

/** True only when Radio.co encoded a real title — not the callsign, a bumper, or weather. */
export function isUsableNowPlayingTitle(raw: string | null | undefined): boolean {
  const title = raw ? normalizeTrackTitle(raw) : ''
  if (!title) return false
  if (STATION_IDENT.test(title)) return false
  if (TECHNICAL_ID.test(title)) return false
  if (WEATHER_LINE.test(title)) return false
  return true
}
