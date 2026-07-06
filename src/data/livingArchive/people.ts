import type { ArchivePerson } from '@/types/livingArchive'
import { BOARD_2024, LIFE_MEMBERS } from '@/data/stationHistory'

const AGM_2024: ArchivePerson['sources'] = [
  { label: 'ONE FM Annual Report 2024', type: 'annual-report', url: 'https://fm985.com.au/about/' },
]

/** Key figures with richer public-record context */
const FEATURED: ArchivePerson[] = [
  {
    id: 'ern-meharry',
    name: 'Ern Meharry',
    categories: ['sport-caller', 'volunteer', 'presenter'],
    roles: ['GVL historian', 'Early volunteer'],
    programs: ['Match Day Live', 'Saturday sport'],
    photo: '/assets/images/commentary-box-action.jpg',
    confidence: 'confirmed-newspaper',
    sources: [
      { label: 'Shepparton News retrospective', type: 'newspaper', date: '2022' },
      { label: 'ONE FM Annual Report 2024', type: 'annual-report' },
    ],
    notes: 'Documented account of May 1989 first football call and GVL partnership.',
  },
  {
    id: 'di-hunter',
    name: 'Di Hunter',
    categories: ['presenter', 'breakfast-host', 'volunteer'],
    years: '15 years on air',
    roles: ['Breakfast host (Fri)', 'Trainer — 103 presenters'],
    photo: '/assets/images/heritage-di-hunter-carols-2014.jpg',
    confidence: 'confirmed-newspaper',
    sources: [{ label: 'Shepparton News profile', type: 'newspaper', date: '2023' }],
  },
  {
    id: 'sally-nayler',
    name: 'Sally Nayler',
    categories: ['presenter'],
    years: '1990s',
    roles: ['Studio A presenter'],
    photo: '/assets/images/heritage-sally-nayler-90s.jpg',
    confidence: 'confirmed-one-fm-document',
    sources: [{ label: 'Station archive photo', type: 'fm985' }],
  },
  {
    id: 'nilgun-olcayoz',
    name: 'Nilgun Olcayoz',
    categories: ['volunteer', 'multicultural'],
    roles: ['Founding member'],
    years: 'Late 1970s',
    confidence: 'confirmed-public',
    sources: [{ label: 'Victorian Government community leader profile', type: 'council' }],
    notes: 'Linked to late-1970s organising phase of Goulburn Valley community radio.',
  },
  {
    id: 'kevin-ryan',
    name: 'Kevin Francis Ryan',
    categories: ['life-member', 'board'],
    roles: ['Chairman 8 years', 'Board 12 years', 'Life member'],
    confidence: 'confirmed-public',
    sources: [{ label: 'Governor-General honours notes', type: 'council', date: '2018' }],
  },
  {
    id: 'vince-vincitorio',
    name: 'Vince Vincitorio',
    categories: ['life-member', 'breakfast-host', 'presenter'],
    roles: ['Breakfast announcer 13 years', 'Life member'],
    confidence: 'confirmed-public',
    sources: [{ label: 'Greater Shepparton Australia Day awards', type: 'council', date: '2025' }],
  },
  {
    id: 'adam-watkins',
    name: 'Adam Watkins',
    categories: ['life-member', 'board', 'technical', 'ob-crew'],
    roles: ['Director', 'Technical Director'],
    confidence: 'confirmed-one-fm-document',
    sources: AGM_2024,
    notes: 'Thanked for facilitating outside broadcasts in 2024 AGM.',
  },
  {
    id: 'rosa-gilberto',
    name: 'Rosa Gilberto',
    categories: ['life-member', 'presenter', 'multicultural'],
    confidence: 'confirmed-one-fm-document',
    sources: AGM_2024,
    notes: 'Departed program presentation after many years (2024 report).',
  },
]

function buildArchivePeople(): ArchivePerson[] {
  const featuredNames = new Set(FEATURED.map((f) => f.name))

  const boardPeople: ArchivePerson[] = BOARD_2024.filter((b) => !featuredNames.has(b.name)).map(
    ({ role, name }) => ({
      id: `board-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      categories: name === 'John Painter' ? ['board', 'presenter', 'breakfast-host'] : ['board'],
      roles: [role],
      confidence: 'confirmed-one-fm-document',
      sources: AGM_2024,
    })
  )

  const boardNames = new Set<string>(BOARD_2024.map((b) => b.name))
  const lifeOnly: ArchivePerson[] = LIFE_MEMBERS.filter(
    (name) => !featuredNames.has(name) && !boardNames.has(name)
  ).map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    categories: ['life-member', 'volunteer'],
    confidence: 'confirmed-one-fm-document',
    sources: AGM_2024,
  }))

  return [...FEATURED, ...boardPeople, ...lifeOnly]
}

export const ARCHIVE_PEOPLE = buildArchivePeople()
