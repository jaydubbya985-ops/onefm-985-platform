/**
 * ONE FM Media Catalogue
 * All images must be real ONE FM assets from /public/assets/images/ or /public/brand/.
 * No Unsplash. No AI-generated people. No stock faces.
 */

import { LOGO } from '@/lib/brand'
import { STATION_PHOTOS, PHOTO_DEFAULTS } from '@/lib/stationPhotos'

export const media = {
  /* ── Brand (official drop zone: /public/brand/) ─────── */
  logoDefault:    LOGO.transparent,
  logoWhite:      LOGO.transparent,
  logoBlue:       LOGO.transparent,
  logoMaster:     LOGO.primarySvg,
  logoOriginal:   LOGO.primarySvg,

  /* ── Station ──────────────────────────────────────────── */
  studioControlRoom: STATION_PHOTOS.studioExteriorRainbow,
  heroWaveform:      PHOTO_DEFAULTS.hero,
  // Presenter photos must be dropped into /public/photos/hosts/<slug>.jpg
  // Until available, use real station photos (no stock faces)
  onAirHost1:        STATION_PHOTOS.commentaryBoxAction,
  onAirHost2:        STATION_PHOTOS.studioCommentarySelfie,
  onAirHost3:        STATION_PHOTOS.studioSbsDiversity,

  /* ── Location & Community ─────────────────────────────── */
  regionalLandscape: PHOTO_DEFAULTS.regional,
  communityEvent:    STATION_PHOTOS.communityOutdoorMarket,

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
  communityGathering: STATION_PHOTOS.communityOutdoorMarket,
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

  /* ── Presenter placeholders ───────────────────────────── */
  // Real presenter photos → drop into /public/photos/hosts/<slug>.jpg
  presenter1: STATION_PHOTOS.commentaryBoxAction,
  presenter2: STATION_PHOTOS.studioCommentarySelfie,
  presenter3: STATION_PHOTOS.studioSbsDiversity,
  presenter4: STATION_PHOTOS.studioChristmasBroadcast,
  presenter5: STATION_PHOTOS.commentaryBoxAction,
  presenter6: STATION_PHOTOS.studioCommentarySelfie,
} as const

export type MediaKey = keyof typeof media
