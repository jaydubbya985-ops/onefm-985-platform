/**
 * Canonical site navigation — single source for Navbar, Footer, and Home quick jobs.
 * Audit order: Listen → Sponsor → About → Support
 */

import { formatCoverageShort, formatTowns } from '@/lib/coverageCopy'
import { BREAKFAST_SHOW } from '@/data/programGuide'
import { STATION_PHOTOS, HOST_PHOTOS } from '@/lib/stationPhotos'
import { LISTEN_LINKS } from '@/lib/listenLinks'

export interface NavItem {
  label: string
  path: string
  description?: string
  external?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

/** Primary nav dropdowns (desktop + mobile) */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Listen',
    items: [
      { label: 'Listen Live', path: '/listen', description: 'Stream 98.5 FM · Radio.co' },
      { label: 'Program Guide', path: '/listen', description: `${BREAKFAST_SHOW} · fm985.com.au guide` },
      { label: 'Coverage Map', path: '/coverage', description: formatCoverageShort() },
    ],
  },
  {
    label: 'Sponsor',
    items: [
      { label: 'Sponsorship', path: '/sponsorship', description: 'Packages & football tiers' },
      { label: 'Media Kit', path: '/media-kit', description: 'Audience stats & rate card' },
      { label: 'Audience', path: '/audience', description: 'Regional demographics' },
      { label: 'Request a proposal', path: '/proposal', description: 'Staff send a tailored PDF' },
    ],
  },
  {
    label: 'About',
    items: [
      { label: 'History', path: '/heritage', description: 'Since 1989 · callsign 3ONE · station archive' },
      { label: 'Community', path: '/community', description: `${formatTowns()} · GVL sport & local life` },
      { label: 'GVL Football', path: '/football', description: 'Season sponsorship tiers' },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Donate', path: '/support', description: `Support community radio across ${formatTowns()}` },
      { label: 'Contact', path: '/contact', description: 'Studio phone · admin inbox' },
    ],
  },
]

/** Home page primary jobs — what a visitor needs first */
export const HOME_JOBS = [
  {
    label: 'Listen Live',
    path: '/listen',
    description: `Stream ${LISTEN_LINKS.fm.label} · Radio.co · ${LISTEN_LINKS.crp.label}`,
    accent: '#E51636',
    image: STATION_PHOTOS.commentaryBoxAction,
    tags: ['Live', '98.5 FM', 'Stream'],
  },
  {
    label: 'Programs',
    path: '/listen',
    description: `${BREAKFAST_SHOW} · sport, multicultural & more`,
    accent: '#F2F2F2',
    image: STATION_PHOTOS.studioPresenterMic,
    tags: ['Guide', 'Hosts', 'Weekly'],
  },
  {
    label: 'Community',
    path: '/community',
    description: `${formatTowns()}, GVL sport & local life`,
    accent: '#B6FF00',
    image: HOST_PHOTOS.studioControlRoom,
    tags: ['Towns', 'GVL', 'Local'],
  },
  {
    label: 'Coverage',
    path: '/coverage',
    description: `Map of ${formatTowns()} in our broadcast area`,
    accent: '#1B458F',
    image: STATION_PHOTOS.geoTownAerial,
    tags: [formatTowns(), 'Valley', 'Map'],
  },
] as const

/** Footer link columns */
export const FOOTER_LISTEN = NAV_GROUPS[0].items
export const FOOTER_SPONSOR = NAV_GROUPS[1].items
export const FOOTER_ABOUT = NAV_GROUPS[2].items
export const FOOTER_SUPPORT = NAV_GROUPS[3].items

export const FOOTER_RESOURCES: NavItem[] = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Media Kit', path: '/media-kit' },
  { label: 'Rate Card', path: '/sponsorship' },
  { label: 'Program Guide', path: '/programs' },
]

/** Programs page quick navigation */
export const PROGRAMS_PAGE_JOBS = [
  { label: 'Listen Live', path: '/listen', description: 'Stream now' },
  { label: 'Broadcast Grid', path: '/broadcast', description: 'Visual schedule' },
  { label: 'Coverage Map', path: '/coverage', description: formatTowns() },
  { label: 'GVL Football', path: '/football', description: 'Season sponsorship' },
] as const

/** Broadcast page quick navigation */
export const BROADCAST_PAGE_JOBS = [
  { label: 'Listen Live', path: '/listen', description: 'Stream now' },
  { label: 'Program Guide', path: '/programs', description: 'Shows & hosts' },
  { label: 'Coverage', path: '/coverage', description: 'Broadcast area' },
  { label: 'GVL Sport', path: '/football', description: 'Saturday coverage' },
] as const

/** Coverage page quick navigation */
export const COVERAGE_PAGE_JOBS = [
  { label: 'Listen Live', path: '/listen', description: 'Stream now' },
  { label: 'Programs', path: '/programs', description: 'What we broadcast' },
  { label: 'Broadcast', path: '/broadcast', description: 'Weekly grid' },
  { label: 'Media Kit', path: '/media-kit', description: 'Audience stats' },
] as const

export const SITE_ROUTES = [
  '/',
  '/listen',
  '/coverage',
  '/sponsorship',
  '/media-kit',
  '/audience',
  '/proposal',
  '/heritage',
  '/community',
  '/football',
  '/support',
  '/contact',
  '/privacy',
  '/ops',
] as const
