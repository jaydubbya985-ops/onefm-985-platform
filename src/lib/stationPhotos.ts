/**
 * Canonical ONE FM photo library — /public/assets/images/ (60 files on disk)
 * Root-level host/studio photos in /public/
 */

const IMG = '/assets/images'

export const STATION_PHOTOS = {
  // GVL & local sport
  commentaryBoxAction: `${IMG}/commentary-box-action.jpg`,
  gvlCrowdStands: `${IMG}/gvl-crowd-stands.jpg`,
  gvlNightPanorama: `${IMG}/gvl-night-panorama.jpg`,
  gvlStadiumDay: `${IMG}/gvl-stadium-day.jpg`,
  gvlPlayerHighFive: `${IMG}/gvl-player-high-five.jpg`,
  gvlActionSprint: `${IMG}/gvl-action-sprint.jpg`,
  gvlPlayerCelebration: `${IMG}/gvl-player-celebration.jpg`,
  gvlTownersWin: `${IMG}/gvl-towners-win.jpg`,
  gvlTeamCelebration: `${IMG}/gvl-team-celebration.jpg`,
  gvlSpectacularMark: `${IMG}/gvl-spectacular-mark.png`,
  gvlChampionshipMcg: `${IMG}/gvl-championship-mcg.jpg`,
  /** Alias — awaiting Drive sync */
  fieldReporterHeadset: `${IMG}/commentary-box-action.jpg`,

  // Studio & volunteer faces
  studioChristmasBroadcast: `${IMG}/studio-christmas-broadcast.jpg`,
  studioExteriorRainbow: `${IMG}/studio-exterior-rainbow.jpg`,
  studioCommentarySelfie: `${IMG}/studio-commentary-selfie.jpg`,
  studioSbsDiversity: `${IMG}/studio-sbs-diversity.jpg`,
  /** Alias — awaiting Drive sync */
  studioPanelInterview: `${IMG}/studio-sbs-diversity.jpg`,
  /** Alias — awaiting Drive sync */
  studioAnnouncerMic: `${IMG}/commentary-box-action.jpg`,
  /** Alias — awaiting Drive sync */
  communityDinnerTeam: `${IMG}/community-outdoor-market.jpg`,

  // Broadcast hardware
  towerMountMajorDay: `${IMG}/tower-mount-major-day.png`,
  towerTallMast: `${IMG}/tower-tall-mast.png`,
  towerStarsNight: `${IMG}/tower-stars-night.png`,

  // Cultural pulse — events, arts & First Nations
  eventFoodTrucks: `${IMG}/event-food-trucks.jpg`,
  eventLasersCrowd: `${IMG}/event-lasers-crowd.jpg`,
  eventLasersBuilding: `${IMG}/event-lasers-building.jpg`,
  cultureFirstNationsDancer: `${IMG}/culture-first-nations-dancer.png`,
  cultureIndigenousElders: `${IMG}/culture-indigenous-elders.jpg`,
  cultureSiloArtFaces: `${IMG}/culture-silo-art-faces.png`,
  cultureSiloArtBirds: `${IMG}/culture-silo-art-birds.png`,
  cultureRiverboatMurray: `${IMG}/culture-riverboat-scenic.jpg`,
  eventOutdoorCinema: `${IMG}/event-outdoor-cinema.png`,
  eventFestivalTents: `${IMG}/event-festival-tents.png`,
  cultureAlbanianDancers: `${IMG}/culture-albanian-dancers.png`,
  eventIlluminateWater: `${IMG}/event-illuminate-water.png`,
  landmarkHowNowCow: `${IMG}/landmark-how-now-cow.jpg`,
  eventDeniUteMuster: `${IMG}/event-deni-ute-muster.jpg`,

  // Economic footprint — geography & agriculture
  geoLakeAerial: `${IMG}/geo-lake-aerial.jpg`,
  geoCyclistsCanola: `${IMG}/geo-cyclists-canola.jpg`,
  geoMtbLookout: `${IMG}/geo-mtb-lookout.jpg`,
  geoHousingEstateSunset: `${IMG}/geo-housing-estate-sunset.jpg`,
  geoRollingGreenHills: `${IMG}/geo-rolling-green-hills.jpg`,
  geoPinkOrchard: `${IMG}/geo-pink-orchard.jpg`,
  geoTownAerial: `${IMG}/geo-town-aerial.jpg`,
  geoCanolaFence: `${IMG}/geo-cyclists-canola.jpg`,
  geoCanolaTree: `${IMG}/geo-canola-tree.png`,
  ecoSolarFarm: `${IMG}/eco-solar-farm.png`,
  ecoTractorSunrise: `${IMG}/eco-tractor-sunrise.png`,

  // Community grassroots
  communityBookStall: `${IMG}/community-book-stall.jpg`,
  communityOutdoorMarket: `${IMG}/community-outdoor-market.jpg`,

  // GVL additional action
  gvlTownersCelebration: `${IMG}/gvl-towners-celebration.jpg`,
  gvlGoalCelebration: `${IMG}/gvl-goal-celebration.jpg`,

  // Studio & presenter additions
  studioPresenterMic: `${IMG}/studio-presenter-mic.jpg`,
  studioSbsVisit: `${IMG}/studio-sbs-visit.jpg`,

  // Geographic additions
  geoTownAerialLake: `${IMG}/geo-town-aerial-lake.jpg`,

  // ONE FM OB & branded presence — real station content
  obSetupFull: `${IMG}/ob-setup-full.jpg`,
  commentaryTeamUniform: `${IMG}/commentary-team-uniform.jpg`,
  commentaryBoxView: `${IMG}/commentary-box-view.jpg`,
  obVanBranded: `${IMG}/ob-van-branded.jpg`,
  obMatchDayBanner: `${IMG}/ob-match-day-banner.jpg`,
  commentaryBoxWide: `${IMG}/commentary-box-wide.jpg`,
  obTruckBranded: `${IMG}/ob-truck-branded.jpg`,
  matchDayFlag: `${IMG}/match-day-flag.jpg`,
  commentaryTeamSelfie: `${IMG}/commentary-team-selfie.jpg`,
  commentaryCallAction: `${IMG}/commentary-call-action.jpg`,
} as const

/**
 * Root-level public assets — real ONE FM host / studio photos.
 */
export const HOST_PHOTOS = {
  onAirHost1:       '/on-air-host-1.jpg',
  onAirHost2:       '/on-air-host-2.jpg',
  onAirHost3:       '/on-air-host-3.jpg',
  studioControlRoom: '/studio-control-room.jpg',
  communityEvent:   '/community-event.jpg',
  regionalLandscape: '/regional-landscape.jpg',
} as const

/** Common site defaults — per photo-assignment-board.md */
export const PHOTO_DEFAULTS = {
  hero: HOST_PHOTOS.regionalLandscape,
  regional: HOST_PHOTOS.regionalLandscape,
  studio: HOST_PHOTOS.studioControlRoom,
  football: STATION_PHOTOS.gvlNightPanorama,
  community: STATION_PHOTOS.communityOutdoorMarket,
} as const
