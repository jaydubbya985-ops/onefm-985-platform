/**
 * On-air wall — one row per real presenter from programGuide.ts.
 * Portraits only when the filename/source names that person.
 * Otherwise a show-type station photo (studio / sport / heritage) —
 * never a truck, van, or control-room shot labelled as their face.
 *
 * Breakfast hosts: src/data/programGuide.ts (fm985.com.au/guide).
 */
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { getBreakfastScheduleLabel } from '@/data/programGuide'

export type OnAirPhotoKind = 'portrait' | 'studio' | 'sport' | 'heritage'

export interface OnAirPerson {
  name: string
  show: string
  /** Verified photo of this person, or null. */
  portrait: string | null
  /** Show/event image — do not caption as a headshot when portrait is null. */
  contextImg: string
  kind: OnAirPhotoKind
}

const STUDIO = STATION_PHOTOS.studioPresenterMic

export const ON_AIR_PEOPLE: OnAirPerson[] = [
  {
    name: 'Tim Ahemt',
    show: 'ONE FM Breakfast · Mon & Tue',
    portrait: null,
    contextImg: STUDIO,
    kind: 'studio',
  },
  {
    name: 'Craig Stott',
    show: 'Tuesday Mornings',
    portrait: null,
    contextImg: STUDIO,
    kind: 'studio',
  },
  {
    name: 'The Big G',
    show: 'ONE FM Breakfast · Wednesday',
    portrait: null,
    contextImg: STUDIO,
    kind: 'studio',
  },
  {
    name: 'Ralph Whitehead',
    show: 'ONE FM Breakfast · Thursday',
    portrait: null,
    contextImg: STUDIO,
    kind: 'studio',
  },
  {
    name: 'Josh Revens',
    show: 'ONE FM Breakfast · Friday',
    portrait: null,
    contextImg: STUDIO,
    kind: 'studio',
  },
  {
    name: 'Johnny P',
    show: 'Dancing through the decades',
    portrait: null,
    contextImg: STATION_PHOTOS.studioChristmasBroadcast,
    kind: 'studio',
  },
  {
    name: 'Di Hunter',
    show: 'Monday Afternoon · on air since the early days',
    portrait: '/assets/images/heritage-di-hunter-carols-2014.jpg',
    contextImg: STUDIO,
    kind: 'heritage',
  },
  {
    name: 'James Manley',
    show: 'The James Manley Show · Mon–Tue 4pm',
    portrait: null,
    contextImg: STATION_PHOTOS.communityBookStall,
    kind: 'studio',
  },
]

export const BREAKFAST_LINE = getBreakfastScheduleLabel()

export function wallImage(person: OnAirPerson): string {
  return person.portrait ?? person.contextImg
}

export function wallAlt(person: OnAirPerson): string {
  if (person.portrait) return `${person.name} — ${person.show}`
  if (person.kind === 'sport') return `GVL / match-day broadcast photo for ${person.show} — not a portrait of ${person.name}`
  if (person.kind === 'heritage') return `Heritage station photo for ${person.show}`
  return `ONE FM studio photo for ${person.show} — named presenter photo pending`
}

export function wallRows() {
  return ON_AIR_PEOPLE.map((p) => ({
    name: p.name,
    sub: p.show,
    img: wallImage(p),
    alt: wallAlt(p),
  }))
}
