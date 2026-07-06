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

/**
 * Floods, emergencies and ONE FM's public-service role.
 * Approved narrative copy (Jay, 2026-07-06). Per-event broadcast logs:
 * archive hunt ongoing — see station oral-history notes in repo.
 * Context: Victorian flood records; EMV community-radio guidance; fm985.com.au/about.
 */
export const EMERGENCY_BROADCAST_NARRATIVE: readonly string[] = [
  'A major part of ONE FM\'s history is its role as a local information service during emergencies affecting the Goulburn Valley.',
  'Since the station began permanent licensed broadcasting in 1989, Shepparton and the surrounding towns have lived through repeated flood and storm events. These include major flood events in 1993, the prolonged wet and flood period across 2010–2012, and the major October 2022 flood emergency that affected Shepparton, Mooroopna, Murchison and surrounding communities.',
  'For ONE FM, these events were not abstract regional news stories. They affected the same listeners, volunteers, presenters, sponsors, sporting clubs, schools, service groups and farming communities that formed the station\'s day-to-day broadcast audience.',
  'During flood and emergency periods, local radio became part of the region\'s practical information network. ONE FM was relied upon by sections of the community for emergency broadcasts, local updates, community notices, road and event information, recovery messages and reassurance. This role sat naturally within the station\'s broader identity as a live, local, volunteer-powered community broadcaster serving Shepparton and the wider Goulburn Valley.',
  'The October 2022 floods highlighted the importance of trusted local communication. Thousands of properties across the Shepparton region were inundated or isolated, and reporting after the event identified serious gaps in emergency communication for multicultural communities. Local volunteers and informal community networks played a major role in helping residents access timely information, particularly where official messages were delayed, difficult to access or not available in-language.',
  'This is why ONE FM\'s emergency broadcast history should be understood as part of its civic value. The station was not only a music, sport and events broadcaster. At critical moments, it formed part of the local resilience network: a familiar voice, based in the community, broadcasting to people who knew the station and trusted its connection to place.',
] as const

export const EMERGENCY_BROADCAST_TITLE = 'Floods, emergencies and ONE FM\'s public-service role'

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
    body: 'October floods across Shepparton, Mooroopna and Murchison — ONE FM part of the local information network when communities were cut off.',
    sources: ['Victorian flood event records (regional context)', 'Emergency Management Victoria — community radio guidance'] as HistorySource[],
  },
  {
    year: '2026',
    title: 'Live & Local — Always',
    body: 'Volunteer-run, community-owned — still broadcasting 24/7 from Shepparton across the Goulburn Murray.',
    sources: ['fm985.com.au/about'] as HistorySource[],
  },
] as const
