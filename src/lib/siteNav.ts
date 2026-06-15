/**
 * Canonical site navigation — single source for Navbar, Footer, and Home quick jobs.
 * Audit order: Listen → Sponsor → About → Support
 */

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
      { label: 'Programs', path: '/programs', description: 'Weekly guide from fm985.com.au' },
      { label: 'Broadcast', path: '/broadcast', description: 'Schedule grid · hosts · segments' },
      { label: 'Coverage Map', path: '/coverage', description: '25 towns · ~100km radius' },
    ],
  },
  {
    label: 'Sponsor',
    items: [
      { label: 'Sponsorship', path: '/sponsorship', description: 'Packages & football tiers' },
      { label: 'Media Kit', path: '/media-kit', description: 'Audience stats & rate card' },
      { label: 'Audience', path: '/audience', description: 'Regional demographics' },
      { label: 'Social Hub', path: '/social', description: 'Brand assets & templates' },
      { label: 'Proposal Builder', path: '/proposal', description: 'Build a sponsor proposal' },
    ],
  },
  {
    label: 'About',
    items: [
      { label: 'Our Story', path: '/story', description: 'People · milestones · mission' },
      { label: 'Heritage', path: '/heritage', description: 'Since 1989 · callsign 3ONE' },
      { label: 'Community', path: '/community', description: 'NFPs & local organisations' },
      { label: 'GVL Football', path: '/football', description: 'Season sponsorship tiers' },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Support Us', path: '/support', description: 'Donate · volunteer · membership' },
      { label: 'Contact', path: '/contact', description: 'Studio · partnerships · enquiries' },
    ],
  },
]

/** Home page primary jobs — what a visitor needs first */
export const HOME_JOBS = [
  {
    label: 'Listen Live',
    path: '/listen',
    description: 'Stream ONE FM on FM, web, or app',
    accent: '#E51636',
  },
  {
    label: 'Programs',
    path: '/programs',
    description: 'Breakfast, sport, multicultural & more',
    accent: '#D4AF37',
  },
  {
    label: 'Broadcast',
    path: '/broadcast',
    description: 'Weekly schedule · presenters · segments',
    accent: '#2EC4B6',
  },
  {
    label: 'Coverage',
    path: '/coverage',
    description: 'Map of 25 towns in our broadcast area',
    accent: '#1B458F',
  },
] as const

/** Footer link columns */
export const FOOTER_LISTEN = NAV_GROUPS[0].items
export const FOOTER_SPONSOR = NAV_GROUPS[1].items
export const FOOTER_ABOUT = NAV_GROUPS[2].items
export const FOOTER_SUPPORT = NAV_GROUPS[3].items

export const FOOTER_RESOURCES: NavItem[] = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Media Kit (PDF)', path: '/media-kit' },
  { label: 'Rate Card', path: '/sponsorship' },
  { label: 'Program Guide', path: '/programs' },
]

/** All internal routes for sanity checks */
export const SITE_ROUTES = [
  '/',
  '/listen',
  '/programs',
  '/broadcast',
  '/coverage',
  '/sponsorship',
  '/media-kit',
  '/audience',
  '/social',
  '/proposal',
  '/story',
  '/heritage',
  '/community',
  '/football',
  '/support',
  '/contact',
  '/privacy',
  '/ops',
] as const
