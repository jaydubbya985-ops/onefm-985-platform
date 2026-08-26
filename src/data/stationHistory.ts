/**
 * ONE FM station history — public record + station sources.
 * Master research integrated 2026-07-06. No fabricated stats or awards.
 */

import { MULTICULTURAL_SHOW_COUNT, MULTICULTURAL_SHOWS } from '@/data/programGuide'

export type HistorySource =
  | 'ACMA community licence register'
  | 'ACMA stations book'
  | 'fm985.com.au/about'
  | 'ONE FM Annual Report 2024'
  | 'ONE FM program guide (fm985.com.au/guide)'
  | 'Emergency Management Victoria — community radio guidance'
  | 'Victorian flood event records (regional context)'
  | 'Greater Shepparton City Council records'
  | 'Shepparton News — Ern Meharry retrospective (2022)'
  | 'Victorian Government community leader profiles'
  | 'Southern Community Media Association X-Awards 2019 finalists'
  | 'station archive photos'

/** ACMA public register — callsign 3ONE, community FM Shepparton */
export const ACMA_FACTS = {
  callsign: '3ONE',
  frequency: '98.5 MHz',
  power: '10 kW',
  licenceCommenced: '1 April 1989',
  licenceExpiry: '12 January 2029',
  licensee: 'Goulburn Valley Community Radio Inc.',
} as const

/** Three layers of station origin — not contradictory start dates */
export const ORIGIN_LAYERS = [
  {
    era: 'Late 1970s',
    title: 'Organising phase',
    body: 'Founding activity linked to community leader Nilgun Olcayoz, identified in a Victorian Government profile as a founding member of the Goulburn Valley community radio station dating to the late 1970s.',
    sources: ['Victorian Government community leader profiles'] as HistorySource[],
  },
  {
    era: '1980',
    title: 'Established',
    body: 'ONE FM’s own history pages describe the station as established in 1980 — organisational consolidation before full-time licensed operation.',
    sources: ['fm985.com.au/about'] as HistorySource[],
  },
  {
    era: '1 Apr 1989',
    title: 'Licensed service',
    body: 'ACMA records permanent community broadcasting service 3ONE on 98.5 MHz commencing 1 April 1989. Modern “Since 1989” branding anchors here.',
    sources: ['ACMA community licence register', 'fm985.com.au/about'] as HistorySource[],
  },
] as const

/**
 * Life members + honourees — ONE FM Annual Report 2024.
 * Report tallies 29 life members plus 6 “membership in perpetuity” honourees;
 * names below from report naming (combined public roll).
 */
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

export const LIFE_MEMBER_NOTE =
  '2024 AGM: 29 life members plus 6 membership-in-perpetuity honourees (Annual Report 2024).'

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

/** Legends with archive photography on the public site */
export const HERITAGE_LEGENDS = [
  {
    name: 'Sally Nayler',
    sub: 'On air in Studio A · 1990s',
    img: '/assets/images/heritage-sally-nayler-90s.jpg',
  },
  {
    name: 'Di Hunter',
    sub: '15 years on air · trained 103 presenters',
    img: '/assets/images/heritage-di-hunter-carols-2014.jpg',
  },
  {
    name: 'Ern Meharry',
    sub: 'GVL voice · station historian (Shepparton News, 2022)',
    img: '/assets/images/commentary-box-action.jpg',
  },
  {
    name: 'John Painter',
    sub: 'Dancing Through the Decades · presenters’ rep',
    img: '/assets/images/studio-commentary-selfie.jpg',
  },
] as const

/** Approved emergency narrative (Jay, 2026-07-06) */
export const EMERGENCY_BROADCAST_NARRATIVE: readonly string[] = [
  'A major part of ONE FM\'s history is its role as a local information service during emergencies affecting the Goulburn Valley.',
  'Since the station began permanent licensed broadcasting in 1989, Shepparton and the surrounding towns have lived through repeated flood and storm events. These include major flood events in 1993, the prolonged wet and flood period across 2010–2012, and the major October 2022 flood emergency that affected Shepparton, Mooroopna, Murchison and surrounding communities.',
  'For ONE FM, these events were not abstract regional news stories. They affected the same listeners, volunteers, presenters, sponsors, sporting clubs, schools, service groups and farming communities that formed the station\'s day-to-day broadcast audience.',
  'During flood and emergency periods, local radio became part of the region\'s practical information network. ONE FM was relied upon by sections of the community for emergency broadcasts, local updates, community notices, road and event information, recovery messages and reassurance. This role sat naturally within the station\'s broader identity as a live, local, volunteer-powered community broadcaster serving Shepparton and the wider Goulburn Valley.',
  'The October 2022 floods highlighted the importance of trusted local communication. Thousands of properties across the Shepparton region were inundated or isolated, and reporting after the event identified serious gaps in emergency communication for multicultural communities. Local volunteers and informal community networks played a major role in helping residents access timely information, particularly where official messages were delayed, difficult to access or not available in-language.',
  'This is why ONE FM\'s emergency broadcast history should be understood as part of its civic value. The station was not only a music, sport and events broadcaster. At critical moments, it formed part of the local resilience network: a familiar voice, based in the community, broadcasting to people who knew the station and trusted its connection to place.',
] as const

