/**
 * ONE FM station history — verified public sources only.
 * Oral-history / per-event broadcast claims marked verifyPending until
 * AGM minutes, audio archive, or news article is linked.
 */

export type HistorySource =
  | 'fm985.com.au/about'
  | 'ONE FM Annual Report 2024'
  | 'ONE FM program guide (fm985.com.au/guide)'
  | 'Emergency Management Victoria — community radio guidance'
  | 'Victorian flood event records (regional context)'
  | 'station archive photos'

export interface SourcedParagraph {
  body: string
  sources: HistorySource[]
  /** True when station-specific broadcast role needs AGM/audio/news confirmation */
  verifyPending?: boolean
}

/** Life members — ONE FM Annual Report 2024 (fm985.com.au/about → Annual Report) */
export const LIFE_MEMBERS: readonly string[] = [
  'Jason Aspland',
  'Ron Batt',
  'Ruth Batt',
  'Ken Austin',
  'Rod Dickman',
  'Jean Dickman',
  'Gary Baker',
  'Azem Elmaz',
  'Sue Baker',
  'Lorna Greenwood',
  'Trish Britten',
  'Tom Haigh',
  'Brian Caughey',
  'Bruce Quick',
  'Rosa Gilberto',
  'John Harbord',
  'Les Harrison',
  'Tony Jerome',
  'Judith Johnson',
  'Martin Klaver',
  'Wendee Long',
  'Graeme Macartney',
  'Daryl McKenzie',
  'Ern Meharry',
  'Joy Mirtschin',
  'Pejay Mirtschin',
  'Margaret Newey',
  'Geoff Parry',
  'Kevin Ryan',
  'Neil Short',
  'Alan Tattersall',
  'Dave Taylor',
  'Ken Tuckett',
  'Vince Vincitorio',
  'Adam Watkins',
  'Paul Watters',
  'Jason Welsh',
] as const

/** Board & governance — 2024 Annual Report */
export const BOARD_2024 = [
  { role: 'Chairperson', name: 'Christine Parnell' },
  { role: 'Vice Chairperson', name: 'Jason Welsh' },
  { role: 'Secretary', name: 'Susan Parnell' },
  { role: 'Treasurer', name: 'Mark Owens' },
  { role: 'Presenters’ Rep', name: 'John Painter' },
  { role: 'Director', name: 'Adam Watkins' },
  { role: 'Director', name: 'Josh Revens' },
  { role: 'Director', name: 'Andrew Skinner' },
] as const

/** Presenters named in 2024 report — arrivals & departures */
export const PRESENTER_CHANGES_2024 = {
  arrivals: [
    'Shawn Pleming (breakfast)',
    'Sue Bell',
    'Fikiri Dieu-Bonne',
    'Tym Jefferys',
    'Jimmy Li',
    'Steve Little',
    'James Mann',
    'James Manley',
    'Reena',
    'Yasmine',
  ],
  departures: ['Terri Cowley (breakfast)', 'Rosa Gilberto', 'Dave Taylor'],
} as const

/** Legends with archive photography on the public site */
export const HERITAGE_LEGENDS = [
  {
    name: 'Sally Nayler',
    sub: 'On air in Studio A · 1990s',
    img: '/assets/images/heritage-sally-nayler-90s.jpg',
    sources: ['station archive photos'] as HistorySource[],
  },
  {
    name: 'Di Hunter',
    sub: 'On air since the early days',
    img: '/assets/images/heritage-di-hunter-carols-2014.jpg',
    sources: ['station archive photos'] as HistorySource[],
  },
  {
    name: 'Les Harrison',
    sub: 'Community host · education & Lions Club',
    img: '/assets/images/commentary-box-action.jpg',
    sources: ['ONE FM program guide (fm985.com.au/guide)'] as HistorySource[],
  },
  {
    name: 'John Painter',
    sub: 'Dancing Through the Decades · board presenter rep',
    img: '/assets/images/studio-commentary-selfie.jpg',
    sources: ['ONE FM Annual Report 2024', 'ONE FM program guide (fm985.com.au/guide)'] as HistorySource[],
  },
] as const

