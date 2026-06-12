/**
 * ONE FM Media Catalogue
 * Central registry for all image assets.
 * Local /public images take priority; Unsplash supplements fill any gap.
 * All Unsplash photos are hand-curated — specific IDs, not random searches.
 */

const UB = 'https://images.unsplash.com'

export const media = {
  /* ── Brand ────────────────────────────────────────────── */
  logoDefault:    '/one-fm-logo.png',
  logoWhite:      '/one-fm-logo-white.png',
  logoBlue:       '/one-fm-logo-blue.png',
  logoMaster:     '/one-fm-logo-master.png',
  logoOriginal:   '/one-fm-logo-original.png',

  /* ── Station ──────────────────────────────────────────── */
  studioControlRoom: '/studio-control-room.jpg',
  heroWaveform:      '/hero-waveform.png',
  onAirHost1:        '/on-air-host-1.jpg',
  onAirHost2:        '/on-air-host-2.jpg',
  onAirHost3:        '/on-air-host-3.jpg',

  /* ── Location & Community ─────────────────────────────── */
  regionalLandscape: '/regional-landscape.jpg',
  communityEvent:    '/community-event.jpg',

  /* ── Sales & Social ───────────────────────────────────── */
  socialTemplateMockup: '/social-template-mockup.jpg',
  sponsorBrandLogos:    '/sponsor-brand-logos.png',

  /* ── Unsplash Supplements ─────────────────────────────── */
  // Radio / Broadcast
  radioStudio:     `${UB}/photo-1598488035139-bdbb2231ce04?w=1920&q=85&auto=format&fit=crop`,
  microphone:      `${UB}/photo-1478737270239-2f02b77fc618?w=1920&q=85&auto=format&fit=crop`,
  onAirSign:       `${UB}/photo-1535016120720-40c646be5580?w=800&q=85&auto=format&fit=crop`,
  broadcastDesk:   `${UB}/photo-1516280440614-37939bbacd81?w=1920&q=85&auto=format&fit=crop`,
  vinylRecord:     `${UB}/photo-1470225620780-dba8ba36b745?w=1200&q=85&auto=format&fit=crop`,

  // Goulburn Valley / Regional Australia
  australianSunset:  `${UB}/photo-1523482580672-f109ba8cb9be?w=1920&q=85&auto=format&fit=crop`,
  ruralRoad:         `${UB}/photo-1504701954957-2010ec3bcec1?w=1920&q=85&auto=format&fit=crop`,
  australianFields:  `${UB}/photo-1518005020951-eccb494ad742?w=1920&q=85&auto=format&fit=crop`,

  // Community & Events
  communityGathering: `${UB}/photo-1529156069898-49953e39b3ac?w=1200&q=85&auto=format&fit=crop`,
  audienceCrowd:      `${UB}/photo-1459749411175-04bf5292ceea?w=1200&q=85&auto=format&fit=crop`,
  townHall:           `${UB}/photo-1497366754035-f200968a677a?w=1200&q=85&auto=format&fit=crop`,

  // Sports
  footballGame:  `${UB}/photo-1431324155629-1a6deb1dec8d?w=1200&q=85&auto=format&fit=crop`,
  sportsCrowd:   `${UB}/photo-1508098682722-e99c43a406b2?w=1200&q=85&auto=format&fit=crop`,
  ovalGround:    `${UB}/photo-1546519638-68e109498ffc?w=1200&q=85&auto=format&fit=crop`,

  // Music & Entertainment
  concertLights: `${UB}/photo-1470229722913-7c0e2dbbafd3?w=1920&q=85&auto=format&fit=crop`,
  djMixing:      `${UB}/photo-1571330735066-03aaa9429d89?w=1200&q=85&auto=format&fit=crop`,
  stageLights:   `${UB}/photo-1514525253161-7a46d19cd819?w=1920&q=85&auto=format&fit=crop`,

  // Business / Sales
  meetingRoom:   `${UB}/photo-1497366216548-37526070297c?w=1200&q=85&auto=format&fit=crop`,
  handshake:     `${UB}/photo-1521791136064-7986c2920216?w=1200&q=85&auto=format&fit=crop`,
  salesChart:    `${UB}/photo-1551288049-bebda4e38f71?w=1200&q=85&auto=format&fit=crop`,

  // Presenter/Host placeholders (face-cropped)
  presenter1: `${UB}/photo-1507003211169-0a1dd7228f2d?w=400&q=85&auto=format&fit=crop&crop=faces`,
  presenter2: `${UB}/photo-1500648767791-00dcc994a43e?w=400&q=85&auto=format&fit=crop&crop=faces`,
  presenter3: `${UB}/photo-1506794778202-cad84cf45f1d?w=400&q=85&auto=format&fit=crop&crop=faces`,
  presenter4: `${UB}/photo-1438761681033-6461ffad8d80?w=400&q=85&auto=format&fit=crop&crop=faces`,
  presenter5: `${UB}/photo-1472099645785-5658abf4ff4e?w=400&q=85&auto=format&fit=crop&crop=faces`,
  presenter6: `${UB}/photo-1580489944761-15a19d654956?w=400&q=85&auto=format&fit=crop&crop=faces`,
} as const

export type MediaKey = keyof typeof media