/** Sport & outside broadcast — sourced narrative */
export const SPORT_HISTORY_NARRATIVE: readonly string[] = [
  'When ONE FM went to air in April 1989, one immediate goal was restoring live local football to the Goulburn Valley airwaves. Ern Meharry’s 2022 Shepparton News retrospective records the first called game in May 1989 — Tungamah Football League vs Northern Tasmanian Football League from Central Park, Shepparton East — followed the next day by GVL vs Bendigo Football League from Deakin Reserve with 3CCC Castlemaine.',
  'The station built a pattern of at least one weekly live GVL game, major clashes, finals across leagues, and netball results. By 2022 local reporting described a decades-long GVL partnership before broadcast rights shifted — significant enough to become news. In June 2022 ONE FM partnered with the Kyabram District League for weekend coverage and finals; GVL match broadcasts returned in 2024, including under-18, reserves and senior grand finals.',
  'Sport on ONE FM extends beyond football: cricket finals, GV and Murray bowls shows, harness racing, motorsport through Sport and Road, and NIRS AFL rebroadcasts. ONE FM Match Day Live Outside Broadcasts were a 2019 SCMA X-Awards finalist (Best OB — community involvement or special event).',
] as const

export const INSTITUTION_FACTS = [
  {
    tag: 'Scale',
    title: 'Regional community broadcaster',
    body: 'fm985.com.au describes ONE FM as one of regional Australia’s largest community stations. Sponsorship copy goes further — treat “largest” as station self-description, not an audited industry ranking. Parliamentary inquiry material once cited six paid staff at Goulburn Valley Community Radio.',
  },
  {
    tag: 'Signal',
    title: '10 kW from Shepparton',
    body: 'ACMA lists 3ONE as a 10 kW community FM service. The station says coverage extends roughly 30 km from Shepparton city centre — Euroa, Nagambie, Benalla and surrounding towns.',
  },
  {
    tag: 'Multicultural',
    title: `${MULTICULTURAL_SHOW_COUNT} shows on the current weekly guide`,
    body: `Listed now on fm985.com.au/guide: ${MULTICULTURAL_SHOWS.map((s) => s.name).join(', ')}. Older AGM reports named additional language strands — those names are not counted unless they are on the current guide.`,
  },
  {
    tag: 'Archive',
    title: 'Recording the Valley',
    body: 'Interviews and outside broadcasts from Shepparton Festival, SAM, Carols by Candlelight, GVL finals, multicultural festivals and local institutions — ONE FM has functioned as an oral history of the district, not only a music outlet.',
  },
] as const

export const HISTORY_MILESTONES = [
  {
    year: '1970s',
    title: 'Organising',
    body: 'Late-1970s founding activity — community radio movement in the Goulburn Valley.',
  },
  {
    year: '1980',
    title: 'Established',
    body: 'Goulburn Valley Community Radio Inc. — volunteers working toward a permanent licence.',
  },
  {
    year: 'Apr 1989',
    title: 'ACMA licensed',
    body: 'Service 3ONE on 98.5 MHz commences 1 April 1989 — 10 kW community FM, Shepparton.',
  },
  {
    year: 'May 1989',
    title: 'First football call',
    body: 'Live call from Central Park, Shepparton East — restoring GVL football to local radio.',
  },
  {
    year: '2014',
    title: '25 years',
    body: 'Council records reference ONE FM celebrating 25 years of broadcasting.',
  },
  {
    year: '2019',
    title: '30 years',
    body: 'Greater Shepparton grant papers: “I heart ONE FM 98.5 celebrating 30 years”.',
  },
  {
    year: '2022',
    title: 'Floods & KDL',
    body: 'October flood emergency; June KDL broadcast partnership when GVL rights shifted.',
  },
  {
    year: '2024',
    title: '35 years',
    body: 'AGM report: 2024 represents the 35th year of local broadcasting for ONE FM.',
  },
] as const

/** Branding return to ONE FM — date of frequency-only phase less documented */
export const BRANDING_NOTE =
  'ONE FM resumed on-air use of callsign branding after community surveys showed listeners said “ONE FM” not frequency alone. Exact date of an earlier frequency-only phase is less securely documented than the return itself.'
