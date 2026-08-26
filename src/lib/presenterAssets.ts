import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { getCurrentLiveShow } from '@/data/programGuide'
import { ON_AIR_PEOPLE, wallImage } from '@/data/onAirPeople'

/**
 * Presenter imagery — real photos only.
 * Named file under /public/photos/hosts/{slug}.jpg wins when Jay drops it.
 * Verified portraits from onAirPeople win next.
 * Otherwise a show-type station photo (never a 404 host path).
 */

function slugHost(host: string): string {
  return host
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function contextForCategory(category: string): string {
  if (category === 'Sport') return STATION_PHOTOS.commentaryBoxAction
  if (category === 'Multicultural') return STATION_PHOTOS.studioSbsDiversity
  if (category === 'Country') return STATION_PHOTOS.studioPresenterMic
  return STATION_PHOTOS.studioPresenterMic
}

const NAMED_HOST_FILES: Record<string, string> = {
  'di-hunter': '/assets/images/heritage-di-hunter-carols-2014.jpg',
  'sally-nayler': '/assets/images/heritage-sally-nayler-90s.jpg',
}

export function presenterPhotoPath(host: string): string {
  if (!host || host === 'ONE FM' || host === 'Automated') {
    return contextForCategory(getCurrentLiveShow().category)
  }
  const slug = slugHost(host)
  if (NAMED_HOST_FILES[slug]) return NAMED_HOST_FILES[slug]

  const row = ON_AIR_PEOPLE.find((p) => slugHost(p.name) === slug)
  if (row) return wallImage(row)

  const aliases: Record<string, string> = {
    'john-painter': slugHost('Johnny P'),
    'johnny-p-john-painter': slugHost('Johnny P'),
    'timmy-ahmet': slugHost('Tim Ahemt'),
    'craig-stott-the-big-g': slugHost('The Big G'),
  }
  const aliased = aliases[slug]
  if (aliased) {
    const match = ON_AIR_PEOPLE.find((p) => slugHost(p.name) === aliased)
    if (match) return wallImage(match)
  }

  return `/photos/hosts/${slug}.jpg`
}

export function presenterPhotoFallback(host: string): string {
  const live = getCurrentLiveShow()
  if (host && live.host.toLowerCase().includes(host.toLowerCase().slice(0, 4))) {
    return contextForCategory(live.category)
  }
  return STATION_PHOTOS.studioPresenterMic
}
