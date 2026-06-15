/**
 * Cinegraph asset registry — drop MP4 loops into /public/assets/cinegraphs/
 *
 * Export from Pica / Pixart as:
 *   - MP4 (H.264), no audio, 3–8s seamless loop
 *   - 1920×1080 (16:9), target < 3 MB for mobile
 *   - Subtle motion only (clouds, lights, crowd ripple — not full scene change)
 *
 * When a file is ready: set `videoActive: true` on that slot (or we auto-fallback to poster).
 */

import { STATION_PHOTOS, PHOTO_DEFAULTS } from '@/lib/stationPhotos'

const CG = '/assets/cinegraphs'

export interface CinegraphSlot {
  /** MP4 path — file may not exist yet */
  video: string
  /** Static frame / poster while video loads or if missing */
  poster: string
  /** Secondary still if poster fails */
  fallback: string
  /** Set true once you've dropped the MP4 into public/ */
  videoActive: boolean
  /** Brief for Jason — what to generate in Pica/Pixart */
  brief: string
}

export const CINEGRAPHS = {
  homeHero: {
    video: `${CG}/home-hero.mp4`,
    poster: STATION_PHOTOS.geoLakeAerial,
    fallback: STATION_PHOTOS.geoTownAerial,
    videoActive: false,
    brief: 'Goulburn Valley lake aerial — slow cloud drift, golden hour, very subtle. ONE FM navy grade at edges.',
  },
  listenStudio: {
    video: `${CG}/listen-studio.mp4`,
    poster: STATION_PHOTOS.commentaryBoxAction,
    fallback: STATION_PHOTOS.gvlCrowdStands,
    videoActive: false,
    brief: 'Commentary box or studio mic — soft LED blink, shallow depth. No faces if unclear rights.',
  },
  programsOnAir: {
    video: `${CG}/programs-on-air.mp4`,
    poster: STATION_PHOTOS.communityOutdoorMarket,
    fallback: STATION_PHOTOS.eventFoodTrucks,
    videoActive: false,
    brief: 'Community event / market bustle — gentle crowd movement, warm tones.',
  },
  gvlGameDay: {
    video: `${CG}/gvl-game-day.mp4`,
    poster: STATION_PHOTOS.gvlNightPanorama,
    fallback: STATION_PHOTOS.gvlCrowdStands,
    videoActive: false,
    brief: 'GVL night panorama — stadium lights flicker, crowd subtle sway.',
  },
  sponsorValley: {
    video: `${CG}/sponsor-valley.mp4`,
    poster: PHOTO_DEFAULTS.regional,
    fallback: STATION_PHOTOS.geoPinkOrchard,
    videoActive: false,
    brief: 'Canola fields or orchard — wind through crop, premium sponsor mood.',
  },
} as const satisfies Record<string, CinegraphSlot>

export type CinegraphKey = keyof typeof CINEGRAPHS

export function getCinegraph(key: CinegraphKey): CinegraphSlot {
  return CINEGRAPHS[key]
}
