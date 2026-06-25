/**
 * ONE FM Media Catalogue
 * All images must be real ONE FM assets from /public/assets/images/ or /public/brand/.
 * No Unsplash. No AI-generated people. No stock faces.
 */

import { LOGO } from '@/lib/brand'
import { STATION_PHOTOS, PHOTO_DEFAULTS, HOST_PHOTOS } from '@/lib/stationPhotos'

export const media = {
  /* ── Brand (official drop zone: /public/brand/) ─────── */
  logoDefault:    LOGO.transparent,
  logoWhite:      LOGO.transparent,
  logoBlue:       LOGO.transparent,
  logoMaster:     LOGO.primarySvg,
  logoOriginal:   LOGO.primarySvg,

  /* ── Station ──────────────────────────────────────────── */
  studioControlRoom: HOST_PHOTOS.studioControlRoom,
  heroWaveform:      PHOTO_DEFAULTS.hero,
  // Real on-air host photos in /public/on-air-host-*.jpg
  onAirHost1:        HOST_PHOTOS.onAirHost1,
  onAirHost2:        HOST_PHOTOS.onAirHost2,
  onAirHost3:        HOST_PHOTOS.onAirHost3,

  /* ── Location & Community ─────────────────────────────── */
  regionalLandscape: PHOTO_DEFAULTS.regional,
  // "the voice the Valley turns to when it matters most" copy on Home —
  // needs a photo with real stakes/emotion, not a sunny market stall.
  communityEvent:    STATION_PHOTOS.gvlTeamCelebration,

  /* ── Sales & Social ───────────────────────────────────── */
  socialTemplateMockup: STATION_PHOTOS.cultureSiloArtFaces,
  sponsorBrandLogos:    STATION_PHOTOS.studioSbsDiversity,

  /* ── Broadcast & Infrastructure ──────────────────────── */
  radioStudio:     STATION_PHOTOS.studioExteriorRainbow,
  microphone:      STATION_PHOTOS.commentaryBoxAction,
  onAirSign:       STATION_PHOTOS.studioCommentarySelfie,
  broadcastDesk:   STATION_PHOTOS.commentaryBoxAction,

  /* ── Goulburn Valley / Regional ──────────────────────── */
  australianSunset:  STATION_PHOTOS.geoHousingEstateSunset,
  ruralRoad:         STATION_PHOTOS.geoCyclistsCanola,
  australianFields:  STATION_PHOTOS.geoPinkOrchard,

  /* ── Community & Events ───────────────────────────────── */
  communityGathering: STATION_PHOTOS.gvlNightPanorama,
  audienceCrowd:      STATION_PHOTOS.gvlCrowdStands,
  townHall:           STATION_PHOTOS.communityOutdoorMarket,

  /* ── Sports ───────────────────────────────────────────── */
  footballGame:  STATION_PHOTOS.gvlNightPanorama,
  sportsCrowd:   STATION_PHOTOS.gvlCrowdStands,
  ovalGround:    STATION_PHOTOS.gvlStadiumDay,

  /* ── Music & Entertainment ────────────────────────────── */
  concertLights: STATION_PHOTOS.eventLasersCrowd,
  djMixing:      STATION_PHOTOS.commentaryBoxAction,
  stageLights:   STATION_PHOTOS.eventLasersBuilding,

  /* ── Business / Sales ─────────────────────────────────── */
  meetingRoom:   STATION_PHOTOS.studioSbsDiversity,
  handshake:     STATION_PHOTOS.studioCommentarySelfie,
  salesChart:    STATION_PHOTOS.gvlCrowdStands,

  /* ── Presenter photos ─────────────────────────────────── */
  // Real on-air host photos — fallback chain when slug-based photo missing
  presenter1: HOST_PHOTOS.onAirHost1,
  presenter2: HOST_PHOTOS.onAirHost2,
  presenter3: HOST_PHOTOS.onAirHost3,
  presenter4: HOST_PHOTOS.onAirHost1,
  presenter5: HOST_PHOTOS.onAirHost2,
  presenter6: HOST_PHOTOS.onAirHost3,
} as const

export type MediaKey = keyof typeof media
