/**
 * Recent station activity scanned from fm985.com.au WP REST (26 Aug 2026).
 * Dates and titles are the live posts. Awarded $ / crowd sizes: not in the
 * posts — do not invent them. Use these for coverage pins + home cards.
 */
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

export const RECENT_STATION_ACTIVITY: StationActivity[] = [
  {
    id: 'yorta-yorta-turtles-2026-07-27',
    date: '2026-07-27',
    title: 'Percy Dryden, Sheala & Jayden ‘Chainbreaker’ Atkinson — Yorta Yorta Turtles basketball',
    town: 'Shepparton',
    kind: 'sport',
    sourceUrl:
      'https://fm985.com.au/sport/super-sport/yorta-yorta-turtles/percy-dryden-sheala-jayden-chainbreaker-atkinson-from-the-yorta-yorta-turtles-basketball-side/',
    contextImg: '/assets/images/gvl-action-sprint.jpg',
  },
  {
    id: 'kidstown-petition-2026-07-17',
    date: '2026-07-17',
    title: 'Rowan Farren-Parnell with Rena & Aurora — Mooroopna Steering Committee Kidstown petition',
    town: 'Mooroopna',
    kind: 'community',
    sourceUrl:
      'https://fm985.com.au/interview/rowan-farren-parnell-with-rena-aurora-from-the-mooroopna-steering-committee-on-a-kidstown-petition/',
    contextImg: '/assets/images/community-book-stall.jpg',
  },
  {
    id: 'visitor-centre-2026-07-24',
    date: '2026-07-24',
    title: 'Maree from the Visitor Centre — what’s on this weekend in the Goulburn Valley',
    town: 'Shepparton',
    kind: 'interview',
    sourceUrl:
      'https://fm985.com.au/interview/maree-from-the-visitor-centre-talks-whats-on-this-weekend-in-the-goulburn-valley-24-7-26/',
    contextImg: '/assets/images/studio-presenter-mic.jpg',
  },
  {
    id: 'gvl-finals-window-2026',
    date: '2026-08-29',
    title: 'GVL finals window — first weekend 29–30 Aug 2026 (home-and-away closed 22 Aug)',
    town: 'Shepparton',
    kind: 'sport',
    sourceUrl: 'https://fm985.com.au/sport/',
    contextImg: '/assets/images/gvl-night-panorama.jpg',
  },
]
