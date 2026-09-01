/**
 * Cinegraph asset registry — station stills from /public/assets/images/.
 * No invented Pica/Pixart clips. videoActive stays false until a real
 * station MP4 exists in /public/assets/cinegraphs/.
 */

import { STATION_PHOTOS, PHOTO_DEFAULTS, HOST_PHOTOS } from '@/lib/stationPhotos'

const CG = '/assets/cinegraphs'

export interface CinegraphSlot {
  /** MP4 path — file may not exist yet */
  video: string
  /** Static frame / poster while video loads or if missing */
  poster: string
  /** Secondary still if poster fails */
  fallback: string
  /** Set true only when a real station MP4 exists in public/ */
  videoActive: boolean
  /** Station-archive note — stills only, not a generated clip */
  brief: string
}

export const CINEGRAPHS = {
  homeHero: {
    video: `${CG}/home-hero.mp4`,
    poster: STATION_PHOTOS.geoLakeAerial,
    fallback: STATION_PHOTOS.geoTownAerial,
    videoActive: false,
    brief: 'Goulburn Valley lake aerial — station archive still. No invented cinegraph clip.',
  },
  listenStudio: {
    video: `${CG}/listen-studio.mp4`,
    poster: HOST_PHOTOS.studioControlRoom,
    fallback: STATION_PHOTOS.commentaryBoxAction,
    videoActive: false,
    brief: 'Studio control room and commentary box — station archive stills. No invented cinegraph clip.',
  },
  programsOnAir: {
    video: `${CG}/programs-on-air.mp4`,
    poster: STATION_PHOTOS.communityOutdoorMarket,
    fallback: STATION_PHOTOS.eventFoodTrucks,
    videoActive: false,
    brief: 'Community book stall and food trucks — station archive stills. No invented cinegraph clip.',
  },
  gvlGameDay: {
    video: `${CG}/gvl-game-day.mp4`,
    poster: STATION_PHOTOS.matchDayFlag,
    fallback: STATION_PHOTOS.gvlSpectacularMark,
    videoActive: false,
    brief: 'ONE FM match-day flag and GVL mark — station archive stills. No invented cinegraph clip.',
  },
  sponsorValley: {
    video: `${CG}/sponsor-valley.mp4`,
    poster: PHOTO_DEFAULTS.regional,
    fallback: STATION_PHOTOS.geoPinkOrchard,
    videoActive: false,
    brief: 'Valley hills and pink orchard — station archive stills. No invented cinegraph clip.',
  },
} as const satisfies Record<string, CinegraphSlot>

export type CinegraphKey = keyof typeof CINEGRAPHS

export function getCinegraph(key: CinegraphKey): CinegraphSlot {
  return CINEGRAPHS[key]
}
