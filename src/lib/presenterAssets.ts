import { ON_AIR_WALL_BACKDROPS } from '@/data/programGuide'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

/**
 * Real presenter portraits — only files whose filename or archive record
 * names the person. Everyone else gets a station backdrop, never a fake face.
 */
export const NAMED_PORTRAITS: Record<string, string> = {
  'Di Hunter': '/assets/images/heritage-di-hunter-carols-2014.jpg',
  'Sally Nayler': '/assets/images/heritage-sally-nayler-90s.jpg',
}

export function presenterPortrait(host: string): string | null {
  if (!host) return null
  return NAMED_PORTRAITS[host] ?? null
}

/** Decorative station shot. Must not be captioned as a photo of `host`. */
export function presenterBackdrop(host: string, index = 0): string {
  const named = presenterPortrait(host)
  if (named) return named
  if (!host || host === 'ONE FM' || host === 'Automated') {
    return STATION_PHOTOS.commentaryBoxAction
  }
  return ON_AIR_WALL_BACKDROPS[index % ON_AIR_WALL_BACKDROPS.length]
}

export function presenterPhotoPath(host: string): string {
  return presenterBackdrop(host, 0)
}

export function presenterPhotoIsPortrait(host: string): boolean {
  return presenterPortrait(host) != null
}

export function programBackdrop(category: string): string {
  switch (category) {
    case 'Sport':
      return STATION_PHOTOS.gvlNightPanorama
    case 'Breakfast':
      return STATION_PHOTOS.commentaryBoxAction
    case 'Multicultural':
      return STATION_PHOTOS.cultureAlbanianDancers
    case 'Country':
      return STATION_PHOTOS.eventDeniUteMuster
    case 'Community':
      return STATION_PHOTOS.communityBookStall
    default:
      return STATION_PHOTOS.studioPresenterMic
  }
}
