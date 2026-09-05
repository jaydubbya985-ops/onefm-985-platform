/**
 * ONE FM 98.5 — brand system V3
 * Source: ONE_FM_brand_system_v3_full_vector_pack (June 2026)
 *
 * Core rule (non-negotiable):
 *   Blue + White + Red = ONE FM identity
 *   Gold = premium accent ONLY
 *   Fluoro = digital signal layer ONLY (1–4% of layout)
 *   Never rebuild as black/gold/red
 */

import { PHOTO_DEFAULTS } from '@/lib/stationPhotos'

export const BRAND = {
  name: 'ONE FM',
  frequency: '98.5',
  fullName: 'ONE FM 98.5',
  tagline: 'Live and Local',
  region: 'Goulburn Valley',
  callsign: '3ONE',
  acma: '1385226/1',
  org: 'Goulburn Valley Community Radio Inc.',
  abn: '92 117 291 771',
  established: 1980,
  licensed: 1989,
  phone: '(03) 5831 3131',
  email: 'admin@fm985.com.au',
  accountsEmail: 'accounts@fm985.com.au',
  /** Studio street. Source: fm985.com.au/contact/ */
  address: '47 Parkside Drive, Shepparton VIC 3630 · PO Box 4034',
  /** Licensed postal address. Source: fm985.com.au/contact/ */
  postal: 'PO Box 4034, Shepparton VIC 3630',
  website: 'https://fm985.com.au',
  stream: 'https://s2.radio.co/sae3372059/listen',
  facebook: 'https://www.facebook.com/onefmshepparton',
  soundcloud: 'https://soundcloud.com/user-570295409',
} as const

/** Official V3 palette — source: onefm_palette_tokens_v3.json */
export const BRAND_COLORS = {
  // Core identity
  blue:    '#1B458F',   // ONE FM Blue
  white:   '#FFFFFF',   // Broadcast White
  red:     '#E51636',   // 98.5 Red
  // Premium layer (accent only)
  navy:    '#101010',   // Deep Broadcast Navy
  gold:    '#F2F2F2',   // Heritage Gold
  champagne: '#F2F2F2', // Champagne Highlight
  // Digital fluorescent (1–4% of layout max)
  cyan:    '#00E5FF',   // Electric Cyan
  neonSky: '#38BDF8',   // Neon Sky Blue (safer daily UI)
  neonOrange: '#FF6A00',// Sport/event alert only
  lime:    '#B6FF00',   // Fluoro Lime — specialist only
  magenta: '#FF2BD6',   // Broadcast Magenta — specialist only
  // UI utility
  muted:   '#8A9199',
  border:  '#1A2A42',
  midnight: '#070707',
} as const

/** Official logo files — dropped into /public/brand/ */
export const LOGO = {
  /** Vector SVG extracted from supplied PDF — use for digital */
  primarySvg:  '/brand/one-fm-logo-source.svg',
  /** PNG from brand pack — use for social, email */
  primary:     '/brand/one-fm-logo-primary.png',
  /** Reversed/white-on-dark approximation */
  reversed:    '/brand/one-fm-logo-reversed.svg',
  /** Legacy transparent variant */
  transparent: '/brand/one-fm-logo-transparent.png',
  /** Favicon / compact mark */
  favicon:     '/brand/favicon.svg',
  goldMark:    '/brand/favicon.svg',
  /** Official files only — never the old gold-98.5 text lockup */
  fallbackMaster:  '/brand/one-fm-logo-source.svg',
  fallbackDefault: '/brand/one-fm-logo-primary.png',
  fallbackWhite:   '/brand/one-fm-logo-reversed.svg',
} as const

export type LogoVariant = 'primary' | 'white' | 'mark'

const VARIANT_PATHS: Record<LogoVariant, string[]> = {
  primary: [LOGO.primarySvg, LOGO.primary, LOGO.transparent],
  white:   [LOGO.reversed, LOGO.transparent],
  mark:    [LOGO.favicon, LOGO.primarySvg],
}

export function logoCandidates(variant: LogoVariant = 'primary'): readonly string[] {
  return VARIANT_PATHS[variant]
}

/** Photo library — see stationPhotos.ts for full catalogue */
export const PHOTO = {
  studio:    PHOTO_DEFAULTS.studio,
  hero:      PHOTO_DEFAULTS.hero,
  hosts:     '/photos/hosts/',
  community: '/assets/images/',
  football:  '/assets/images/',
  regional:  PHOTO_DEFAULTS.regional,
} as const
