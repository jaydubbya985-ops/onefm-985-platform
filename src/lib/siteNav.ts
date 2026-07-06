/**
 * Canonical navigation — six-page IA (REBUILD-SPEC sitemap law, 2026-07-06).
 * Public destinations: Home, Listen, Community, History, Sponsor, Donate + utilities.
 */

import { STATION_PHOTOS } from '@/lib/stationPhotos'

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

/** The six public pages */
export const SIX_PAGES: NavItem[] = [
  { label: 'Home', path: '/', description: 'ONE FM 98.5 — The Voice of the Goulburn Valley' },
  { label: 'Listen', path: '/listen', description: 'Stream live · program guide · presenters' },
  { label: 'Our Community', path: '/community', description: '25 towns · GVL · multicultural programs' },
  { label: 'History', path: '/heritage', description: 'Living Archive · since 1989 · callsign 3ONE' },
  { label: 'Sponsor', path: '/sponsorship', description: 'Packages from $50/week · reach the Valley' },
  { label: 'Donate', path: '/support', description: 'Support volunteer-run community radio' },
]

/** Utilities — not counted in the six, always available */
export const UTILITY_PAGES: NavItem[] = [
  { label: 'Contact', path: '/contact', description: 'Studio · partnerships · get involved' },
  { label: 'Privacy', path: '/privacy', description: 'Privacy policy' },
]

/**
 * Evidence / deep pages — fronted by Sponsor or Community cards until fully absorbed.
 * Not in primary six-page nav.
 */
export const EVIDENCE_PAGES: NavItem[] = [
  { label: 'Media Kit', path: '/media-kit', description: 'Rate card · audience data · assets' },
  { label: 'Audience Data', path: '/audience', description: 'Regional demographics' },
  { label: 'Coverage Map', path: '/coverage', description: '25 towns · 100km radius' },
  { label: 'GVL Football', path: '/football', description: 'Season sponsorship · live calls' },
]

/** Footer + legacy Navbar column groups */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Listen',
    items: [SIX_PAGES[1]],
  },
  {
    label: 'Sponsor',
    items: [SIX_PAGES[4], ...EVIDENCE_PAGES.filter((p) => p.path === '/media-kit' || p.path === '/audience')],
  },
  {
    label: 'Station',
    items: [SIX_PAGES[2], SIX_PAGES[3], ...EVIDENCE_PAGES.filter((p) => p.path === '/coverage' || p.path === '/football')],
  },
  {
    label: 'Support',
    items: [SIX_PAGES[5], UTILITY_PAGES[0]],
  },
]

/** Home hero quick jobs — four primary actions below the fold */
export const HOME_JOBS = [
  {
    label: 'Listen Live',
    path: '/listen',
    description: 'Stream ONE FM on FM, web, or app',
    accent: '#E51636',
    image: STATION_PHOTOS.commentaryBoxAction,
    tags: ['Live', '98.5 FM', 'Stream'],
  },
  {
    label: 'Our Community',
    path: '/community',
    description: '25 towns · GVL · multicultural',
    accent: '#B6FF00',
    image: STATION_PHOTOS.geoTownAerial,
    tags: ['Valley', 'Towns', 'GVL'],
  },
  {
    label: 'History',
    path: '/heritage',
    description: 'Living Archive since 1989',
    accent: '#F2F2F2',
    image: STATION_PHOTOS.studioExteriorRainbow,
    tags: ['3ONE', 'Archive', 'Since 1989'],
  },
  {
    label: 'Sponsor',
    path: '/sponsorship',
    description: 'Partner with the Valley on air',
    accent: '#E51636',
    image: STATION_PHOTOS.gvlPlayerHighFive,
    tags: ['From $50/wk', '25 Towns', 'Reach'],
  },
] as const

export const FOOTER_LISTEN = NAV_GROUPS[0].items
export const FOOTER_SPONSOR = NAV_GROUPS[1].items
export const FOOTER_ABOUT = NAV_GROUPS[2].items
export const FOOTER_SUPPORT = NAV_GROUPS[3].items

export const FOOTER_RESOURCES: NavItem[] = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Program Guide', path: '/listen' },
  { label: 'Living Archive', path: '/heritage' },
  { label: 'Donate', path: '/support' },
]

export const SITE_ROUTES = [
  '/',
  '/listen',
  '/community',
  '/heritage',
  '/sponsorship',
  '/support',
  '/contact',
  '/privacy',
  '/coverage',
  '/football',
  '/media-kit',
  '/audience',
  '/programs',
  '/broadcast',
  '/social',
  '/story',
  '/proposal',
  '/payment/success',
  '/payment/cancel',
  '/ops',
] as const
