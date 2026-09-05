/**
 * Normalised on-air metadata — RDS / stream / schedule fallback.
 * Never invent now-playing data; label source clearly.
 */

import { getCurrentLiveShow, type LiveShowInfo } from '@/data/programGuide'
import { AUDIO_PLAYER_URL, STREAM_STATUS_URL } from '@/lib/streamConfig'

export type MetadataSource = 'schedule' | 'rds' | 'stream' | 'manual' | 'unavailable'

export interface PlayerMetadata {
  isLive: boolean
  source: MetadataSource
  sourceLabel: string
  program: string
  presenter: string
  programTime: string
  category: string
  upNext: string
  nowPlaying: string | null
  artist: string | null
  title: string | null
  updatedAt: string
}

export interface TickerItem {
  id: string
  text: string
  href?: string
}

/** Approved station messages — not invented stats.
 *  Official listen: 98.5 FM, Radio.co stream, fm985.com.au web player.
 *  Do not advertise Community Radio Plus (national CBAA app, not a verified ONE FM listing).
 */
export const STATION_TICKER: TickerItem[] = [
  { id: '1', text: 'Live & Local — Goulburn Murray', href: 'https://fm985.com.au' },
  { id: '2', text: 'Listen on 98.5 FM · Radio.co · fm985.com.au web player', href: AUDIO_PLAYER_URL },
  { id: '3', text: 'Goulburn Valley Community Radio Inc. · Callsign 3ONE', href: '/heritage' },
  { id: '4', text: 'Latest interviews & community news at fm985.com.au', href: 'https://fm985.com.au' },
]

const SOURCE_LABELS: Record<MetadataSource, string> = {
  schedule: 'Program schedule',
  rds: 'RDS live',
  stream: 'Stream metadata',
  manual: 'Station update',
  unavailable: 'Metadata unavailable',
}

/** Listed presenter on the Melbourne guide — not leftover `Date#getHours()` / Sunday-UTC 0–6. */
function isListedPresenter(show: LiveShowInfo): boolean {
  return show.host !== 'Automated'
}

/** Schedule-based metadata (always available). */
export function getScheduleMetadata(now: Date = new Date()): PlayerMetadata {
  const show: LiveShowInfo = getCurrentLiveShow(now)
  const live = isListedPresenter(show)

  return {
    isLive: live,
    source: 'schedule',
    sourceLabel: SOURCE_LABELS.schedule,
    program: show.name,
    presenter: show.host,
    programTime: show.time,
    category: show.category,
    upNext: show.upNext,
    nowPlaying: null,
    artist: null,
    title: null,
    updatedAt: now.toISOString(),
  }
}

/**
 * Merge stream/RDS payload when available.
 * Pass partial fields only — never fabricate missing values.
 */
export function mergeStreamMetadata(
  base: PlayerMetadata,
  stream: {
    source: 'rds' | 'stream' | 'manual'
    title?: string | null
    artist?: string | null
    nowPlaying?: string | null
  }
): PlayerMetadata {
  const title = stream.title?.trim() || null
  const artist = stream.artist?.trim() || null
  const nowPlaying =
    stream.nowPlaying?.trim() ||
    (title && artist ? `${artist} — ${title}` : title || artist)

  if (!nowPlaying) return base

  return {
    ...base,
    source: stream.source,
    sourceLabel: SOURCE_LABELS[stream.source],
    nowPlaying,
    title,
    artist,
    updatedAt: new Date().toISOString(),
  }
}

/** Fetch now-playing from Radio.co (same backend as fm985.com.au/audio-player/). */
export async function fetchStreamMetadata(_streamUrl?: string): Promise<{
  title: string | null
  artist: string | null
} | null> {
  try {
    const res = await fetch(STREAM_STATUS_URL)
    if (!res.ok) return null

    const data = (await res.json()) as {
      status?: string
      current_track?: { title?: string }
    }

    if (data.status !== 'online') return null

    const raw = data.current_track?.title?.trim()
    if (!raw) return null

    // Reject raw technical IDs like "SHE60C@BB9" — no spaces, contains @ or
    // is all-uppercase alphanumeric (internal stream callsigns/track IDs).
    if (/^[A-Z0-9@_-]{4,}$/.test(raw)) return null

    // Reject weather forecast strings broadcast as "now playing"
    // e.g. "Forecast — Partly Cloudy 18c Tomorrow: Partly Cloudy 19c"
    if (/^forecast/i.test(raw) || /\b\d+[°c]\b/i.test(raw) || /partly cloudy|mostly cloudy|thunderstorm|shower|drizzle|overcast/i.test(raw)) return null

    const dash = raw.indexOf(' - ')
    if (dash > 0) {
      return {
        artist: raw.slice(0, dash).trim(),
        title: raw.slice(dash + 3).trim(),
      }
    }

    return { title: raw, artist: null }
  } catch {
    return null
  }
}
