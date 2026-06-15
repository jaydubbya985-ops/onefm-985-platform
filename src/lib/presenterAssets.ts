import { STATION_PHOTOS } from '@/lib/stationPhotos'

/**
 * Presenter imagery — real photos only under /public/photos/hosts/.
 * Branded fallback when file missing (no stock faces).
 */

export function presenterPhotoPath(host: string): string {
  if (!host || host === 'ONE FM' || host === 'Automated') {
    return STATION_PHOTOS.commentaryBoxAction
  }
  const slug = host
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `/photos/hosts/${slug}.jpg`
}
