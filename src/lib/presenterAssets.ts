import { STATION_PHOTOS, HOST_PHOTOS } from '@/lib/stationPhotos'

/**
 * Real presenter portraits — only files whose filename or archive record
 * names the person. Everyone else gets a station backdrop, never a fake face.
 */
export const NAMED_PORTRAITS: Record<string, string> = {
  'Di Hunter': '/assets/images/heritage-di-hunter-carols-2014.jpg',
  'Sally Nayler': '/assets/images/heritage-sally-nayler-90s.jpg',
}

/** Studio / OB / valley photography used behind names that have no cleared portrait.
 *  Never cycle `/on-air-host-1.jpg` — that file is an unlabeled face, not a named portrait. */
export const ON_AIR_WALL_BACKDROPS = [
  HOST_PHOTOS.studioControlRoom,
  STATION_PHOTOS.studioPresenterMic,
  STATION_PHOTOS.obVanBranded,
  STATION_PHOTOS.studioCommentarySelfie,
  STATION_PHOTOS.commentaryBoxAction,
  // Goulburn Valley housing-estate sunset — station archive, not a portrait.
  STATION_PHOTOS.geoHousingEstateSunset,
] as const

export const ON_AIR_WALL_PHOTO_NOTE =
  'Photography: ONE FM studio, outside-broadcast, and Goulburn Valley archive — not presenter portraits. Named portraits exist only for Di Hunter and Sally Nayler.'

export function presenterPortrait(host: string): string | null {
  if (!host) return null
  if (NAMED_PORTRAITS[host]) return NAMED_PORTRAITS[host]
  for (const [name, src] of Object.entries(NAMED_PORTRAITS)) {
    if (host.includes(name) || name.includes(host)) return src
  }
  return null
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
      return STATION_PHOTOS.geoHousingEstateSunset
    case 'Heritage':
      return STATION_PHOTOS.heritageOriginalPanel1988
    case 'Outside broadcast':
      return STATION_PHOTOS.heritageObMall1989
    case 'Music':
      return STATION_PHOTOS.studioPresenterMic
    default:
      return STATION_PHOTOS.studioPresenterMic
  }
}

/** Scene for a named program — station photography only. */
export function programScene(program: string): string {
  const n = program.toLowerCase()
  if (n.includes('gvl') || n.includes('football') || n.includes('afl') || n.includes('sport')) {
    return STATION_PHOTOS.gvlNightPanorama
  }
  if (n.includes('breakfast') || n.includes('breaky')) {
    return STATION_PHOTOS.commentaryBoxAction
  }
  if (n.includes('country')) return STATION_PHOTOS.eventDeniUteMuster
  if (n.includes('samoan') || n.includes('filipino') || n.includes('mandarin') || n.includes('punjabi') || n.includes('italia') || n.includes('swahili') || n.includes('netherland')) {
    return STATION_PHOTOS.cultureAlbanianDancers
  }
  if (n.includes('heritage') || n.includes('1989') || n.includes('panel')) {
    return STATION_PHOTOS.heritageOriginalPanel1988
  }
  if (n.includes('community') || n.includes('interview')) {
    return STATION_PHOTOS.geoHousingEstateSunset
  }
  return STATION_PHOTOS.studioPresenterMic
}

export function presenterVisual(
  host: string,
  category?: string,
  index = 0,
): { src: string; isPortrait: boolean; alt: string } {
  const named = presenterPortrait(host)
  if (named) {
    return { src: named, isPortrait: true, alt: host }
  }
  const src = category ? programBackdrop(category) : presenterBackdrop(host, index)
  const topic = category ? `${category.toLowerCase()} ` : ''
  return {
    src,
    isPortrait: false,
    alt: `ONE FM ${topic}photography — not a portrait of ${host || 'the presenter'}`,
  }
}

export const NAMED_PORTRAIT_HOSTS = Object.keys(NAMED_PORTRAITS)
