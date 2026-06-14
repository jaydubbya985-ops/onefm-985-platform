/**
 * ONE FM 98.5 — brand system (logo paths, colours, usage).
 *
 * Drop official assets into /public/brand/ — the site picks them up automatically:
 *   one-fm-logo-primary.png   — full colour on dark (navbar, hero)
 *   one-fm-logo-white.png     — reversed for dark photo backgrounds
 *   one-fm-logo-gold-mark.png — icon / favicon / compact mark
 *   one-fm-logo-primary.svg   — vector preferred if available
 *
 * Until those exist, legacy placeholder SVGs in /public/ are used.
 */

export const BRAND = {
  name: 'ONE FM',
  frequency: '98.5',
  fullName: 'ONE FM 98.5',
  tagline: 'Live and Local',
  region: 'Goulburn Valley',
  callsign: '3ONE',
  established: 1980,
  licensed: 1989,
} as const

/** Official palette — gold is prestige layer on navy heritage base */
export const BRAND_COLORS = {
  navy: '#0A1628',
  blue: '#1B4F8F',
  electric: '#0066CC',
  gold: '#D4A84B',
  goldLight: '#F0C75E',
  red: '#E31E24',
  white: '#FFFFFF',
  ivory: '#F4F1EA',
  muted: '#8A9199',
  border: '#1A2A42',
} as const

/** Prefer real Canva / fm985 exports; fall back to generated placeholders */
export const LOGO = {
  /** Original upload — archive / print */
  source: '/brand/one-fm-logo-source.png',
  /** Black-keyed PNG from Canva */
  primary: '/brand/one-fm-logo-primary.png',
  /** Transparent — best on navy site chrome */
  transparent: '/brand/one-fm-logo-transparent.png',
  primarySvg: '/brand/one-fm-logo-prestige.svg',
  white: '/brand/one-fm-logo-transparent.png',
  goldMark: '/brand/favicon.svg',
  favicon: '/brand/favicon.svg',
  /** Legacy Kimi placeholders — last resort */
  fallbackMaster: '/one-fm-logo-master.svg',
  fallbackDefault: '/one-fm-logo.svg',
  fallbackWhite: '/one-fm-logo-white.svg',
} as const

export type LogoVariant = 'primary' | 'white' | 'mark'

const VARIANT_PATHS: Record<LogoVariant, string[]> = {
  primary: [LOGO.transparent, LOGO.primarySvg, LOGO.primary, LOGO.fallbackMaster, LOGO.fallbackDefault],
  white: [LOGO.transparent, LOGO.white, LOGO.fallbackWhite, LOGO.fallbackMaster],
  mark: [LOGO.favicon, LOGO.goldMark, LOGO.transparent, LOGO.primarySvg],
}

export function logoCandidates(variant: LogoVariant = 'primary'): readonly string[] {
  return VARIANT_PATHS[variant]
}

/** Local photo drop zone — no Unsplash for people or station shots */
export const PHOTO = {
  studio: '/photos/studio-control-room.jpg',
  hero: '/photos/hero-station.jpg',
  hosts: '/photos/hosts/',
  community: '/photos/community/',
  football: '/photos/football/',
  regional: '/photos/regional-landscape.jpg',
} as const
