/**
 * Canonical ONE FM photo library — /public/assets/images/
 * Filenames match the locked asset naming spec.
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
  gvlSpectacularMark: `${IMG}/gvl-spectacular-mark.jpg`,
  gvlChampionshipMcg: `${IMG}/gvl-championship-mcg.jpg`,
  fieldReporterHeadset: `${IMG}/field-reporter-headset.png`,

  // Studio & volunteer faces
  studioChristmasBroadcast: `${IMG}/studio-christmas-broadcast.jpg`,
  studioExteriorRainbow: `${IMG}/studio-exterior-rainbow.jpg`,
  studioCommentarySelfie: `${IMG}/studio-commentary-selfie.jpg`,
  studioSbsDiversity: `${IMG}/studio-sbs-diversity.jpg`,
  studioPanelInterview: `${IMG}/studio-panel-interview.jpg`,
  studioAnnouncerMic: `${IMG}/studio-announcer-mic.png`,
  communityDinnerTeam: `${IMG}/community-dinner-team.png`,

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
  cultureRiverboatMurray: `${IMG}/culture-riverboat-murray.jpg`,
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
  geoCanolaFence: `${IMG}/geo-canola-fence.png`,
  geoCanolaTree: `${IMG}/geo-canola-tree.png`,
  ecoSolarFarm: `${IMG}/eco-solar-farm.png`,
  ecoTractorSunrise: `${IMG}/eco-tractor-sunrise.png`,

  // Community grassroots
  communityBookStall: `${IMG}/community-book-stall.jpg`,
  communityOutdoorMarket: `${IMG}/community-outdoor-market.jpg`,
} as const

/** Common site defaults */
export const PHOTO_DEFAULTS = {
  hero: STATION_PHOTOS.geoLakeAerial,
  regional: STATION_PHOTOS.geoLakeAerial,
  studio: STATION_PHOTOS.studioExteriorRainbow,
  football: STATION_PHOTOS.gvlNightPanorama,
  community: STATION_PHOTOS.communityOutdoorMarket,
} as const
