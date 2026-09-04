import type { ArchiveCard, DecadeId } from '@/types/livingArchive'

export const DECADES: { id: DecadeId; label: string; intro: string }[] = [
  {
    id: '1980s',
    label: '1980s',
    intro:
      'Organising in the late 1970s, established in 1980, licensed 1 April 1989. Volunteers build the mixing panel; May 1989 brings the first live football call.',
  },
  {
    id: '1990s',
    label: '1990s',
    intro:
      'Multicultural programming expands. Sally Nayler in Studio A. GVL partnership deepens. 24/7 broadcasting and the OB truck on the road.',
  },
  {
    id: '2000s',
    label: '2000s',
    intro:
      'Online streaming at fm985.com.au. New studios. The station becomes a permanent part of the Valley\'s weekend rhythm.',
  },
  {
    id: '2010s',
    label: '2010s',
    intro:
      '25 years in 2014, 30 years in 2019. Wet years across 2010–2012. SCMA X-Awards finalist for Match Day Live OBs.',
  },
  {
    id: '2020s',
    label: '2020s',
    intro:
      'October 2022 floods. KDL partnership. GVL returns 2024. 35th year of local broadcasting. Living archive begins.',
  },
]

/** Curated evidence cards — grow via Wayback, newspapers, AGM PDFs */
export const ARCHIVE_CARDS: ArchiveCard[] = [
  {
    id: 'licence-1989',
    decade: '1980s',
    year: 1989,
    topic: 'origins',
    cardType: 'milestone',
    title: 'ACMA licence commences',
    body: 'Service 3ONE on 98.5 MHz — 10 kW community FM, Shepparton. 1 April 1989.',
    confidence: 'confirmed-public',
    sources: [{ label: 'ACMA community licence register', type: 'acma', date: '1989-04-01' }],
    places: ['Shepparton'],
  },
  {
    id: 'first-football-1989',
    decade: '1980s',
    year: 1989,
    topic: 'sport',
    cardType: 'football',
    title: 'First live football call',
    body: 'Tungamah FL vs Northern Tasmanian FL from Central Park, Shepparton East — May 1989.',
    confidence: 'confirmed-newspaper',
    sources: [{ label: 'Shepparton News — Ern Meharry', type: 'newspaper', date: '2022' }],
    people: ['Ern Meharry'],
    places: ['Shepparton East'],
  },
  {
    id: 'panel-1988',
    decade: '1980s',
    year: 1988,
    topic: 'origins',
    cardType: 'photo',
    title: 'The 1988 mixing panel',
    body: 'Original desk built in-house — still in the studio.',
    confidence: 'confirmed-one-fm-document',
    sources: [{ label: 'Station archive', type: 'fm985' }],
    image: '/assets/images/heritage-original-panel-1988.jpg',
  },
  {
    id: '25-years-2014',
    decade: '2010s',
    year: 2014,
    topic: 'event',
    cardType: 'event',
    title: '25 years on air',
    body: 'Council records reference ONE FM celebrating 25 years of broadcasting.',
    confidence: 'confirmed-public',
    sources: [{ label: 'Greater Shepparton City Council', type: 'council', date: '2014' }],
  },
  {
    id: '30-years-2019',
    decade: '2010s',
    year: 2019,
    topic: 'event',
    cardType: 'event',
    title: '30 years — country music festival',
    body: '“I heart ONE FM 98.5 celebrating 30 years” — council grant papers.',
    confidence: 'confirmed-public',
    sources: [{ label: 'Greater Shepparton grant records', type: 'council', date: '2019' }],
  },
  {
    id: 'x-awards-2019',
    decade: '2010s',
    year: 2019,
    topic: 'sport',
    cardType: 'award',
    title: 'SCMA X-Awards finalist',
    body: 'ONE FM Match Day Live Outside Broadcasts — finalist, Best OB (community involvement or special event).',
    confidence: 'confirmed-public',
    sources: [{ label: 'Southern Community Media Association', type: 'council', date: '2019' }],
  },
  {
    id: 'floods-2022',
    decade: '2020s',
    year: 2022,
    topic: 'emergency',
    cardType: 'emergency',
    title: 'October 2022 floods',
    body: 'Goulburn River peak ~12.05 m at Shepparton — thousands of properties inundated or isolated. Local information networks critical.',
    confidence: 'confirmed-public',
    sources: [{ label: 'Victorian flood event records', type: 'council', date: '2022-10' }],
    places: ['Shepparton', 'Mooroopna', 'Murchison'],
  },
  {
    id: 'gvl-return-2024',
    decade: '2020s',
    year: 2024,
    topic: 'sport',
    cardType: 'football',
    title: 'GVL broadcasts return',
    body: 'GVL match broadcasts returned in 2024, including under-18, reserves and senior grand finals.',
    confidence: 'confirmed-newspaper',
    sources: [{ label: 'Shepparton News', type: 'newspaper', date: '2024' }],
  },
  {
    id: '35-years-2024',
    decade: '2020s',
    year: 2024,
    topic: 'governance',
    cardType: 'milestone',
    title: '35th year of local broadcasting',
    body: '2024 AGM: “2024 represents the 35th year of local broadcasting for ONE FM.”',
    confidence: 'confirmed-one-fm-document',
    sources: [{ label: 'ONE FM Annual Report 2024', type: 'annual-report' }],
  },
]

export function cardsForDecade(decade: DecadeId): ArchiveCard[] {
  return ARCHIVE_CARDS.filter((c) => c.decade === decade)
}
