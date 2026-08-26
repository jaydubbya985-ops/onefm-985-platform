import { STATION_PHOTOS } from '@/lib/stationPhotos'

/**
 * Presenter imagery.
 *
 * ONE FM is a licensed community broadcaster, so a photograph only carries a
 * presenter's name when the station has confirmed who is in the frame. Anything
 * unconfirmed resolves to a station photograph — the OB van, the tower, a
 * match-day setup — so no page ever puts a name to an unidentified face.
 */

/**
 * Confirmed subjects. Both files are archive photographs named for their
 * subject and captioned that way in `stationHistory.ts` HERITAGE_LEGENDS.
 */
export const VERIFIED_PORTRAITS: Readonly<Record<string, string>> = {
  'Di Hunter': '/assets/images/heritage-di-hunter-carols-2014.jpg',
  'Sally Nayler': '/assets/images/heritage-sally-nayler-90s.jpg',
}

/** Station photographs that make no claim about who is pictured. */
const STATION_IMAGERY = [
  STATION_PHOTOS.obVanBranded,
  STATION_PHOTOS.studioExteriorRainbow,
  STATION_PHOTOS.obMatchDayBanner,
  STATION_PHOTOS.towerMountMajorDay,
  STATION_PHOTOS.matchDayFlag,
  STATION_PHOTOS.obTruckBranded,
  STATION_PHOTOS.obSetupFull,
  STATION_PHOTOS.commentaryBoxWide,
] as const

/** Same name always resolves to the same photograph, so layouts stay stable. */
function stableIndex(seed: string, length: number): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 37 + seed.charCodeAt(i)) >>> 0
  return hash % length
}

export interface PresenterImage {
  src: string
  /** Describes what is in the frame — never asserts an unconfirmed subject. */
  alt: string
  /** True only when the station has confirmed the presenter is pictured. */
  verified: boolean
}

export function presenterImage(host: string): PresenterImage {
  if (!host || host === 'ONE FM' || host === 'Automated') {
    return {
      src: STATION_PHOTOS.studioExteriorRainbow,
      alt: 'ONE FM 98.5 studios, Shepparton',
      verified: false,
    }
  }

  const portrait = VERIFIED_PORTRAITS[host]
  if (portrait) {
    return { src: portrait, alt: `${host} on air at ONE FM 98.5`, verified: true }
  }

  return {
    src: STATION_IMAGERY[stableIndex(host, STATION_IMAGERY.length)],
    alt: 'ONE FM 98.5 station photograph',
    verified: false,
  }
}

export function presenterPhotoPath(host: string): string {
  return presenterImage(host).src
}
