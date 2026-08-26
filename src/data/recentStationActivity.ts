/**
 * Recent station activity scanned from fm985.com.au WP REST (26 Aug 2026).
 * Dates, titles and sourceUrl are the live posts. Awarded $ / crowd sizes /
 * listener counts: not in the posts — do not invent them.
 * Featured images on WP are mostly SoundCloud artwork — contextImg is a
 * station library photo (sport → GVL, interview → studio mic).
 *
 * July–August 2026 WP posts: latest dated 27 Jul 2026. No August 2026
 * interview/sport posts were in the API on scan day. GVL finals window is
 * a scheduled weekend (29–30 Aug), sourced to the sport section, not a post.
 */
import { towns } from '@/data/townData'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

export interface StationActivity {
  id: string
  date: string
  title: string
  town: string
  kind: 'interview' | 'sport' | 'community'
  sourceUrl: string
  /** Station library photo that matches the event type — not the WP artwork unless it is ours. */
  contextImg: string
}

export function inferActivityTown(title: string): string {
  const hay = title.toLowerCase()
  const hit = towns.find((t) => {
    const name = t.name.replace(' (NSW)', '').toLowerCase()
    return hay.includes(name)
  })
  return hit?.name ?? 'Shepparton'
}

export const RECENT_STATION_ACTIVITY: StationActivity[] = [
  {
    id: 'gvl-finals-window-2026',
    date: '2026-08-29',
    title: 'GVL finals window — first weekend 29–30 Aug 2026 (home-and-away closed 22 Aug)',
    town: 'Shepparton',
    kind: 'sport',
    sourceUrl: 'https://fm985.com.au/sport/',
    contextImg: STATION_PHOTOS.gvlNightPanorama,
  },
  {
    id: 'yorta-yorta-turtles-2026-07-27',
    date: '2026-07-27',
    title: 'Percy Dryden, Sheala & Jayden ‘Chainbreaker’ Atkinson — Yorta Yorta Turtles basketball',
    town: 'Shepparton',
    kind: 'sport',
    sourceUrl:
      'https://fm985.com.au/sport/super-sport/yorta-yorta-turtles/percy-dryden-sheala-jayden-chainbreaker-atkinson-from-the-yorta-yorta-turtles-basketball-side/',
    contextImg: STATION_PHOTOS.gvlActionSprint,
  },
  {
    id: 'sport-and-road-2026-07-25',
    date: '2026-07-27',
    title: 'Sport And Road — July 25, 2026',
    town: 'Shepparton',
    kind: 'sport',
    sourceUrl: 'https://fm985.com.au/sport/super-sport/sport-and-road/sport-and-road-july-25-2026/',
    contextImg: STATION_PHOTOS.gvlStadiumDay,
  },
  {
    id: 'square-gaiters-2026-07-25',
    date: '2026-07-27',
    title: 'Square Gaiters — The Harness Racing Show — July 25, 2026',
    town: 'Shepparton',
    kind: 'sport',
    sourceUrl:
      'https://fm985.com.au/sport/super-sport/square-gaiters/square-gaiters-the-harness-racing-show-july-25-2026/',
    contextImg: STATION_PHOTOS.gvlCrowdStands,
  },
  {
    id: 'hole-in-one-2026-07-25',
    date: '2026-07-27',
    title: 'Hole In One — Golf Show — July 25, 2026',
    town: 'Shepparton',
    kind: 'sport',
    sourceUrl: 'https://fm985.com.au/sport/super-sport/hole-in-one/hole-in-one-golf-show-july-25-2026/',
    contextImg: STATION_PHOTOS.gvlPlayerHighFive,
  },
  {
    id: 'visitor-centre-2026-07-24',
    date: '2026-07-24',
    title: 'Maree from the Visitor Centre — what’s on this weekend in the Goulburn Valley',
    town: 'Shepparton',
    kind: 'interview',
    sourceUrl:
      'https://fm985.com.au/interview/maree-from-the-visitor-centre-talks-whats-on-this-weekend-in-the-goulburn-valley-24-7-26/',
    contextImg: STATION_PHOTOS.studioPresenterMic,
  },
  {
    id: 'jack-elliott-wheelchair-afl-2026-07-17',
    date: '2026-07-17',
    title: 'Collingwood Wheelchair AFL player Jack Elliott ahead of Shepparton match vs St. Kilda',
    town: 'Shepparton',
    kind: 'sport',
    sourceUrl:
      'https://fm985.com.au/interview/collingwood-wheelchair-afl-player-jack-elliott-ahead-of-their-shepparton-match-vs-st-kilda/',
    contextImg: STATION_PHOTOS.gvlActionSprint,
  },
  {
    id: 'kidstown-petition-2026-07-17',
    date: '2026-07-17',
    title: 'Rowan Farren-Parnell with Rena & Aurora — Mooroopna Steering Committee Kidstown petition',
    town: 'Mooroopna',
    kind: 'community',
    sourceUrl:
      'https://fm985.com.au/interview/rowan-farren-parnell-with-rena-aurora-from-the-mooroopna-steering-committee-on-a-kidstown-petition/',
    contextImg: STATION_PHOTOS.communityBookStall,
  },
  {
    id: 'redda-humphries-beyond-blue-2026-07-17',
    date: '2026-07-17',
    title: 'Jay ‘Redda’ Humphries preparing to run a half marathon for Beyond Blue',
    town: 'Shepparton',
    kind: 'community',
    sourceUrl:
      'https://fm985.com.au/interview/jay-redda-humphries-who-is-preparing-to-run-a-half-marathon-for-beyond-blue/',
    contextImg: STATION_PHOTOS.communityBookStall,
  },
  {
    id: 'bill-winters-roadsafe-2026-07-10',
    date: '2026-07-10',
    title: 'Johnny Painter interviews Bill Winters from RoadSafe Goulburn Valley',
    town: 'Shepparton',
    kind: 'interview',
    sourceUrl:
      'https://fm985.com.au/interview/johnny-painter-interviews-bill-winters-from-roadsafe-goulburn-valley-july-10-2026/',
    contextImg: STATION_PHOTOS.studioPresenterMic,
  },
  {
    id: 'lauren-darby-pelicount-2026-07-10',
    date: '2026-07-10',
    title: 'Lauren Darby from Coast Rescue about PeliCount 2026',
    town: 'Shepparton',
    kind: 'interview',
    sourceUrl: 'https://fm985.com.au/interview/lauren-darby-from-coast-rescue-about-pelicount-2026/',
    contextImg: STATION_PHOTOS.studioPresenterMic,
  },
  {
    id: 'locksmith-scam-warning-2026-07-10',
    date: '2026-07-10',
    title: 'The Melbourne Locksmith Scam Warning',
    town: 'Shepparton',
    kind: 'community',
    sourceUrl: 'https://fm985.com.au/news/the-melbourne-locksmith-scam-warning/',
    contextImg: STATION_PHOTOS.communityBookStall,
  },
  {
    id: 'damian-callinan-dookie-2026-07-03',
    date: '2026-07-03',
    title: 'Comedian Damian Callinan on ‘Hall Stories’ at the Dookie Hall',
    town: 'Shepparton',
    kind: 'interview',
    sourceUrl:
      'https://fm985.com.au/interview/comedian-damian-callinan-on-his-upcoming-show-hall-stories-at-the-dookie-hall/',
    contextImg: STATION_PHOTOS.studioPresenterMic,
  },
  {
    id: 'steve-bell-di-hunter-2026-07-03',
    date: '2026-07-03',
    title: 'Country singer Steve Bell in the ONE FM studio with Di Hunter',
    town: 'Shepparton',
    kind: 'interview',
    sourceUrl: 'https://fm985.com.au/interview/country-singer-steve-bell-in-the-one-fm-studio-with-di-hunter/',
    contextImg: STATION_PHOTOS.studioChristmasBroadcast,
  },
]