export const FLOOD_RESILIENCE: SourcedParagraph[] = [
  {
    body:
      'Since ONE FM began permanent licensed broadcasting in 1989, flooding has remained one of the defining natural-disaster risks for the Goulburn Valley. The station’s service area sits across the Goulburn–Broken floodplain — Shepparton, Mooroopna, Kialla, Murchison, Tallygaroopna, Katandra West, Congupna and surrounding farming communities.',
    sources: ['fm985.com.au/about', 'Victorian flood event records (regional context)'],
  },
  {
    body:
      'Major flood years in living memory include 1993 in communities such as Tallygaroopna, a prolonged wet period across 2010–2012 that produced repeated major flood impacts across the Goulburn–Broken system, and the October 2022 emergency when the Goulburn River peaked at about 12.05 metres at Shepparton — thousands of properties inundated or isolated across the region.',
    sources: ['Victorian flood event records (regional context)'],
  },
  {
    body:
      'For ONE FM, these were not abstract regional news stories. They affected the same listeners, volunteers, presenters, clubs and towns that form the station’s daily audience. During flood and emergency periods, the station has been relied on as part of the local information network — community notices, updates, recovery messages and reassurance alongside sport, events and multicultural programming.',
    sources: ['fm985.com.au/about', 'Emergency Management Victoria — community radio guidance'],
    verifyPending: true,
  },
  {
    body:
      'The October 2022 floods also showed why trusted local, multilingual communication matters in Greater Shepparton. Reporting after the event identified gaps in translated emergency information; informal volunteer networks helped share road closures and safety messages. That aligns with ONE FM’s long-running multicultural programming and community-information role.',
    sources: ['Victorian flood event records (regional context)', 'fm985.com.au/about'],
  },
]

export const HISTORY_MILESTONES = [
  {
    year: '1980',
    title: 'Founded',
    body: 'Goulburn Valley Community Radio Inc. established in Shepparton — volunteers building a community voice for regional Victoria.',
    sources: ['fm985.com.au/about'] as HistorySource[],
  },
  {
    year: '1989',
    title: 'Licensed Broadcaster',
    body: 'Permanent full-time licence granted. ONE FM 98.5 (callsign 3ONE) begins licensed FM transmissions across the Goulburn Murray.',
    sources: ['fm985.com.au/about'] as HistorySource[],
  },
  {
    year: '1990',
    title: 'Multicultural Programming',
    body: 'Dedicated language and multicultural shows connect Italian, Samoan, and diverse Valley communities on the dial.',
    sources: ['fm985.com.au/about'] as HistorySource[],
  },
  {
    year: '2005',
    title: 'Online Streaming',
    body: 'Live stream at fm985.com.au — the Valley on air wherever listeners are, across Australia and beyond.',
    sources: ['fm985.com.au/about'] as HistorySource[],
  },
  {
    year: '2010',
    title: 'GVL Football & Netball',
    body: 'ONE FM becomes the broadcast partner for Goulburn Valley League — live match calls every weekend.',
    sources: ['ONE FM program guide (fm985.com.au/guide)'] as HistorySource[],
  },
  {
    year: '2022',
    title: 'Flood Emergency',
    body: 'October floods across the Goulburn–Broken — local information networks, including community radio, carried updates when towns were cut off.',
    sources: ['Victorian flood event records (regional context)', 'Emergency Management Victoria — community radio guidance'],
    verifyPending: true,
  },
  {
    year: '2026',
    title: 'Live & Local — Always',
    body: 'Volunteer-run, community-owned — still broadcasting 24/7 from Shepparton across the Goulburn Murray.',
    sources: ['fm985.com.au/about'] as HistorySource[],
  },
] as const
